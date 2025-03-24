import {withVM} from '@lib/mobx/withVM'
import {App} from './App'
import {AppVM} from './AppVM'
export default withVM(App, AppVM)
