/**
 * @vitest-environment happy-dom
 */

import { beforeAll, describe } from 'vitest'
import type { ServiceList } from '@fiction/core'
import type { Interaction } from '@fiction/core/test-utils'
import { createTestUtilServices, testComponentStability } from '@fiction/core/test-utils'

import { inputs } from '../inputs/index.js'

let service: ServiceList

describe('inputs', async () => {
  beforeAll(async () => {
    service = createTestUtilServices()
  })

  await testComponentStability({
    name: 'InputText',
    Component: inputs.InputText.el,
    service,
    interactions: [
      { action: 'typeText', expectedValue: 'hello', typeText: 'hello' },
      { action: 'typeText', expectedValue: 'world', typeText: 'world' },
    ],
  })
  const p = Object.entries(inputs).map(async ([name, conf]) => {
    const textInputs = ['InputText', 'InputTextarea', 'InputPassword', 'InputEmail', 'InputUrl']

    const props: Record<string, any> = {}
    if (name === 'InputUsername') {
      props.table = 'fiction_user'
    }

    const interactions: Interaction[] = textInputs.includes(name)
      ? [
          { action: 'typeText', expectedValue: 'hello', typeText: 'hello' },
          { action: 'typeText', expectedValue: 'world', typeText: 'world' },
        ]
      : []

    await testComponentStability({ name, Component: conf.el, service, interactions, props })
  })
  await Promise.all(p)
})
