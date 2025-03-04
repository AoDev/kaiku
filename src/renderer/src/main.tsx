import './assets/main.css'
import './css/index.less'

import React from 'react'
import {Provider} from 'mobx-react'
import {createRoot} from 'react-dom/client'
import {App} from './App'
import {RootStore} from './stores/RootStore'

const rootStore = new RootStore()
createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider rootStore={rootStore}>
      <App rootStore={rootStore} />
    </Provider>
  </React.StrictMode>
)

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.rootStore = rootStore
}
