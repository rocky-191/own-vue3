// import {reactive, effect} from '@vue/reactivity'
// 手写reactive核心
// import {reactive,effect} from './vue3/index.js'

// const state=reactive({
//   students:[
//     {
//       id:'1',
//       name:'jack'
//     },
//     {
//       id:'2',
//       name:'tom'
//     }
//   ],
//   user:[1,2,3],
//   count:0
// })

// console.log(state.count)

// state.count=1;
// state.students.push({
//   id:'3',
//   name:'jarry'
// })

// console.log(state.students)

// effect(()=>{
//   console.log('执行')
//   app.innerHTML=`hello world,count is ${state.count}`
//   // app.innerHTML=state.students.length;
//   // app.innerHTML=state.students[2];
//   // app.innerHTML=state.user;
// })

// setTimeout(()=>{
//   state.count++
// },2000)

// 数组处理
// setTimeout(()=>{
//   // state.students.length=100
//   state.students.length=1
// },3000)


// setTimeout(()=>{
//   state.user[10]=2;
// },3000)
import { createApp, reactive } from './vue3/index'

const App = {
  setup() {
    const state = reactive({
      user: {
        name: 'rocky',
        age: 18
      }
    })
    return {
      state
    }
  }
}

createApp(App).mount(document.getElementById("app"))