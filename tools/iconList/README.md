# rsbuild svg sprite list plugin

List the icons in the sprite to get typescript definition and name list.

## usage

```ts
import {listIconsPlugin} from './tools/iconList'

const options = {
  srcFolder: string // where the sprite svg are
  destFile?: string // where an array with the name of icons will be written
  destTsDefinitions: string // where the TS definition will be written
  formatCode?: (code: string, parser?: string) => Promise<string> // how the generated files should be formatted
}

export default defineConfig({
  plugins: [
    listIconsPlugin({
      srcFolder: resolve('SOME_FOLDER', 'assets', 'svg-sprite'),
      // destFile: path.resolve(SRC_FOLDER, 'assets', 'svg-sprite', 'icons.ts'),
      destTsDefinitions: resolve('SOME_FOLDER', 'iconNames.d.ts'),
    }),
  ],
})
```

### Example of creating your formatting function with prettier

```ts
import prettier from 'prettier'

// format
const prettierFormat = async (code: string, parser?: string) => {
  const options = await prettier.resolveConfig('.prettierrc')
  return prettier.format(code, {...options, parser})
}

listIconsPlugin({formatCode: prettierFormat, ...})
```
