import { isObject } from '@vue/shared'
import {mutableHandlers } from './baseHandler'

const proxyMap = new WeakMap()

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

/**
 * 将数据转换为响应式数据（只能做对象的代理）
 * 
 * @param target 代理对象
 */
export function reactive(target: object) {
  if (!isObject(target)) {
    return
  }

  // 代理对象被再次代理，直接返回
  // 如果target是代理对象，会进入get捕获器
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 同一个对象访问多次，返回已缓存的代理对象
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 并没有重新创建一个对象，而是直接将原对象的属性代理到新对象上
  // 取值的时候，会调用proxy的get方法
  // 赋值的时候，会调用proxy的set方法
  const proxy = new Proxy(target, mutableHandlers)

  proxyMap.set(target, proxy)
  return proxy
}
