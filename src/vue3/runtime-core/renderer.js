import { createApp } from './createApp'
import { ShapeFlags } from '../shared/utils'
import { createComponentInstance, setupComponent } from './component'
import { effect } from '../reactivity'

export function createRenderer(options) {
  console.log(options)
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
    insetElement: hostInsert,
    removeChild: hostRemove
  } = options

  const mountElement = (vnode, container) => {
    let { shapeFlag, props } = vnode
    let el = vnode.el = hostCreateElement(vnode.type);
    // 创建子孙节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el)
    }
    if(props){
      // 添加属性
      for(let key in props){
        hostPatchProp(el,key,null,props[key])
      }
    }
    hostInsert(el, container)
  }

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  const patchElement = (n1, n2, container) => { }

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      // 初次渲染挂载
      mountElement(n2, container)
    } else {
      // 更新
      patchElement(n1, n2, container)
    }
  }

  const processComponent = (n1, n2, container) => {
    if (n1 === null) {
      // 初次渲染挂载
      mountComponent(n2, container)
    } else {
      // 更新
      updateComponent(n1, n2, container)
    }
  }

  // 组件mount
  const mountComponent = (initialVnode, container) => {
    // 步骤：1、创建组件实例。2、找到组件render方法3、执行render
    const instance = initialVnode.component = createComponentInstance(initialVnode);
    setupComponent(instance)
    // 给组件创建一个effect，用于渲染,类似于vue2 中渲染watcher
    setupRenderEffect(instance, initialVnode, container)
  }

  // 组件更新
  const updateComponent = (n1, n2, container) => { }

  const setupRenderEffect = (instance, initialVnode, container) => {
    effect(function componentEffect() {
      if (!instance.isMounted) {
        // 保存渲染组件结果到subTree
        const subTree = instance.subTree = instance.render();
        patch(null, subTree, container)
        instance.isMounted = true;
      } else {
        // 更新操作
        let prev=instance.subTree;
        let next=instance.render();
        console.log(prev,next)
      }
    })
  }

  const patch = (n1, n2, container) => {
    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.ELEMENT) {
      console.log('元素节点', container)
      processElement(n1, n2, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      console.log('组件', container)
      processComponent(n1, n2, container)
    }
  }

  const render = (vnode, container) => {
    console.log('渲染器', vnode, container)
    patch(null, vnode, container)
  }

  return {
    createApp: createApp(render)
  }
}