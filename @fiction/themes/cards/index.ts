// @unocss-include

import { envConfig, safeDirname, vue } from '@fiction/core'
import { CardTemplate } from '@fiction/site/card'
import * as four04 from './404'
import * as quote from './quote'
import { templates as templatesLogos } from './logos'
import * as hero from './hero'

import * as area from './area'
import * as tour from './tour'
import { templates as templatesMediaGrid } from './media-grid'
import * as metrics from './metrics'
import * as features from './features'
import * as team from './team'
import * as map from './map'
import * as faq from './faq'
import * as pricing from './pricing'
import * as marquee from './marquee'
/**
 * Add path for tailwindcss to scan for styles
 */
envConfig.register({ name: 'CARD_UI_ROOT', onLoad: ({ fictionEnv }) => { fictionEnv.addUiRoot(safeDirname(import.meta.url)) } })

export const standardCardTemplates = [
  new CardTemplate({
    templateId: 'wrap',
    el: vue.defineAsyncComponent(() => import('./CardWrap.vue')),
  }),
  ...four04.templates,
  ...quote.templates,
  ...hero.templates,
  ...marquee.templates,
  ...area.templates,

] as const

export const marketingCardTemplates = [
  ...team.templates,
  ...pricing.templates,
  ...templatesLogos,
  ...tour.templates,
  ...templatesMediaGrid,
  ...features.templates,
  ...metrics.templates,
  ...map.templates,
  ...faq.templates,
] as const

export function getDemoPages() {
  return [
    marquee.demo(),
    hero.demo(),
  ]
}
