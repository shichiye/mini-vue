import { ReactiveFlags } from "./reactive"
import { activeEffect } from "./effect"

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    return Reflect.get(target, key, receiver)
  },
  set(target, key, newValue, receiver) {
    return Reflect.set(target, key, newValue, receiver)
  }
}
