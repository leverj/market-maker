
export const exceptionHandler = (e) => {
  console.log(`>>>>> ${e} <<<<<`)
  throw e
}

export async function sleep(millis) { return new Promise(resolve => setTimeout(resolve, millis)) }

export const print = (value) => {
  const prefix = '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  const suffix = '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'
  console.log(`${prefix}\n ${value}\n${suffix}`)
}

export const now = () => new Date // UTC
export const utcString = (utcDate) => utcDate.toUTCString()
