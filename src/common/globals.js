import {getLogger} from './logging'


const exceptions = getLogger('market-maker')
export const exceptionHandler = (e) => {
  exceptions.error(e)
  //fixme: swallow or rethrow?
  throw e
}


const ops = getLogger('ops-notifications')
export const notifyOps = (message) => ops.warn(message) //fixme: need to  use a slack or smtp logging transport


export const printJson = (value) => print(JSON.stringify(value, null, 2))
export const print = (value) => {
  const prefix = '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  const suffix = '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'
  console.warn(`${prefix}\n ${value}\n${suffix}`)
}

