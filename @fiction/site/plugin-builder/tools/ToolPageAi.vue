<script lang="ts" setup>
import type { vue } from '@fiction/core'
import type { EditorTool } from '@fiction/admin'
import ElTool from '@fiction/admin/tools/ElTool.vue'
import type { Site } from '../../site'
import AiSettings from '../../ai/AiSettings.vue'

const props = defineProps({
  site: { type: Object as vue.PropType<Site>, required: true },
  tool: { type: Object as vue.PropType<EditorTool>, required: true },
  saveText: { type: String, default: 'Save' },
})
</script>

<template>
  <ElTool :actions="[]" v-bind="props">
    <AiSettings :site="site" />
  </ElTool>
</template>
