import { type CleanupCallback, toCamel, vue, waitFor } from '@fiction/core'
import type { Site, SiteSettings } from '../index.js'
import type { CardConfigPortable, TableSiteConfig } from '../tables.js'
import { Card } from '../card.js'
import { setPages } from './page.js'

// Define a type for the hooks to ensure type safety
export type QueryVarHook = {
  key: string
  callback: (args: { site: Site, value: string }) => Promise<void | { reload?: boolean }> | void | { reload?: boolean }
}

// This function encapsulates the watcher logic
export function setupRouteWatcher(args: { site: Site, queryVarHooks: QueryVarHook[] }): CleanupCallback {
  const { site, queryVarHooks } = args
  const fictionEnv = site.fictionSites.fictionEnv
  if (typeof window === 'undefined') {
    return
  }

  const sw = vue.watch(
    () => site.siteRouter.current.value,
    async (route) => {
      if (!route)
        return

      const routeVars = { ...route.params, ...route.query } as Record<string, string | undefined>

      for (const hook of queryVarHooks) {
        const { key } = hook
        if (routeVars[key]) {
          const result = await hook.callback({ site, value: routeVars[key] })
          if (result?.reload) {
            const url = new URL(window.location.href)
            url.searchParams.delete(key)
            window.location.href = url.toString()
          }
          else {
            // remove from query params
            const url = new URL(window.location.href)
            url.searchParams.delete(key)
            window.history.replaceState({}, '', url.toString())
          }
        }
      }
    },
    { immediate: true },
  )

  fictionEnv.cleanupCallbacks.push(() => sw())
}

export function setSections(args: { site: Site, sections?: Record<string, CardConfigPortable>, themeSections?: Record<string, CardConfigPortable> }) {
  const { site, sections = {}, themeSections = {} } = args

  // get existing section config, note that on first time its setting sections to site.sections is missing
  const existingSections: Record<string, CardConfigPortable> = Object.fromEntries(Object.entries(site.sections?.value || {}).map(([k, v]) => [k, v.toConfig()]))

  // Access theme and page template sections

  const pageTemplateSections = site.pages.value.reduce((acc, page) => {
    const pageSections = page.tpl.value?.settings.sections || {}
    return { ...acc, ...pageSections }
  }, {} as Record<string, CardConfigPortable>)

  // Unified all section IDs including page template sections
  const allSectionIds = [...new Set(
    [existingSections, sections, themeSections, pageTemplateSections].flatMap(Object.keys),
  )]

  return allSectionIds.reduce((acc, sectionId) => {
    // scope is set by the original source of the section
    const scope = pageTemplateSections[sectionId] ? 'template' : 'site'

    const config = sections[sectionId] || existingSections[sectionId] || themeSections[sectionId] || pageTemplateSections[sectionId] || {}

    acc[sectionId] = new Card({ ...config, regionId: sectionId, site, scope })
    return acc
  }, {} as Record<string, Card>)
}

export async function localSiteConfig(args: { siteId: string, fields?: Partial<TableSiteConfig> }) {
  const { siteId, fields } = args
  if (typeof localStorage === 'undefined')
    return {}

  const k = `static-${siteId}`
  let conf = JSON.parse(localStorage.getItem(k) || '{}')

  if (fields) {
    conf = { ...conf, ...fields }
    localStorage.setItem(k, JSON.stringify(conf))
  }

  return conf
}

export async function saveSite(args: { site: Site, onlyKeys?: (keyof TableSiteConfig)[], delayUntilSaveConfig?: Partial<TableSiteConfig>, successMessage: string, isPublishingDomains?: boolean, minTime?: number }) {
  const { site, onlyKeys, delayUntilSaveConfig, successMessage, isPublishingDomains, minTime } = args

  const config = site.toConfig()

  if (!config.siteId)
    throw new Error('no siteId')

  let fields: Partial<TableSiteConfig> = { siteId: config.siteId }
  if (!onlyKeys)
    fields = config

  else
    onlyKeys.forEach(<T extends keyof TableSiteConfig>(key: T) => (fields[key] = config[key]))

  if (delayUntilSaveConfig)
    fields = { ...fields, ...delayUntilSaveConfig }

  // save locally if coding as site doesn't exist
  if (site.settings.isStatic) {
    await waitFor(500)
    return localSiteConfig({ siteId: config.siteId, fields })
  }

  const r = await site.settings.fictionSites.requests.ManageSite.projectRequest({
    _action: 'update',
    fields,
    where: { siteId: config.siteId },
    successMessage,
    isPublishingDomains,
    caller: 'saveSite',
  }, { minTime })

  updateSite({ site, newConfig: r.data || {} })

  return r.data
}

