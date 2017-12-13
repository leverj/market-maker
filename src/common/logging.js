import fs from 'fs'
import log4js from 'log4js'


const configFor = (env) => {
  const dir = './config/log4js'
  const filename = `${env}.json`
  const path = fs.existsSync(`${dir}/${filename}`) ? `${dir}/${filename}` : `${dir}/default.json`
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}
log4js.configure(configFor(process.env.NODE_ENV))


export const getLogger = (name) => log4js.getLogger(name)
