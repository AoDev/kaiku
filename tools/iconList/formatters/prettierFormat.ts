// @ts-expect-error need to install prettier in devDependencies
import prettier from 'prettier'

/**
 * Formats code using Prettier.
 *
 * Note: Requires prettier to be installed in the project's dependencies.
 *
 * @param code - The code to format as a string
 */
export const prettierFormat = async (code: string) => {
  const options = await prettier.resolveConfig('.prettierrc')
  return prettier.format(code, {...options})
}
