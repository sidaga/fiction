<script lang="ts" setup>
import { stringify, vue } from '@fiction/core'
import XText from '../../common/XText.vue'
import ElForm from '../ElForm.vue'
import type { InputOption } from '..'

const props = defineProps({
  inputName: { type: String, default: '' },
  inputEl: { type: Object as vue.PropType<{ el: vue.Component }>, default: () => ({}) },
  modelValue: {
    type: [Array, Object, String, Number, Boolean],
    default: undefined,
  },
  options: {
    type: Array as vue.PropType<InputOption[]>,
    default: () => [],
  },
})
const val = vue.ref(props.modelValue)
const attrs = vue.useAttrs()
const inputForm = vue.ref<typeof ElForm>()
const isValid = vue.ref(false)
</script>

<template>
  <ElForm
    ref="inputForm"
    v-model:valid="isValid"
    class="test-input py-8"
    :data="val"
    :name="inputName"
  >
    <div :id="inputName" class="grid grid-cols-12 gap-12">
      <div class="text-theme-700 dark:text-theme-0 space-7-4 text-right col-span-3">
        <h3 class="grow text-sm font-semibold">
          {{ inputName }}
        </h3>
      </div>
      <div class="col-span-6">
        <component
          :is="inputEl.el"
          v-model="val"
          data-input
          :options="options"
          v-bind="attrs"
          required
        />
      </div>
      <div class="col-span-3">
        <div class="text-[8px] font-mono">
          <div class="pb-1 border-b border-theme-200 dark:border-theme-500 mb-2">
            <span :class="isValid ? 'text-primary-500' : 'text-rose-500'" class="text-[8px] font-mono">
              {{ isValid ? '(Valid)' : '(Invalid)' }}
            </span>
          </div>
          <div class="min-w-0 break-words tracking-tight" :data-input-value="val">
            <XText
              tag="div"
              class=""
              :model-value="stringify({ value: val || '[empty]' })"
              :is-markdown="true"
            />
          </div>
        </div>
      </div>
    </div>
  </ElForm>
</template>
