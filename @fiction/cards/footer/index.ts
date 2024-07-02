import { vue } from '@fiction/core'
import { InputOption } from '@fiction/ui'
import { standardOption } from '@fiction/cards/inputSets'
import { CardTemplate } from '@fiction/site/card'
import { z } from 'zod'
import { mediaSchema } from '../schemaSets'

const authStateSchema = z.enum(['loggedIn', 'loggedOut', 'default']).optional()
const navItemSchema = z.object({
  name: z.string().optional(),
  href: z.string().optional(),
  itemStyle: z.enum(['buttonPrimary', 'buttonStandard', 'user', 'default']).optional(),
  authState: authStateSchema,
  itemsTitle: z.string().optional(),
  items: z.array(z.object({
    name: z.string().optional(),
    href: z.string().optional(),
    target: z.string().optional(),
    authState: authStateSchema,
    itemsTitle: z.string().optional(),
    items: z.array(z.object({
      name: z.string().optional(),
      href: z.string().optional(),
      target: z.string().optional(),
      authState: authStateSchema,
    })).optional(),
  })).optional(),
  desc: z.string().optional(),
  target: z.string().optional(),
})

export type SchemaNavItem = z.infer<typeof navItemSchema> & { isActive?: boolean, isHidden?: boolean, basePath?: string, items?: SchemaNavItem[] }

const layoutKeys = ['columns', 'centered'] as const
const schema = z.object({
  logo: mediaSchema.optional(),
  layout: z.enum(layoutKeys).optional(),
  nav: z.array(navItemSchema).optional(),
  legal: z.object({
    privacyPolicy: z.string().optional(),
    termsOfService: z.string().optional(),
    copyrightText: z.string().optional(),
  }).optional(),
  socials: z.array(z.object({
    key: z.string().optional(),
    href: z.string().optional(),
    target: z.string().optional(),
    name: z.string().optional(),
    icon: z.string().optional(),
  })).optional(),
  badges: z.array(z.object({
    key: z.string().optional(),
    href: z.string().optional(),
    target: z.string().optional(),
    name: z.string().optional(),
    media: mediaSchema.optional(),
  })).optional(),
})

export type UserConfig = z.infer<typeof schema>

const options = [
  new InputOption({ key: 'logo', label: 'Logo', input: 'InputMediaDisplay' }),
  new InputOption({ key: 'layout', label: 'Layout', input: 'InputSelect', list: layoutKeys }),
  standardOption.navItems({ key: 'navA', maxDepth: 2 }),
  standardOption.navItems({ key: 'navB', maxDepth: 2 }),
]