export function updateSite(args: { site: Site, newConfig: Partial<SiteSettings> }) {
  const { site, newConfig } = args
  if (!newConfig)
    return

  const availableKeys = ['title', 'userConfig', 'changeId', 'subDomain', 'customDomains', 'themeId', 'status']
  const entries = Object.entries(newConfig).filter(([key]) => availableKeys.includes(key))

  entries.forEach(([key, value]) => {
    if (value !== undefined && vue.isRef(site[key as keyof typeof site]))
      (site[key as keyof typeof site] as vue.Ref).value = value
  })

  const { editor, pages, sections } = newConfig

  if (editor)
    site.editor.value = { ...site.editor.value, ...editor }

  if (pages) {
    site.pages.value = setPages({ site, pages })
    site.sections.value = setSections({ site })
  }

  if (sections)
    site.sections.value = setSections({ site, sections })

  return site
}

export function activeSiteHostname(site: Site, opts: { isProd?: boolean } = {}) {
  return vue.computed(() => {
    const isProd = opts.isProd ?? site.isProd.value
    const sub = site.subDomain.value || 'NO_SUB_DOMAIN'
    const app = site.fictionSites.settings.fictionAppSites
    const base = isProd ? app?.liveUrl.value : app?.localUrl.value

    if (isProd && !base.includes('*'))
      console.error(`liveUrl must include a wildcard (*) - ${base}`)

    const full = base.replace('*', sub)
    try {
      return full ? new URL(full).hostname : ''
    }
    catch (e) {
      console.error(`Invalid URL encountered in getSiteHostname: ${full}`)

      return ''
    }
  })
}

export function activeSiteDisplayUrl(site: Site, opts: { isProd?: boolean, mode: 'display' | 'staging' }) {
  return vue.computed(() => {
    const { mode, isProd = site.isProd.value } = opts
    const port = site.fictionSites.settings.fictionAppSites?.port.value

    if (site.primaryCustomDomain.value && mode === 'display') {
      return `https://${site.primaryCustomDomain.value}`
    }
    else {
      const hostname = activeSiteHostname(site).value
      const baseUrl = isProd ? `https://${hostname}` : `http://${hostname}:${port}`
      return baseUrl
    }
  })
}

export function staticFileUrl(args: { site: Site, filename: string }) {
  const { site, filename } = args
  const siteUrl = activeSiteDisplayUrl(site, { mode: 'staging' }).value
  return [siteUrl, '__static', filename].join('/')
}

type Camelize<S extends string> = S extends `${infer T}-${infer U}`
  ? `${Lowercase<T>}${Capitalize<Camelize<U>>}`
  : Lowercase<S>

type CamelizeFileNames<T extends readonly string[]> = {
  [K in T[number] as Camelize<K extends `${infer Base}.${string}` ? Base : K>]: string;
}

export function staticFileUrls<T extends readonly string[]>(args: { site: Site, filenames: T }): CamelizeFileNames<T> {
  const { site, filenames } = args
  const siteUrl = activeSiteDisplayUrl(site, { mode: 'staging' }).value
  const result = {} as CamelizeFileNames<T>

  filenames.forEach((filename) => {
    const baseFilename = filename.replace(/\.[^/.]+$/, '') // Remove the file extension
    const camelCaseName = toCamel(baseFilename) as keyof CamelizeFileNames<T>
    result[camelCaseName] = `${siteUrl}/__static/${filename}` as CamelizeFileNames<T>[typeof camelCaseName]
  })

  return result
}
