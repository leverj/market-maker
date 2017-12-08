import fs from 'fs'
import json5 from 'json5'
import log4js from 'log4js'


const configFor = (env) => {
  const dir = './config/log4js'
  const filename = `${env}.json5`
  const path = fs.existsSync(`${dir}/${filename}`) ? `${dir}/${filename}` : `${dir}/default.json5`
  return json5.parse(fs.readFileSync(path, 'utf8'))
}
log4js.configure(configFor(process.env.NODE_ENV))


export const getLogger = (name) => log4js.getLogger(name)