// Example default configuration for a movie actor or director's personal website
const defaultConfig: UserConfig = {
  logo: {
    format: 'html',
    html: `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 42 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34.5005 41H17.187C16.0637 41 15.0057 40.5523 14.211 39.7352L1.01935 26.2084C0.0221016 25.1882 -0.272797 23.6627 0.265224 22.3287C0.805496 20.9924 2.06388 20.1269 3.47534 20.1269H19.6407V3.55352C19.6407 2.11105 20.4827 0.820906 21.7838 0.266998C23.0647 -0.279986 24.591 0.0315868 25.5702 1.03554L38.7686 14.5671C39.5633 15.3864 40 16.4688 40 17.6182V35.364C39.9977 38.4728 37.5328 41 34.5005 41ZM17.9119 34.9024H34.0525V18.3544L25.5882 9.67651V26.2245H9.4476L17.9119 34.9024Z" fill="currentColor" /></svg>`,
  },
  nav: [
    {
      itemsTitle: 'Pages',
      items: [
        { href: '/tour', name: 'Tour' },
        { href: '/pricing', name: 'Pricing' },
        { href: '/developer', name: 'Developer' },
        { href: '/affiliate', name: 'Affiliate' },
      ],
    },
    {
      itemsTitle: 'Company',
      items: [
        { href: '/about', name: 'About' },
        { href: `#`, name: 'Support', target: '_blank' },
      ],
    },
    {
      itemsTitle: 'Resources',
      items: [
        { href: `#`, name: 'Docs', target: '_blank' },
        { href: '/app', name: 'Dashboard' },
      ],
    },
  ],
  legal: {
    privacyPolicy: `#`,
    termsOfService: `#`,
    copyrightText: `Fiction, Inc.`,
  },
  socials: [
    {
      key: 'linkedin',
      href: 'https://www.linkedin.com/company/fictionco',
      target: '_blank',
      name: 'LinkedIn',
      icon: `linkedin`,
    },
    {
      key: 'github',
      href: 'https://github.com/fictionco',
      target: '_blank',
      name: 'Github',
      icon: `github`,
    },
    {
      key: 'x',
      href: 'https://www.twitter.com/fictionco',
      target: '_blank',
      name: 'X',
      icon: 'x',
    },

  ],

  badges: [
    {
      key: 'badge1',
      href: 'https://www.linkedin.com/company/fictionco',
      target: '_blank',
      name: 'LinkedIn',
      media: {
        format: 'html',
        html: `<svg class="inline-block" xmlns="http://www.w3.org/2000/svg" width="174" height="28"><g fill="none" fill-rule="evenodd">   <rect     width="173"     height="27"     x=".5"     y=".5"     stroke="currentColor"     opacity=".5"     rx="6"   />   <path     fill="currentColor"     d="M79.79 11.12L77.1 18h-1.44l-2.7-6.88h1.71l1.71 4.63 1.71-4.63h1.7zm.78 6.88v-6.88h4.34v1.36h-2.67v1.37h2.28v1.31h-2.28v1.48h2.75V18h-4.42zm7.34-5.56v1.82h.76c.57 0 .98-.39.98-.91 0-.54-.41-.91-.98-.91h-.76zM86.28 18v-6.88h2.61c1.42 0 2.43.92 2.43 2.23 0 .89-.47 1.61-1.26 1.99L91.59 18h-1.78l-1.34-2.43h-.56V18h-1.63zm6.4 0v-6.88h1.67V18h-1.67zm3.31 0v-6.88h4.34v1.36h-2.67v1.63h2.28v1.36h-2.28V18h-1.67zm5.47 0v-6.88h1.67V18h-1.67zm3.31 0v-6.88h4.34v1.36h-2.67v1.37h2.28v1.31h-2.28v1.48h2.75V18h-4.42zm5.71 0v-6.88h2.73c1.99 0 3.4 1.43 3.4 3.44S115.2 18 113.21 18h-2.73zm1.67-5.52v4.16h.98c1.05 0 1.78-.85 1.78-2.08s-.73-2.08-1.78-2.08h-.98zm8.17 5.52v-6.88h2.65c1.44 0 2.46.94 2.46 2.27s-1.02 2.25-2.46 2.25h-1.02V18h-1.63zm1.63-5.56v1.89h.8c.59 0 1.02-.39 1.02-.94 0-.57-.43-.95-1.02-.95h-.8zm3.12 5.56l2.7-6.88h1.44L131.9 18h-1.62l-.53-1.42h-2.53L126.7 18h-1.63zm3.42-4.87l-.81 2.21h1.61l-.8-2.21zm5.82-.69v1.82h.76c.57 0 .98-.39.98-.91 0-.54-.41-.91-.98-.91h-.76zM132.68 18v-6.88h2.61c1.42 0 2.43.92 2.43 2.23 0 .89-.47 1.61-1.26 1.99l1.53 2.66h-1.78l-1.34-2.43h-.56V18h-1.63zm7.64 0v-5.52h-1.99v-1.36h5.63v1.36h-1.98V18h-1.66zm4.7 0v-6.88h1.44l3.1 4.24v-4.24h1.55V18h-1.44l-3.09-4.24V18h-1.56zm7.73 0v-6.88h4.34v1.36h-2.67v1.37h2.28v1.31h-2.28v1.48h2.75V18h-4.42zm7.34-5.56v1.82h.76c.57 0 .98-.39.98-.91 0-.54-.41-.91-.98-.91h-.76zM158.46 18v-6.88h2.61c1.42 0 2.43.92 2.43 2.23 0 .89-.47 1.61-1.26 1.99l1.53 2.66h-1.78l-1.34-2.43h-.56V18h-1.63zM51 10.068L65 7v10.935L51 21V10.068zm5.323 6.469a.778.778 0 001.07-.004l3.814-3.664a.726.726 0 000-1.048.778.778 0 00-1.078 0l-3.27 3.129-.986-.9a.778.778 0 00-1.078 0 .726.726 0 000 1.048l1.528 1.439zM42.97 15.07h-4.428c.1 1.093.877 1.415 1.759 1.415.899 0 1.606-.194 2.223-.516v1.88c-.615.351-1.427.605-2.508.605-2.204 0-3.748-1.423-3.748-4.237 0-2.376 1.31-4.263 3.462-4.263 2.15 0 3.27 1.886 3.27 4.276 0 .225-.02.714-.03.84zm-3.254-3.214c-.566 0-1.195.44-1.195 1.492h2.34c0-1.05-.59-1.492-1.145-1.492zm-7.037 6.598c-.791 0-1.275-.345-1.6-.59l-.005 2.64-2.262.496-.001-10.89h1.992l.118.576a2.495 2.495 0 011.773-.732c1.588 0 3.085 1.476 3.085 4.192 0 2.965-1.48 4.308-3.1 4.308zm-.526-6.434c-.52 0-.845.196-1.08.463l.013 3.467c.219.245.536.443 1.067.443.836 0 1.397-.94 1.397-2.196 0-1.22-.57-2.177-1.397-2.177zm-6.538-1.91h2.271v8.177h-2.27v-8.178zm0-2.612L27.885 7v1.9l-2.27.498v-1.9zm-2.346 5.245v5.544h-2.262v-8.178h1.956l.143.69c.529-1.004 1.587-.8 1.888-.69v2.145c-.288-.096-1.19-.235-1.725.489zm-4.775 2.675c0 1.375 1.427.947 1.717.827v1.9c-.301.17-.848.309-1.588.309-1.343 0-2.35-1.02-2.35-2.401l.01-7.486 2.209-.484.002 2.026h1.718v1.99h-1.718v3.319zm-2.746.398c0 1.68-1.296 2.638-3.178 2.638a6.11 6.11 0 01-2.474-.53v-2.227c.76.426 1.727.745 2.477.745.504 0 .868-.14.868-.57 0-1.115-3.44-.695-3.44-3.278 0-1.652 1.224-2.64 3.059-2.64.75 0 1.499.119 2.248.427v2.197c-.688-.383-1.562-.6-2.25-.6-.474 0-.769.14-.769.505 0 1.05 3.46.551 3.46 3.333z"/></g></svg>`,
      },
    },
    {
      key: 'badge2',
      href: '#',
      target: '_blank',
      name: 'Data Protection',
      media: {
        format: 'html',
        html: `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M62.456 45.552v6.97c0 5.697-4.834 10.315-10.796 10.315H11.796C5.833 62.837 1 58.218 1 52.522v-6.97" fill="#fff"/><path d="M51.843 1h-40.23C5.752 1 1 5.752 1 11.613v40.23c0 5.861 4.752 10.613 10.613 10.613h40.23c5.861 0 10.613-4.752 10.613-10.613v-40.23C62.456 5.752 57.704 1 51.843 1z" stroke="#fff" stroke-width="1.19" stroke-miterlimit="10"/><path d="M22.278 19.348v-9.63c0-1.29.73-2.022 2.008-2.022h7.242c2.677 0 4.974.94 6.84 2.857 1.533 1.57 2.42 3.47 2.713 5.643.081.61.102 1.23.102 1.845v10.906c0 .504-.077.986-.408 1.398-.339.416-.765.666-1.307.673-1.145.01-2.293 0-3.438.01-.162 0-.23-.056-.279-.204-.841-2.458-1.69-4.91-2.543-7.362-.067-.19-.014-.26.152-.341 1.342-.63 2.17-1.673 2.504-3.125.529-2.296-1.106-4.783-3.434-5.195-2.42-.433-4.572.947-5.182 3.31-.479 1.871.486 4.02 2.22 4.876.306.151.359.285.26.61a635.236 635.236 0 00-2.089 7.125c-.07.24-.169.307-.412.303-.993-.014-1.99-.042-2.98 0-1.257.056-1.986-.947-1.98-1.965.025-3.241.011-6.478.011-9.719M7.86 40.261a1.944 1.944 0 01-.659-.31l.293-.644c.158.116.345.211.563.282.219.07.437.105.655.105.243 0 .423-.035.54-.109a.325.325 0 00.172-.289.276.276 0 00-.102-.218.722.722 0 00-.265-.14 5.476 5.476 0 00-.436-.117 5.798 5.798 0 01-.69-.2 1.114 1.114 0 01-.462-.325c-.13-.148-.194-.345-.194-.592 0-.215.06-.408.176-.584a1.17 1.17 0 01.525-.416c.233-.102.521-.155.86-.155.236 0 .465.028.69.084.225.057.423.138.592.243l-.264.649a2.06 2.06 0 00-1.025-.29c-.24 0-.416.04-.532.117a.352.352 0 00-.173.306c0 .127.067.222.197.282.134.064.335.123.606.183.282.067.51.134.69.201.18.067.335.173.462.317.127.145.194.342.194.589 0 .21-.06.405-.176.577a1.196 1.196 0 01-.532.416 2.173 2.173 0 01-.863.155 2.98 2.98 0 01-.85-.12l.008.003zM13.727 39.628v.687h-2.864v-3.699h2.797v.687h-1.944v.803h1.719v.666h-1.72v.856h2.012zM16.843 39.522h-1.718l-.328.793h-.877l1.648-3.699h.846l1.655 3.699h-.898l-.328-.793zm-.27-.648l-.589-1.416-.588 1.416h1.176zM18.457 36.616h.856v3.001h1.856v.698h-2.708v-3.699h-.004zM23.895 40.132a1.843 1.843 0 01-.983-1.663c0-.363.088-.69.26-.98.173-.288.416-.517.723-.682.306-.166.655-.25 1.039-.25.384 0 .73.084 1.036.25a1.846 1.846 0 01.99 1.663 1.847 1.847 0 01-.99 1.662c-.307.165-.652.25-1.036.25s-.73-.081-1.04-.25zm1.63-.63c.177-.103.314-.24.416-.42.103-.18.152-.384.152-.613 0-.229-.05-.433-.152-.613a1.08 1.08 0 00-.415-.419 1.156 1.156 0 00-.592-.151c-.218 0-.416.049-.592.151a1.08 1.08 0 00-.415.42c-.103.179-.152.383-.152.612 0 .23.05.433.152.613.098.18.24.32.415.42.176.098.374.15.592.15.218 0 .416-.049.592-.15zM28.457 37.303v.98h1.712v.686h-1.712v1.346h-.855v-3.699h2.796v.687h-1.94zM36.474 40.712c-.12.148-.264.261-.437.338-.169.078-.359.117-.563.117-.275 0-.525-.06-.747-.176-.222-.12-.475-.328-.76-.627a2.026 2.026 0 01-.895-.324 1.834 1.834 0 01-.832-1.575c0-.363.088-.69.26-.98.173-.288.416-.517.723-.682.306-.166.655-.25 1.04-.25.383 0 .728.084 1.035.25a1.846 1.846 0 01.99 1.663c0 .429-.12.806-.363 1.13-.243.324-.56.55-.958.676a.883.883 0 00.257.197.62.62 0 00.267.06c.23 0 .43-.091.603-.275l.38.455v.003zm-3.216-1.634c.099.18.24.32.416.42.176.098.373.15.592.15.218 0 .415-.049.591-.15.176-.103.314-.24.416-.42.102-.18.151-.384.151-.613 0-.229-.049-.433-.151-.613a1.08 1.08 0 00-.416-.419 1.156 1.156 0 00-.591-.151c-.219 0-.416.049-.592.151a1.08 1.08 0 00-.416.42c-.102.179-.151.383-.151.612 0 .229.05.433.151.613zM37.343 39.94c-.296-.292-.44-.708-.44-1.25v-2.072h.855v2.04c0 .662.275.993.825.993.267 0 .472-.081.612-.24.141-.158.212-.412.212-.753v-2.04h.845v2.071c0 .543-.148.962-.44 1.25-.292.293-.705.441-1.233.441-.528 0-.94-.148-1.233-.44h-.003zM43.451 39.522h-1.719l-.328.793h-.877l1.649-3.699h.845l1.656 3.699h-.898l-.328-.793zm-.271-.648l-.588-1.416-.589 1.416h1.177zM45.066 36.616h.856v3.001h1.857v.698h-2.71v-3.699h-.003zM48.256 36.616h.856v3.699h-.856v-3.699zM50.752 37.314h-1.184v-.698h3.223v.698h-1.183v3h-.856v-3z" fill="#fff"/><path d="M54.96 39.004v1.31h-.856v-1.32l-1.43-2.378h.909l.986 1.645.99-1.645h.842l-1.438 2.388h-.003z" fill="#fff"/><path d="M6.56 51.06h1.508c.391 0 .736.078 1.036.237.3.158.532.377.697.655.166.282.25.599.25.958 0 .36-.084.68-.25.958-.165.279-.398.5-.697.655a2.18 2.18 0 01-1.036.236H6.561v-3.698zm1.483 3.361c.325 0 .61-.063.853-.193.243-.127.433-.307.567-.536.134-.229.2-.49.2-.785 0-.296-.066-.557-.2-.786a1.378 1.378 0 00-.567-.532 1.822 1.822 0 00-.853-.194H6.952v3.023h1.091v.003zM13.194 53.77h-2.06l-.444.986h-.409l1.691-3.699h.384l1.69 3.699h-.411l-.444-.986h.003zm-.144-.317l-.888-1.987-.887 1.987h1.775zM15.196 51.4h-1.3v-.34h2.991v.34h-1.3v3.36h-.39V51.4zM19.642 53.77H17.58l-.444.986h-.409l1.691-3.699h.384l1.691 3.699h-.412l-.444-.986h.004zm-.145-.317l-.887-1.987-.888 1.987h1.775zM24.99 51.4c.268.225.402.535.402.93 0 .394-.134.704-.402.925-.268.226-.638.335-1.11.335h-.993v1.166h-.39v-3.699h1.383c.472 0 .842.113 1.11.339v.003zm-.278 1.609c.193-.159.288-.388.288-.68 0-.292-.095-.528-.288-.69-.194-.159-.476-.24-.842-.24h-.983v1.85h.983c.366 0 .644-.082.842-.24zM28.762 54.76l-.846-1.191c-.095.01-.193.017-.295.017h-.994v1.174h-.39v-3.7h1.384c.472 0 .841.114 1.11.34.267.224.4.535.4.929 0 .289-.073.532-.218.733a1.235 1.235 0 01-.627.43l.906 1.268h-.43zm-.31-1.748c.194-.162.289-.387.289-.683 0-.296-.095-.528-.29-.69-.193-.159-.475-.24-.84-.24h-.984v1.856h.983c.366 0 .645-.08.842-.243zM30.68 54.545a1.757 1.757 0 01-.697-.673 1.883 1.883 0 01-.25-.962c0-.355.084-.676.25-.961.165-.286.398-.511.697-.673.296-.166.63-.247.997-.247.366 0 .697.081.99.243.292.162.524.388.694.673.169.285.253.61.253.965a1.819 1.819 0 01-.947 1.638 2.01 2.01 0 01-.99.243 2.02 2.02 0 01-.997-.246zm1.79-.3c.235-.133.419-.313.556-.55.134-.232.2-.496.2-.785 0-.288-.066-.55-.2-.785a1.464 1.464 0 00-.557-.55 1.577 1.577 0 00-.792-.197c-.293 0-.557.067-.796.197-.24.13-.427.317-.56.55a1.563 1.563 0 00-.205.785c0 .29.067.55.205.786.133.236.324.419.56.55.236.13.503.197.796.197.292 0 .556-.067.792-.198zM35.157 51.4h-1.3v-.34h2.991v.34h-1.3v3.36h-.39V51.4zM40.086 54.421v.339h-2.613v-3.7h2.536v.34h-2.145v1.317h1.912v.334h-1.912v1.374h2.226l-.004-.004zM41.597 54.548a1.787 1.787 0 01-.69-.672 1.895 1.895 0 01-.25-.966c0-.355.084-.676.25-.965.165-.289.397-.51.693-.673.296-.162.627-.243.994-.243.274 0 .528.046.76.138.233.091.43.225.592.401l-.25.25c-.289-.292-.655-.436-1.095-.436a1.6 1.6 0 00-.796.2 1.48 1.48 0 00-.768 1.332c0 .289.067.55.204.782.134.232.324.416.564.55.24.133.503.2.796.2.444 0 .806-.148 1.095-.444l.25.25c-.162.176-.36.31-.595.405a2.02 2.02 0 01-.764.141 2.01 2.01 0 01-.99-.243v-.007zM45.456 51.4h-1.3v-.34h2.99v.34h-1.299v3.36h-.391V51.4zM47.768 51.06h.39v3.7h-.39v-3.7zM49.985 54.545a1.757 1.757 0 01-.698-.673 1.882 1.882 0 01-.25-.962c0-.355.085-.676.25-.961.166-.286.398-.511.698-.673.296-.166.63-.247.996-.247.367 0 .698.081.99.243.293.162.525.388.694.673.17.285.254.61.254.965 0 .356-.085.677-.254.966a1.82 1.82 0 01-.694.672 2.01 2.01 0 01-.99.243 2.02 2.02 0 01-.996-.246zm1.789-.3c.236-.133.42-.313.557-.55.133-.232.2-.496.2-.785 0-.288-.067-.55-.2-.785a1.464 1.464 0 00-.557-.55 1.576 1.576 0 00-.793-.197c-.292 0-.556.067-.796.197s-.426.317-.56.55a1.563 1.563 0 00-.204.785c0 .29.067.55.204.786.134.236.324.419.56.55.236.13.504.197.796.197.293 0 .557-.067.793-.198zM56.89 51.06v3.7h-.325l-2.377-3.002v3.002h-.391v-3.7h.324l2.381 3.002v-3.001h.388z" fill="#704EF1"/></svg>`,
      },
    },
  ],
}

const el = vue.defineAsyncComponent(async () => import('./ElCard.vue'))
const templateId = 'footer'
export const templates = [
  new CardTemplate({
    templateId,
    category: ['navigation', 'basic'],
    icon: 'i-tabler-box-align-bottom',
    colorTheme: 'green',
    description: 'A professional footer for your website',
    isPublic: false,
    el,
    userConfig: { ...defaultConfig },
    schema,
    options,
    title: 'Footer Pro',
    demoPage: () => {
      return [
        { templateId, userConfig: { spacing: { spacingClass: 'py-20' }, ...defaultConfig, layout: 'columns' as const } },
        { templateId, userConfig: { spacing: { spacingClass: 'py-20' }, ...defaultConfig, layout: 'centered' as const } },

      ]
    },
  }),
] as const
