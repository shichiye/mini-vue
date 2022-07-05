import { ReactiveFlags } from "./reactive"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operations"

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 依赖收集
    track(target, TrackOpTypes.GET, key)

    return Reflect.get(target, key, receiver)
  },
  set(target, key, newValue, receiver) {

    let oldValue = target[key]
    let result = Reflect.set(target, key, newValue, receiver)
    if (oldValue !== newValue) {
      // 执行依赖
      trigger(target, TriggerOpTypes.SET, key, newValue, oldValue)
    }

    return result
  }
}
