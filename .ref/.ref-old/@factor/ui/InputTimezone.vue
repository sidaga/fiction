<template>
  <InputSelect v-bind="{ ...$attrs, list }" :default-value="currentTimezone" />
</template>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
import { vue } from "@factor/api"

import timezones from "@factor/api/utils/lib/timezones.json"
import InputSelect from "./InputSelectCustom.vue"
interface TimezoneItem {
  offset: string
  name: string
}

const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const list = vue.computed(() => {
  return timezones.map(({ offset, name }: TimezoneItem) => {
    return {
      name: `${name} (${offset})`,
      value: name,
    }
  })
})
</script>
