<script lang="ts" setup>
import { useService, vue } from '@fiction/core'
import type { FictionSites, Site } from '@fiction/plugin-sites'
import ElSiteRender from '@fiction/plugin-sites/engine/ElSiteRender.vue'

const { fictionSites, fictionRouter } = useService<{ fictionSites: FictionSites }>()

const loading = vue.ref(false)
const site = vue.shallowRef<Site>()

const themeId = 'fiction'

async function load() {
  console.log('RUN LOAD')

  if (!themeId)
    return

  loading.value = true

  site.value = await fictionSites.loadSiteFromTheme({ themeId, fictionRouter })

  loading.value = false
}

load().catch(error => console.error(error))
</script>

<template>
  <div class="HKLE">
    {{ loading ? 'yes' : 'no' }}
    <ElSiteRender
      :site="site"
      :loading="loading"
      :on-empty="{ title: '404', description: `There was a problem loading this site` }"
    />
  </div>
</template>
