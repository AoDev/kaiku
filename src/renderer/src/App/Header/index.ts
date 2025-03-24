import {withVM} from '@lib/mobx/withVM'
import {Header} from './Header'
import {HeaderVM} from './HeaderVM'
export default withVM(Header, HeaderVM)
