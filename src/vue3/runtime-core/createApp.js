export function createApp(render) {
  return (rootComponent) => {
    const app = {
      mount(container) {
        console.log('平台无关mount', container)
        render()
      }
    }
    return app;
  }
}