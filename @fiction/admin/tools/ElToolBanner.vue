<script lang="ts" setup>
import type { ActionItem, vue } from '@fiction/core'
import ElButton from '@fiction/ui/ElButton.vue'

defineProps({
  title: { type: String, default: '' },
  sub: { type: String, default: '' },
  icon: { type: String, default: '' },
  actions: { type: Array as vue.PropType<ActionItem[]>, default: () => [] },
  mode: { type: String as vue.PropType<'mast' | 'hero'>, default: 'mast' },
})
</script>

<template>
  <div class=" rounded-lg text-sm select-none" :class="mode === 'hero' ? 'flex items-center space-x-4 p-4' : 'text-center p-6'">
    <div class="text-theme-300 dark:text-theme-600">
      <div class="text-5xl inline-block   " :class="[icon, mode === 'hero' ? 'mb-0' : 'mb-2']" />
    </div>
    <div>
      <div class="font-bold">
        {{ title }}
      </div>
      <div class="text-xs text-theme-500 dark:text-theme-300 text-balance">
        {{ sub }}
      </div>
      <div
        v-if="actions.length > 0"
        class="flex  mt-4"
        :class="[mode === 'hero' ? ' ' : 'justify-center']"
      >
        <ElButton
          v-for="(item, i) in actions"
          :key="i"
          btn="primary"
          :href="item.href"
          :icon="item.icon"
          @click="item.onClick?.({ event: $event, item })"
        >
          {{ item.name }}
        </ElButton>
      </div>
    </div>
  </div>
</template>
