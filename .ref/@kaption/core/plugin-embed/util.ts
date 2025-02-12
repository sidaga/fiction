// @unocss-include

export const embedModes = [
  'inline',
  'full',
  'popover',
  'slideover',
  'modal',
] as const
export type EmbedMode = typeof embedModes[number]

export type EmbedTrigger =
  | 'click'
  | 'init'
  | 'tab'
  | 'button'
  | 'bubble'
  | 'event'

export interface EmbedProps {
  mode: EmbedMode
  icon: string
  text: string
  width: number
  trigger: EmbedTrigger
}

export const buttonIcons = [
  {
    name: 'Chat Bubble Center',
    value: 'i-heroicons-chat-bubble-bottom-center',
  },
  {
    name: 'Chat Bubble Left',
    value: 'i-heroicons-chat-bubble-oval-left',
  },

  {
    name: 'Chat Bubble Left / Right',
    value: 'i-heroicons-chat-bubble-left-right',
  },
  {
    name: 'Smiley Face',
    value: 'i-heroicons-face-smile',
  },
  {
    name: 'Happy Comment',
    value: 'i-carbon-chat-bot',
  },
  {
    name: 'Comment',
    value: 'i-carbon-chat',
  },
  {
    name: 'Checkmark',
    value: 'i-heroicons-check',
  },
  {
    name: 'Checklist',
    value: 'i-carbon-list-checked',
  },
  {
    name: 'Star',
    value: 'i-heroicons-star',
  },
  {
    name: 'Info',
    value: 'i-heroicons-information-circle',
  },
]

export const embedPosition = [
  {
    name: 'Bottom / Center',
    value: 'bc',
    style: {
      transform: 'translateX(-50%)',
      left: '50%',
      bottom: '1.5rem',
    },
  },
  {
    name: 'Bottom / Right',
    value: 'br',
    style: {
      right: '1.5rem',
      bottom: '1.5rem',
    },
  },
  {
    name: 'Bottom / Left',
    value: 'bl',
    style: {
      left: '1.5rem',
      bottom: '1.5rem',
    },
  },
  {
    name: 'Top / Right',
    value: 'tr',
    style: {
      right: '1.5rem',
      top: '1.5rem',
    },
  },

  {
    name: 'Top / Left',
    value: 'tl',
    style: {
      left: '1.5rem',
      top: '1.5rem',
    },
  },
]
