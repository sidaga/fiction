import { createCard } from '@fiction/site/theme.js'
import type { MapSchemaConfig } from '@fiction/cards/map'
import { templates } from '../templates.js'
import spectrum from './spectrum.jpg'
import ap from './ap.webp'
import pro from './pro.webp'
import girlComputer from './girl-computer.webp'

const topHeroCard = createCard({
  templates,
  templateId: 'hero',
  userConfig: {
    superHeading: 'Company',
    subHeading: `A company built to help you tell your story. Made in California.`,
    heading: `About`,
    splash: { format: 'url', url: spectrum },
    layout: 'justify',
    actions: [],
  },
})

const missionHeroCard = createCard({
  templates,
  templateId: 'hero',
  userConfig: {
    superHeading: 'Mission',
    subHeading: `We believe everyone has a story to tell and a reputation to build. Fiction's mission is to elevate people and remove barriers to success.`,
    heading: `Helping People.`,
    splash: { format: 'url' as const, url: pro },
    layout: 'left',
    actions: [],
  },
})

const missionHeroCard2 = createCard({
  templates,
  templateId: 'hero',
  userConfig: {
    superHeading: 'Mission',
    subHeading: `We don't believe in compromising products for profit. Fiction is open-source and free to use. We believe in the power of community and the value of giving back.`,
    heading: `Open Source Software.`,
    splash: { format: 'url', url: girlComputer },
    layout: 'right',
    actions: [],
  },
})

const teamCard = createCard({
  templates,
  templateId: 'people',
  userConfig: {
    subHeading: `People helping build your story`,
    heading: `Team`,
    profiles: [{
      name: 'Andrew Powers',
      title: 'Founder',
      desc: 'Andrew is the founder of Fiction. He has a background in software engineering and has worked in the tech industry for over 20 years. He is passionate about building tools that help people tell their stories.',
      media: { format: 'url', url: ap },
      social: [{ name: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/arpowers' }],
    }],
    layout: 'mediabox',
  },
})

const mapIrvine: MapSchemaConfig = {
  lat: 33.5427,
  lng: -117.7854,
  zoom: 15,
  pitch: 60,
  markers: [{ lat: 33.5427, lng: -117.7854, label: 'Orange County, CA' }],
  mapStyle: 'satellite' as const,
}

const mapSaltLake: MapSchemaConfig = {
  lat: 40.7608,
  lng: -111.8910,
  zoom: 8,
  pitch: 80,
  markers: [{ lat: 40.7608, lng: -111.8910, label: 'Salt Lake City, UT' }],
  mapStyle: 'outdoors' as const,
}

const mapCard = createCard({
  templates,
  templateId: 'maps',
  userConfig: {
    maps: [mapIrvine, mapSaltLake],
  },
})

const valueCard = createCard({
  templates,
  templateId: 'faq',
  userConfig: {
    heading: `Values`,
    items: [
      { name: 'Focused', desc: `Create big value for a small group of people. Don't try and be everything to everyone.` },
      { name: `Karma`, desc: `Focus on making a contribution, the rest takes care of itself.` },
      { name: `Crafted`, desc: `Take the time to do things extremely well. It's better to do nothing, than release something below our standards.` },
      { name: `Minimal`, desc: `Simplicity is the ultimate form of elegance. Do what's needed and nothing more.` },

    ],
  },
})

export function page() {
  return createCard({
    templates,
    regionId: 'main',
    templateId: 'wrap',
    slug: 'about',
    cards: [
      createCard({
        templates,
        templateId: 'area',
        cards: [
          topHeroCard,
          missionHeroCard,
          missionHeroCard2,
          teamCard,
          mapCard,
          valueCard,
        ],
      }),

    ],
  })
}
