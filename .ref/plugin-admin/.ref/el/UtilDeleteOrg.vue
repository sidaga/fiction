<script lang="ts" setup>
import { useService, vue } from '@factor/api'
import ElInput from '@factor/ui/ElInput.vue'
import ElButton from '@factor/ui/ElButton.vue'

const { factorRouter, factorUser } = useService()

const sending = vue.ref<string | boolean>(false)
const sent = vue.ref(false)
const org = vue.computed(() => factorUser.activeOrganization.value)
/**
 * Delete organization after confirmation
 */
async function maybeDeleteOrganization(): Promise<void> {
  const orgId = org.value?.orgId
  if (!orgId)
    return
  const confirmed = confirm(
    'Are you sure? Deleting this organization will delete its assets and data permanently.',
  )

  if (confirmed) {
    sending.value = 'delete'
    await factorUser.requests.ManageOrganization.request({
      _action: 'delete',
      orgId,
    })

    await factorRouter.goto('orgIndex')
    sent.value = true
    sending.value = false
  }
}
</script>

<template>
  <ElInput
    :label="`Permanently Delete Organization (You are an ${factorUser.activeRelation.value?.memberAccess})`"
    sub-label="Permanently delete this organization and its data."
  >
    <div class="my-2 rounded-md">
      <ElButton
        :loading="sending === 'delete'"
        btn="default"
        size="sm"
        @click="maybeDeleteOrganization()"
      >
        Permanently Delete Organization: "{{ org?.orgName }}"
      </ElButton>
    </div>
  </ElInput>
</template>
