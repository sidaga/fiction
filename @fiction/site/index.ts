import { FictionPlugin, getAnonymousId, safeDirname, vue } from '@fiction/core'
import type { FictionApp, FictionDb, FictionEmail, FictionEnv, FictionMedia, FictionPluginSettings, FictionRouter, FictionServer, FictionUser } from '@fiction/core'
import { EnvVar, vars } from '@fiction/core/plugin-env'
import type { FictionAi } from '@fiction/plugin-ai'
import type { FictionMonitor } from '@fiction/plugin-monitor'
import type { FictionAdmin } from '@fiction/admin/index.js'
import type { FictionAnalytics } from '@fiction/analytics/index.js'
import { initializeClientTag } from '@fiction/analytics/tag/entry.js'
import { ManageIndex, ManagePage, ManageSite } from './endpoint.js'
import { CardQueryHandler } from './cardQuery.js'
import { tables } from './tables.js'
import { ManageCert } from './endpoint-certs.js'
import { getRoutes } from './routes.js'
import type { Theme } from './theme.js'
import { FictionSiteBuilder } from './plugin-builder/index.js'
import { loadSitemap } from './load.js'
import type { Site } from './site.js'

export * from './site.js'
export * from './card.js'
export * from './theme.js'
export * from './tables.js'

vars.register(() => [new EnvVar({ name: 'FLY_API_TOKEN' })])

export type SitesPluginSettings = {
  fictionEnv: FictionEnv
  fictionDb: FictionDb
  fictionUser?: FictionUser
  fictionEmail: FictionEmail
  fictionServer: FictionServer
  fictionApp: FictionApp
  fictionRouter: FictionRouter
  fictionAdmin: FictionAdmin
  fictionMonitor?: FictionMonitor
  fictionAi?: FictionAi
  fictionAnalytics?: FictionAnalytics
  fictionMedia: FictionMedia
  fictionAppSites: FictionApp
  fictionRouterSites: FictionRouter
  flyAppId: string
  flyApiToken: string
  adminBaseRoute?: string
  themes: () => Promise<Theme[]>
} & FictionPluginSettings

export class FictionSites extends FictionPlugin<SitesPluginSettings> {
  adminBaseRoute = this.settings.adminBaseRoute || '/admin'
  themes = vue.shallowRef<Theme[]>([])

  builder = new FictionSiteBuilder({ ...this.settings, fictionSites: this })

  queries = {
    CardQuery: new CardQueryHandler({ ...this.settings, fictionSites: this }),
    ManageSite: new ManageSite({ ...this.settings, fictionSites: this }),
    ManageIndex: new ManageIndex({ ...this.settings, fictionSites: this }),
    ManagePage: new ManagePage({ ...this.settings, fictionSites: this }),
    ManageCert: new ManageCert({ ...this.settings, fictionSites: this }),
  }

  requests = this.createRequests({ queries: this.queries, fictionServer: this.settings.fictionServer, fictionUser: this.settings.fictionUser })

  constructor(settings: SitesPluginSettings) {
    const s = { ...settings, root: safeDirname(import.meta.url) }

    super('FictionSites', s)

    this.settings.fictionDb.addTables(tables)
    this.settings.fictionRouter?.update(getRoutes({ ...this.settings, fictionSites: this }))

    this.addSitemaps()
  }

  addSitemaps() {
    this.settings.fictionApp.fictionSitemap?.sitemapLoaders.push(async (args) => {
      const { paths, hostname } = await loadSitemap({ ...args, mode: 'static', fictionSites: this })
      return { paths, hostname, topic: 'site' }
    })

    this.settings.fictionAppSites.fictionSitemap?.sitemapLoaders.push(async (args) => {
      const { paths, hostname } = await loadSitemap({ ...args, mode: 'dynamic', fictionSites: this })
      return { paths, hostname, topic: 'site' }
    })
  }

  override async afterSetup() {
    this.themes.value = await this.settings.themes()
  }

  getPreviewPath = vue.computed(() => {
    const current = this.settings.fictionRouter.current.value
    const q = { ...current.query, ...current.params } as Record<string, string>
    const { selectorType, selectorId, siteId, subDomain, themeId = q.theme, cardId = q.card } = q

    const finalSelectorType = selectorType || (siteId ? 'site' : subDomain ? 'domain' : themeId ? 'theme' : cardId ? 'card' : 'none')
    const finalSelectorId = selectorId || siteId || subDomain || themeId || cardId || 'none'

    return `${this.adminBaseRoute}/preview/${finalSelectorType}/${finalSelectorId}`
  })

  cleanup() {
    this.themes.value = []
  }

  async trackWebsiteEvents({ site }: { site?: Site }) {
    const { fictionAnalytics } = this.settings
    const beaconUrl = fictionAnalytics?.fictionBeacon?.beaconUrl.value

    if (!fictionAnalytics)
      return this.log.warn('Analytics not enabled')

    if (!site)
      throw new Error('Site not found')

    const { siteId, settings: { orgId } } = site

    if (!beaconUrl)
      throw new Error('Beacon URL not found')
    if (!orgId)
      throw new Error('Org ID not found')

    const { anonymousId } = getAnonymousId()
    await initializeClientTag({ siteId, orgId, beaconUrl, anonymousId })
  }
}
