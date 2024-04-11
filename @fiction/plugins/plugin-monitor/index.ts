import type { IncomingWebhookSendArguments } from '@slack/webhook'
import { IncomingWebhook } from '@slack/webhook'
import type { FictionApp, FictionAppEntry, FictionEmail, FictionEnv, FictionUser, User } from '@fiction/core'
import { EnvVar, FictionPlugin, isActualBrowser, isTest, vars } from '@fiction/core'
import { service } from '@fiction/www/src'

declare global {
  interface Window {
    __ls: any
    gtag?: (...args: any[]) => void
  }
}

vars.register(() => [
  new EnvVar({ name: 'SLACK_WEBHOOK_URL', isPublic: false }),
  new EnvVar({ name: 'SENTRY_PUBLIC_DSN', isPublic: true }),
])

interface FictionMonitorSettings {
  fictionEnv: FictionEnv
  fictionUser: FictionUser
  fictionApp: FictionApp
  fictionEmail: FictionEmail
  monitorEmail?: string
  slackWebhookUrl?: string
  sentryPublicDsn?: string
  mailchimpApiKey?: string
  mailchimpServer?: string
  mailchimpListId?: string
}

export class FictionMonitor extends FictionPlugin<FictionMonitorSettings> {
  monitorEmail = this.settings.monitorEmail || this.settings.fictionEnv.meta.app?.email
  isTest = isTest()
  slackWebhookUrl = this.settings.slackWebhookUrl
  sentryPublicDsn = this.settings.sentryPublicDsn
  constructor(settings: FictionMonitorSettings) {
    super('FictionMonitor', settings)

    this.settings.fictionUser.hooks.push({
      hook: 'requestCurrentUser',
      callback: async (user) => {
        await this.identifyUser(user)
      },
    })

    this.settings.fictionUser.hooks.push({
      hook: 'createUser',
      callback: async (user, { params }) => {
        if (!this.settings.fictionEnv?.isApp.value) {
          const { cityName, regionName, countryCode } = user.geo || {}
          await this.slackNotify({
            message: `user created: ${user.email}`,
            data: {
              name: user.fullName || 'No Name',
              emailVerified: user.emailVerified ? 'Yes' : 'No',
              location: `${cityName}, ${regionName}, ${countryCode}` || 'No Location',
              ...params,
            },
          })
        }
      },
    })

    this.settings.fictionApp.hooks.push({
      hook: 'beforeAppMounted',
      callback: async (entry) => {
        await this.installBrowserMonitoring(entry)
      },
    })
  }

  slackNotify = async (args: {
    message: string
    footer?: string
    data?: Record<string, unknown>
    notifyEmail?: string
  }): Promise<void> => {
    if (isActualBrowser())
      throw new Error('slack notify from server')

    const { message, data, notifyEmail = false } = args

    try {
      const SLACK_WEBHOOK_URL = this.slackWebhookUrl
      if (SLACK_WEBHOOK_URL) {
        const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL)

        let attachments: IncomingWebhookSendArguments['attachments'] = []
        if (data) {
          const { footer = 'data' } = args
          const fields = Object.entries(data)
            .filter((key, value) => value)
            .map(([key, value]) => {
              const short = !['message', 'text', 'description'].includes(key)
              return { title: key, value: value as string, short }
            })

          attachments = [
            {
              fields,
              footer,
              ts: String(Math.floor(Date.now() / 1000)),
            },
          ]
        }

        this.log.info(`slack notify: ${message}`)
        await webhook.send({
          text: message,
          attachments,
        })

        if (notifyEmail) {
          let markdownText = ''

          if (attachments && attachments.length > 0) {
            attachments[0].fields?.forEach((field) => {
              markdownText += `* **${field.title}**: ${field.value}\n`
            })
          }
          await this.settings.fictionEmail.sendEmail({
            to: this.monitorEmail,
            subject: `Notify: ${message}`,
            text: markdownText,
          })
        }
      }
      else {
        throw new Error('no SLACK_WEBHOOK_URL')
      }
    }
    catch (error) {
      console.error('SLACK ERROR', error)
    }
  }

  async installBrowserMonitoring(entry: FictionAppEntry): Promise<void> {
    const { app, service } = entry

    if (service.fictionEnv?.isProd.value && typeof window !== 'undefined') {
      const dsn = this.sentryPublicDsn
      if (!dsn)
        throw new Error('No Sentry DSN provided')

      const Sentry = await import('@sentry/vue')

      Sentry.init({
        app,
        dsn: 'https://1abd25278537c4f102638fac9b6d9e7c@o4504680560787456.ingest.us.sentry.io/4507067897872384',
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ['localhost', /^(https?:\/\/)?(\w+\.)?fiction\.com/],
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      })
    }
  }

  async identifyUser(user?: User) {
    if (user && typeof window !== 'undefined' && '__ls' in window) {
      /**
       * Identify user in LiveSession
       */
      window.__ls('identify', {
        name: user.fullName || 'No Name',
        email: user.email,
      })
    }
  }
}
