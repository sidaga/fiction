<script lang="ts" setup>
import { useService, vue } from '@factor/api'
import ElForm from '@factor/ui/ElForm.vue'
import ElInput from '@factor/ui/ElInput.vue'
import ElButton from '@factor/ui/ElButton.vue'
import ElPanelSettings from './ElPanelSettings.vue'

const emit = defineEmits(['update:vis'])
const { factorUser, factorRouter } = useService()
const activeUser = factorUser.activeUser

const mode = vue.computed<'password' | 'email'>(() => {
  const cur = factorRouter.current.value
  return cur.query.mode === 'password' ? 'password' : 'email'
})
interface PanelForm {
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}
const form = vue.ref<Partial<PanelForm>>({})
const sending = vue.ref(false)
const isValid = vue.ref<boolean>(false)
const hasCode = vue.ref(false)
const formError = vue.ref('')
const vis = vue.ref(false)

async function sendOneTimeCode(): Promise<void> {
  let email

  if (mode.value === 'password')
    email = factorUser.activeUser.value?.email
  else
    email = form.value.email

  if (!email)
    return

  sending.value = true
  const r = await factorUser.requests.SendOneTimeCode.request({ email })

  if (r.status === 'success')
    hasCode.value = true

  sending.value = false
}

async function updateUser(): Promise<void> {
  const _action = mode.value === 'password' ? 'updatePassword' : 'updateEmail'
  const f = form.value

  if (!f.verificationCode) {
    formError.value = 'Verification code is required'
    return
  }
  if (!f.password) {
    formError.value = 'Password is required'
    return
  }

  if (_action === 'updateEmail' && !f.email) {
    formError.value = 'Email is required'
    return
  }

  const r = await factorUser.requests.UpdateCurrentUser.request({
    _action,
    fields: f as PanelForm,
  })

  if (r.status === 'success') {
    form.value = {}
    hasCode.value = false
    vis.value = false
    emit('update:vis', false)
    await factorRouter.goto('accountSettings')
  }
  else {
    formError.value = r.message ?? ''
  }
}

async function send(): Promise<void> {
  sending.value = true
  await updateUser()
  sending.value = false
}
</script>

<template>
  <ElPanelSettings>
    <div class="max-w-lg">
      <ElForm
        v-model:valid="isValid"
        :data="form"
        :notify="formError"
        @submit="send()"
      >
        <div class="my-6">
          <template v-if="mode === 'password'">
            <template v-if="!hasCode">
              <ElInput
                label="Change Password"
                sub-label="For your security, verify your email so you can change your password"
              >
                <div class="my-4">
                  <ElButton
                    btn="primary"
                    :loading="sending"
                    @click.prevent="sendOneTimeCode()"
                  >
                    Send Verification Code &rarr;
                  </ElButton>
                </div>
              </ElInput>
            </template>
            <template v-else>
              <input
                type="email"
                autocomplete="username"
                :value="activeUser?.email"
                class="hidden"
              >
              <ElInput
                v-model="form.verificationCode"
                class="my-8"
                input="InputOneTimeCode"
                label="Verify Account"
                sub-label="We emailed a one-time verification code."
                required
              />
              <ElInput
                v-model="form.password"
                class="my-8"
                input="InputPassword"
                label="New Password"
                sub-label="More than 6 characters"
                autocomplete="new-password"
                required
              />
              <ElButton
                type="submit"
                btn="primary"
                :disabled="!isValid"
                :loading="sending"
              >
                Save
              </ElButton>
            </template>
          </template>
          <template v-else-if="mode === 'email' && !hasCode">
            <ElInput
              v-model="form.email"
              class="my-6"
              input="InputEmail"
              label="New Email Address"
              autocomplete="email"
              required
            />

            <ElInput
              v-model="form.password"
              class="my-6"
              input="InputPassword"
              label="Current Password"
              required
            />

            <ElButton
              type="submit"
              btn="primary"
              :loading="sending"
              @click.prevent="sendOneTimeCode()"
            >
              Send Email Verification Code &rarr;
            </ElButton>
          </template>
          <template v-else-if="mode === 'email'">
            <ElInput
              v-model="form.verificationCode"
              class="my-8"
              input="InputOneTimeCode"
              label="Verify Account"
              sub-label="We emailed a one-time verification code."
              required
            />

            <ElButton
              type="submit"
              btn="primary"
              :loading="sending"
            >
              Confirm and Change Email &rarr;
            </ElButton>
          </template>
        </div>
      </ElForm>
    </div>
  </ElPanelSettings>
</template>
