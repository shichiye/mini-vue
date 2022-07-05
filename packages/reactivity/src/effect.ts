import { TrackOpTypes, TriggerOpTypes } from "./operations"

export let activeEffect = undefined

const targetMap = new WeakMap()

class ReactiveEffect {
  // 在实例上新增了active属性
  active = true
  deps = []
  parent = undefined
  constructor(public fn) {  // 加上 public 后，传入的fn也会加到实例上
    
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
      // 当稍后调用取值操作的时候，可以获取到全局的 activeEffect，进行依赖收集
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
}

export function effect(fn) {

  const _effect = new ReactiveEffect(fn)

  _effect.run() // 默认执行一次
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

  const effects = depsMap.get(key)
  
  effects && effects.forEach(effect => {
    if (effect !== activeEffect) {
      effect.run()
    }
  })
}
