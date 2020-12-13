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
    if (props) {
      // 添加属性
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    hostInsert(el, container)
  }

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  const patchProps=(oldProps,newProps,el)=>{
    if(oldProps!==newProps){
      // 新属性覆盖老属性
      for(let key in newProps){
        const prev=oldProps[key],
              next=newProps[key];
        if(prev!==next){
          hostPatchProp(el,key,prev,next)
        }
      }
      // 老得有属性，新的没有,需要删除属性
      for(let key in oldProps){
        if(!(key in newProps)){
          hostPatchProp(el,key,oldProps[key],null)
        }
      }
    }
  }

  const patchChildren=(n1,n2,el)=>{
    const c1=n1.children,
          c2=n2.children;
    const prevShapeFlag=n1.shapeFlag,
          shapeFlag=n2.shapeFlag;
    // 老节点是文本，新节点也是文本，直接覆盖
    // 老节点是数组，新节点是文本，直接覆盖
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      if(c2!==c1){
        hostSetElementText(el,c2)
      }
    }else {
      // 老节点是数组，新节点是数组，前后数组diff
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        console.log('核心diff')
      }else{
        // 老节点是文本，新节点是数组
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
          // 移除老的文本
          hostSetElementText(el,'')
        }
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
          // 插入新的数组
          for(let i=0;i<c2.length;i++){
            patch(null,c2[i],el)
          }
        }
      }
    }
  }

  const patchElement = (n1, n2, container) => {
    console.log('元素更新')
    let el = (n2.el = n1.el);
    const oldProps=n1.props || {};
    const newProps=n2.props || {};

    patchProps(oldProps,newProps,el);
    patchChildren(n1,n2,el)
  }

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
  const updateComponent = (n1, n2, container) => {
    console.log('组件更新')
  }

  const setupRenderEffect = (instance, initialVnode, container) => {
    effect(function componentEffect() {
      if (!instance.isMounted) {
        // 保存渲染组件结果到subTree
        const subTree = instance.subTree = instance.render();
        patch(null, subTree, container)
        instance.isMounted = true;
      } else {
        // 更新操作
        let prev = instance.subTree;
        let next = instance.render();
        patch(prev, next, container)
      }
    })
  }

  const isSameVnodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  }

  const patch = (n1, n2, container) => {
    const { shapeFlag } = n2;

    if (n1) {
      if (isSameVnodeType(n1, n2)) {
        // 节点相同，可以复用
        console.log('复用')
      } else {
        // 节点类型不同
        hostRemove(n1.el);
        n1 = null;
      }
    }

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