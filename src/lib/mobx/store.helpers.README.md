## Example

Creating a store

```ts
import * as store from 'lib/mobx/store.helpers'
import * as mobx from 'mobx'
import RootStore from 'src/stores/RootStore'

export default class NoteStore {
  rootStore: RootStore
  set: store.SetMethod<NoteStore>
  assign: store.AssignMethod<NoteStore>
  toggle: store.ToggleMethod<NoteStore>

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.set = store.setMethod<NoteStore>(this)
    this.assign = store.assignMethod<NoteStore>(this)
    this.toggle = store.toggleMethod<NoteStore>(this)
    mobx.makeAutoObservable(this, {rootStore: false}, {deep: false, autoBind: true})
  }
}
```
