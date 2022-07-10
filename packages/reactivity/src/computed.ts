import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect"
import { ReactiveFlags } from "./reactive"

class ComputedRefImpl {
  public dep

  public _value
  public effect

  public readonly [ReactiveFlags.IS_READONLY]: boolean = false
  public readonly __v_isRef = true

  public _dirty = true

  constructor(public getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty)
        this._dirty = true
      
      triggerEffects(this.dep)
      
    })
  }

  get value() {

    // 做依赖收集
    trackEffects(this.dep || (this.dep = new Set()))

    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }

    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetters = isFunction(getterOrOptions)
  let getter
  let setter

  if (onlyGetters) {
    getter = getterOrOptions
    setter = () => { console.warn('Write operation failed: computed value is readonly') }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
