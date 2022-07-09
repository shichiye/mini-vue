import { TrackOpTypes, TriggerOpTypes } from "./operations"

export let activeEffect = undefined

const targetMap = new WeakMap()

function cleanupEffect(effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    effect.deps.length = 0
  }
}

class ReactiveEffect {
  // 在实例上新增了active属性
  active = true
  deps = []
  parent = undefined
  constructor(public fn, public scheduler) {  // 加上 public 后，传入的fn也会加到实例上
    
  }

  run() {
    // 非激活状态下，只需要执行函数，不需要进行依赖收集
    if (!this.active) {
      return this.fn()
    }

    // 激活状态下，需要执行依赖收集
    try {
      // 记录当前执行的 activeEffect
      this.parent = activeEffect
      // 将当前的 effect 和 稍后渲染的属性关联在一起
      activeEffect = this

      // 在执行函数之前将之前手机的内容清空
      cleanupEffect(this)

      // 当稍后调用取值操作的时候，可以获取到全局的 activeEffect，进行依赖收集
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

export function effect(fn, options?) {

  const _effect = new ReactiveEffect(fn, options?.scheduler)

  _effect.run() // 默认执行一次

  const runner = _effect.run.bind(_effect)

  runner.effect = _effect

  return runner
}


export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  let shouldTrack = !dep.has(activeEffect)

  if (shouldTrack) {
    dep.add(activeEffect)
    // 让 effect 记录对应的属性，以便后续清除
    activeEffect.deps.push(dep)
  }
}


export function trigger(
  target: object,
  type: TriggerOpTypes,
  key: unknown,
  newValue: unknown,
  oldValue: unknown
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  let effects = depsMap.get(key)

  if (effects) {
    effects = [...effects]
    effects.forEach(effect => {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}
