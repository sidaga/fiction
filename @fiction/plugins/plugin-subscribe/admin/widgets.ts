import { Widget } from '@fiction/admin/dashboard/widget'
import { vue } from '@fiction/core'
import { type SubscriberEndpointSettings, SubscriptionAnalytics } from '../endpoint.js'

export function getWidgets(service: SubscriberEndpointSettings) {
  const query = new SubscriptionAnalytics({ ...service })

  const subscribers = new Widget({
    key: 'subscribers',
    query,
    title: 'Subscribers',
    description: 'New subscribers',
    el: vue.defineAsyncComponent<vue.Component>(async () => import('./chartSubscribers.vue')),
    layoutHandling: 'chart',
    valueKey: 'subscriptions',
  })

  const unsubscribes = new Widget({
    key: 'unsubscribes',
    query,
    title: 'Unsubscribes',
    description: 'People who have unsubscribed',
    el: vue.defineAsyncComponent<vue.Component>(async () => import('./chartSubscribers.vue')),
    layoutHandling: 'chart',
    valueKey: 'unsubscribes',
  })

  return { subscribers, unsubscribes }
}
