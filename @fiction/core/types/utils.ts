import type { vue } from '../utils/libraries.js'
import type { TableMediaConfig } from '../plugin-media'
import type { User } from '../plugin-user'

export type CleanupCallback = (() => void) | undefined

export type MediaDisplayObject = {
  _key?: string
  filters?: ImageFilterConfig[]
  overlay?: OverlaySetting
  html?: string
  text?: string
  classes?: string
  format?: 'url' | 'video' | 'iframe' | 'html' | 'audio' | 'text'
} & TableMediaConfig

export type GradientItem = { color?: string, percent?: number }
export type GradientSetting = { angle?: number, stops?: GradientItem[], css?: string }
export type OverlaySetting = { gradient?: GradientSetting, opacity?: number, blendMode?: string, color?: string }

export type BackgroundDisplayObject = {
  color?: string
  gradient?: GradientSetting
  repeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  size?: 'cover' | 'contain' | 'auto'
} & MediaDisplayObject

export const imageFilters = ['brightness', 'opacity', 'contrast', 'blur', 'grayscale', 'sepia', 'saturate', 'invert', 'hue-rotate'] as const

export type ImageFilter = typeof imageFilters[number]

export interface ImageFilterConfig {
  filter: ImageFilter
  percent?: number
  value?: string
}

export interface ListItem {
  name?: string
  value?: string | number
  desc?: string
  selected?: boolean
  isDefault?: boolean
  icon?: string
  callback?: () => any
  actions?: ListItem[]
  items?: ListItem[]
  count?: number
  [key: string]: unknown
}

export type ClickHandler = (args: { event?: MouseEvent, item?: NavItem, props?: Record<string, any> }) => any | Promise<any>

export interface NavItem {
  testId?: string
  name?: string
  desc?: string
  icon?: string
  iconAfter?: string
  href?: string
  isActive?: boolean
  isHidden?: boolean
  key?: string
  onClick?: ClickHandler
  priority?: number
  class?: string
  target?: string
  itemsTitle?: string
  items?: NavItem[]
  figure?: Figure
  count?: number
  basePath?: string
  authState?: 'loggedIn' | 'loggedOut' | 'default'
}

export type ActionItem = NavItem & {
  btn?: 'default' | 'primary' | 'naked' | 'caution' | 'success' | 'danger' | 'outline' | 'minimal'
  size?: 'xs' | 'sm' | 'lg' | 'md' | 'xl' | '2xl'
  target?: string
  loading?: boolean
  isDisabled?: boolean
}

export type MediaItem = {
  media?: MediaDisplayObject
  overlays?: MediaDisplayObject[]
  tags?: string[]
  actions?: ActionItem[]
} & NavItem

export type PostItem = {
  content?: string
  title?: string
  subTitle?: string
} & MediaItem

export interface NavItemGroup {
  title?: string
  key?: string
  items: NavItem[] | readonly NavItem[]
  class?: string
}

export interface NavGroup {
  title?: string
  key?: string
  class?: string
  items: NavItem[]
}

export type Figure = { el?: vue.Component, props?: Record<string, any> }

export type IndexItem = {
  images?: MediaDisplayObject[]
  links?: ActionItem[]
  actions?: ActionItem[]
  category?: ActionItem[]
  tags?: ActionItem[]
  authors?: User[]
  figure?: Figure
  media?: MediaDisplayObject
  slug?: string
  dateIso?: string
} & NavItem

// @deprecated
export type MenuItem = {
  sup?: string
  key?: string
  name: string
  icon?: string
  href?: string
  link?: vue.Ref<string>

  // @deprecated
  route?: vue.Ref<string> | vue.ComputedRef<string>
  // @deprecated
  url?: vue.Ref<string>
  active?: vue.Ref<boolean> | vue.ComputedRef<string>
  onClick?: (evnt?: MouseEvent, item?: MenuItem) => void | Promise<void>
  priority?: number
  btn?: string
  loading?: boolean
  target?: string
} & ListItem

export interface MenuGroup {
  groupName?: string
  groupKey?: string
  class?: string
  menu: MenuItem[] | readonly MenuItem[]
}

export type InArray<T extends Array<any>> = T extends (infer U)[] ? U : never
