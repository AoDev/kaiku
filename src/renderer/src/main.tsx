import 'virtual:svg-icons-register'
import './css/index.less'

import {Provider} from 'mobx-react'
import {createRoot} from 'react-dom/client'
import App from './App'
import {RootStore} from './stores/RootStore'

const rootStore = new RootStore()
rootStore.init()

createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider rootStore={rootStore} uiStore={rootStore.uiStore}>
    <App />
  </Provider>
)

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.rootStore = rootStore
}
