import { reactive, ReactiveFlags } from "./reactive"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operations"
import { isObject } from "@vue/shared"

export const mutableHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 依赖收集
    track(target, TrackOpTypes.GET, key)

    let res = Reflect.get(target, key, receiver)

    if (isObject(res)) {
      return reactive(res)  // 深度代理
    }

    return res
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
