import kaikuBroken from '@src/assets/images/kaiku-broken.jpg'
import type {RootStore} from '@src/stores'
import {Button} from '@ui'
import {observer} from 'mobx-react'

/**
 * App error screen. User can not continue and can only reload the app.
 */
export const AppUnexpectedError = observer(({rootStore}: {rootStore: RootStore}) => {
  const {unexpectedError} = rootStore
  if (!unexpectedError) {
    return null
  }

  return (
    <div className="app-error pad-page">
      <div className="txt-center">
        <img className="app-error-img" src={kaikuBroken} alt="Kaiku broken" />

        <h2 className="h2 txt-bad margin-0">Something went wrong</h2>
        <span className="txt-muted">Sorry :( </span>

        <div className="txt-left">
          <h3 className="h3">Error</h3>
          <p>{unexpectedError.message}</p>
        </div>
        <div className="margin-top-1">
          <Button
            variant="blackwhite"
            onClick={() => window.location.reload()}
            className="button button-secondary"
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  )
})
