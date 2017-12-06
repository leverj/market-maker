import queue from 'queue'
import fs from 'fs'
import log4js from 'log4js'


export const configure = (filename) => JSON.parse(fs.readFileSync(`./config/${filename}`, 'utf8'))

log4js.configure(configure('log4js.json'))

export const getLogger = (name = 'market-maker') => log4js.getLogger(name)


const log = getLogger()

export const exceptionHandler = (e) => {
  log.error(e)
  //fixme: swallow or rethrow?
  throw e
}

export const print = (value) => {
  const prefix = '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  const suffix = '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'
  console.log(`${prefix}\n ${value}\n${suffix}`)
}

export const notify = (message) => {
  //fixme: beside logging, we need to notify operations ...
  // need to  use a slack or smtp logging transport
  log.warn(message)
}

export const JobQueue = {
  fromConfig: (config) => {
    const {capacity, timeout} = config
    const q = queue({limit: capacity, timeout: timeout, autostart: true})
    q.on('success', (result, job) => log.debug('finished processing: %s', jobToString(job)))
    q.on('error', (e, job) => { log.error('encountered a problem with: %s', jobToString(job), e); throw e })
    q.on('timeout', (next, job) => { log.error('job timed out: %s', jobToString(job)); next() })
//    q.on('end', (errors) => log.debug(`DONE :-${errors ? '(' : ')'}`)) //fixme: to be or not to be DONE?
    return q
  }
}
const jobToString = (job) => job.toString().replace(/\n/g, '')
