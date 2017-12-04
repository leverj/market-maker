import queue from 'queue'

export const log = (message) => console.log(message)

export const JobQueue = {
  fromConfig: (config) => {
    const {capacity, timeout_milliseconds} = config
    const q = queue({limit: capacity, timeout: timeout_milliseconds, autostart: true})
    q.on('success', (result, job) => log(`finished processing:${job.toString().replace(/\n/g, '')}`))
    q.on('error', (e, job) => { log(`encountered a problem with ${job.toString().replace(/\n/g, '')}`, e); throw e })
    q.on('timeout', (next, job) => { log(`job timed out:, ${job.toString().replace(/\\n/g, '')}`); next() })
//    q.on('end', (errors) => log(`DONE :-${errors ? '(' : ')'}`))
    return q
  }
}

export const exceptionHandler = (e) => {
  //fixme: we need real logging ...
  log(`>>>>> ${e} <<<<<`)
  //fixme: and either and swallowing or gracefully shutdown
  throw e
}

export const print = (value) => {
  const prefix = '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  const suffix = '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'
  log(`${prefix}\n ${value}\n${suffix}`)
}

export const notify = (message) => {
  //fixme: beside logging, we need to notify operations ...
  print(message)
}
