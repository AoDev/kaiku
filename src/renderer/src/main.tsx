import 'virtual:svg-icons-register'
import './css/index.less'

import {Provider} from 'mobx-react'
import {createRoot} from 'react-dom/client'
import {App} from './App'
import {RootStore} from './stores/RootStore'

const rootStore = new RootStore()
createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider rootStore={rootStore}>
    <App rootStore={rootStore} />
  </Provider>
)

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.rootStore = rootStore
}
