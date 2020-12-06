import { createApp } from './createApp'

export function createRenderer(options) {
  console.log(options)
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {

  const render = (vnode, container) => {
    console.log('渲染器')
  }
  return {
    createApp: createApp(render)
  }
}