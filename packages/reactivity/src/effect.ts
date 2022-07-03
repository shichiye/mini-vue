
export let activeEffect = undefined

class ReactiveEffect {
  // 在实例上新增了active属性
  active = true
  constructor(public fn) {  // 加上 public 后，传入的fn也会加到实例上
    
  }

  run() {
    // 非激活状态下，只需要执行函数，不需要进行依赖收集
    if (!this.active) {
      return this.fn()
    }

    // 激活状态下，需要执行依赖收集
    try {
      // 将当前的 effect 和 稍后渲染的属性关联在一起
      activeEffect = this
      // 当稍后调用取值操作的时候，可以获取到全局的 activeEffect，进行依赖收集
      return this.fn()
    } finally {
      activeEffect = undefined
    }
  }
}

export function effect(fn) {

  const _effect = new ReactiveEffect(fn)

  _effect.run() // 默认执行一次
}
