<script lang="ts" setup>
import type {
  FactorRouter,
  FactorUser,
  OrganizationMember,
} from '@factor/api'
import {
  resetUi,
  useService,
  vue,
} from '@factor/api'
import type { FactorTeam } from '@factor/api/plugin-team'
import ElBadge from '@factor/ui/ElBadge.vue'
import ElForm from '@factor/ui/ElForm.vue'
import ElInput from '@factor/ui/ElInput.vue'
import ElAvatar from '@factor/ui/ElAvatar.vue'
import ElButton from '@factor/ui/ElButton.vue'
import ElPanelSettings from './ElPanelSettings.vue'

const { factorRouter, factorTeam, factorUser } = useService<{
  factorRouter: FactorRouter
  factorTeam: FactorTeam
  factorUser: FactorUser
}>()

const activeOrganization = factorUser.activeOrganization

const userId = vue.computed(
  () => factorRouter.query.value.userId as string | undefined,
)

const sending = vue.ref<string | boolean>(false)
const sent = vue.ref(false)
const isValid = vue.ref<boolean>(false)
const member = vue.ref<OrganizationMember>()
vue.onMounted(async () => {
  if (userId.value)
    member.value = await factorTeam.loadMember(userId.value)
})

async function setMemberRelation(_action: 'update' | 'delete'): Promise<void> {
  const orgId = activeOrganization.value?.orgId

  if (!userId.value)
    throw new Error('user id is required')
  if (!orgId)
    throw new Error('organization id is required')

  const r = await factorUser.requests.ManageMemberRelation.request(
    {
      memberId: userId.value,
      orgId,
      memberAccess: member.value?.memberAccess ?? 'observer',
      _action,
    },
    { debug: true },
  )

  if (r.status === 'success') {
    if (_action === 'delete')
      await factorRouter.goto('team', { orgId })
    else
      await factorRouter.replace({ query: {} })
  }
}
/**
 * Request to update user
 */
async function send(): Promise<void> {
  sending.value = 'update'

  if (!userId.value)
    throw new Error('user id is required')
  if (!factorUser.activeOrganization.value?.orgId)
    throw new Error('organization id is required')

  await setMemberRelation('update')

  sent.value = true

  sending.value = false

  resetUi({ scope: 'all', cause: 'sendTeamEdit' })
}

async function resendInvite(): Promise<void> {
  const orgId = factorUser.activeOrganization.value?.orgId
  const { email, memberAccess = 'observer' } = member.value ?? {}
  if (!orgId || !email)
    return

  sending.value = 'invite'

  await factorTeam.requests.TeamInvite.request({
    orgId,
    invites: [{ email, memberAccess }],
  })
  sending.value = false
}

async function maybeRemoveMember(): Promise<void> {
  const confirmed = confirm('Are you sure?')

  if (confirmed) {
    sending.value = 'delete'
    await setMemberRelation('delete')
    sending.value = false
  }
}
</script>

<template>
  <ElPanelSettings>
    <div class="text-lg mb-4 font-bold">
      {{ `Edit Team Member: ${member?.email}` }}
    </div>
    <div class="mt-4 px-4 sm:px-6 lg:px-8">
      <div class="py-8">
        <ElAvatar
          v-if="member"
          class="h-14 w-14 rounded-full"
          :email="member.email"
        />
        <div class="mt-4">
          <h1 class="text-xl font-bold">
            {{ member?.fullName || member?.email }}
          </h1>
          <p class="text-theme-500 text-base">
            {{ member?.email }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8">
        <ElForm
          v-if="member"
          v-model:valid="isValid"
          @submit="send()"
        >
          <ElInput
            v-model="member.memberAccess"
            class="my-6 max-w-sm"
            input="InputSelectCustom"
            label="Organization Access"
            sub-label="Edit the access the member has to the organization"
            :list="[
              { value: 'owner', name: 'Owner' },
              { value: 'admin', name: 'Administrator' },
              { value: 'editor', name: 'Editor (Read/Write)' },
              { value: 'observer', name: 'Observer (Read Only)' },
            ]"
          />

          <div class=" ">
            <ElButton
              type="submit"
              btn="primary"
              :loading="sending === 'update'"
            >
              Save Changes &rarr;
            </ElButton>
          </div>
        </ElForm>
        <div class="py-6">
          <div>
            <ElInput
              label="Status"
              sub-label="Status of the users in the organization"
            >
              <div class="my-3 flex space-x-4">
                <div>
                  <ElBadge
                    class="text-lg font-semibold leading-6"
                    :btn="
                      member?.memberStatus === 'pending' ? 'caution' : 'default'
                    "
                  >
                    {{ member?.memberStatus }}
                  </ElBadge>
                </div>
                <div v-if="member?.memberStatus === 'pending'">
                  <ElButton
                    :loading="sending === 'invite'"
                    btn="default"
                    @click="resendInvite()"
                  >
                    Resend Invite
                  </ElButton>
                </div>
              </div>
            </ElInput>
          </div>
        </div>
      </div>
      <div class="pb-8 pt-16">
        <div class="border-b border-slate-200 pb-3">
          <h3 class="text-xl font-semibold leading-6">
            Danger Zone
          </h3>
        </div>
        <div>
          <ElInput
            class="my-8"
            label="Remove From Organization"
            sub-label="Permanently remove the user from this organization."
          >
            <div class="rounded-md pt-4">
              <ElButton
                :loading="sending === 'delete'"
                btn="danger"
                size="sm"
                @click="maybeRemoveMember()"
              >
                Remove Member
              </ElButton>
            </div>
          </ElInput>
        </div>
      </div>
    </div>
  </ElPanelSettings>
</template>
