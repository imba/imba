// MIT license. Credits https://github.com/ElMassimo/vite-plugin-environment
import { resolve } from 'path'
import { loadEnv } from 'vite'
import type { Plugin } from 'vite'

/**
 * Provide a default string that will be used if the `process.env` value is not
 * defined.
 *
 * Use `undefined` for required variables which should cause the build to fail
 * if missing.
 *
 * Use `null` for optional variables.
 *
 * NOTE: Although you could technically pass a boolean or a number, all
 * process.env values are strings, and the inconsistency would make it easy to
 * introduce sutble bugs.
 */
export type EnvVarDefault = string | null | undefined

export type EnvVarDefaults = Record<string, EnvVarDefault>

export type EnvVars = 'all' | string[] | EnvVarDefaults

export interface EnvOptions {
  /**
   * Only variables that match this prefix will be made available.
   * @default ''
   * @example EnvironmentPlugin('all', { prefix: 'VUE_APP_' })
   */
  prefix?: string
  /**
   * You may also expose variables on `'import.meta.env'.
   * @default 'process.env'
   * @example EnvironmentPlugin(['NODE_ENV'], { defineOn: 'import.meta.env' })
   */
  defineOn?: string
  /**
   * Whether to load environment variables defined in `.env` files.
   * @default true
   */
  loadEnvFiles?: boolean
}

function defineEnvVars (env: EnvVarDefaults, defineOn: string, keys: string[], defaultValues: EnvVarDefaults) {
  return keys.reduce((vars, key) => {
    const value = env[key] === undefined ? defaultValues[key] : env[key]
    if (value === undefined) throwMissingKeyError(key)
    vars[`${defineOn}.${key}`] = JSON.stringify(value)
    return vars
  }, {} as Record<string, string | null>)
}

function loadProcessEnv (prefix: string) {
  if (prefix === '') return process.env
  return Object.fromEntries(Object.entries(process.env).filter(([key, _value]) => key.startsWith(prefix)))
}

function throwMissingKeyError (key: string) {
  throw new Error(`vite-plugin-environment: the \`${key}\` environment variable is undefined.\n\n`
    + 'You can pass an object with default values to suppress this warning.\n'
    + 'See https://github.com/ElMassimo/vite-plugin-environment for guidance.',
  )
}

/**
 * Expose `process.env` environment variables to your client code.
 *
 * @param  {EnvVars} vars Provide a list of variables you wish to expose,
 *                        or an object that maps variable names to defaut values
 *                        to use when a variable is not defined.
 *                        Use 'all' to expose all variables that match the prefix.
 * @param  {EnvOptions} options
 */
export default function EnvironmentPlugin (vars: EnvVars, options: EnvOptions = {}): Plugin {
  const { prefix = '', defineOn = 'process.env', loadEnvFiles = true } = options
  return {
    name: 'vite-plugin-environment',
    config ({ root = process.cwd(), envDir }, { mode }) {
      const resolvedRoot = resolve(root)
      envDir = envDir ? resolve(resolvedRoot, envDir) : resolvedRoot

      const env = loadEnvFiles ? loadEnv(mode, envDir, prefix) : loadProcessEnv(prefix)
      const keys = vars === 'all' ? Object.keys(env) : Array.isArray(vars) ? vars : Object.keys(vars)
      const defaultValues = vars === 'all' || Array.isArray(vars) ? {} : vars
      return { define: defineEnvVars(env, defineOn, keys, defaultValues) }
    },
  }
}