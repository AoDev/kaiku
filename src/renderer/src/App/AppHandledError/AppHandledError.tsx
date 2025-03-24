import type {RootStore} from '@src/stores/RootStore'
import {Modal} from '@ui'
import {observer} from 'mobx-react'

/**
 * Default modal shown the user when we catch an error and handle it
 */
export const AppHandledError = observer(({rootStore}: {rootStore: RootStore}) => {
  if (!rootStore.handledError) {
    return null
  }
  const {title, description, error} = rootStore.handledError
  return (
    <Modal modalVM={rootStore.uiStore.handledErrorDialog} width="2x" withCloseButton height={400}>
      <div className="pad-default">
        <h3 className="h3 margin-top-0">{title}</h3>
        {description && <p>{description}</p>}
        {error && <p>{error.message}</p>}
      </div>
    </Modal>
  )
})
