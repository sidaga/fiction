import events from "events"
import { log } from "../plugin-log"

let eventBus: NodeJS.EventEmitter | undefined = undefined
const getGlobalEventBus = (): NodeJS.EventEmitter => {
  if (!eventBus) {
    eventBus = new events.EventEmitter()
    eventBus.setMaxListeners(50)
  }

  return eventBus
}

/**
 * Emits an event which can be listened to from onEvent
 */
export const emitEvent = (event: string, ...data: unknown[]): void => {
  getGlobalEventBus().emit(event, ...data)
  // log.debug("emitEvent", `new event: ${event}`, { data })
}
/**
 * Listens for an event emitted by emitEvent
 */
export const onEvent = (
  event: string,
  callback: (...args: any[]) => void,
): NodeJS.EventEmitter => {
  return getGlobalEventBus().on(event, callback)
}
/**
 * Removes an event
 */
export const removeEvent = (
  event: string,
  callback: (...args: any[]) => void,
): void => {
  getGlobalEventBus().off(event, callback)
}
