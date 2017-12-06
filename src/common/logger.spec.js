import {getLogger} from './globals'


describe('logger', () => {
  it('use log4js', () => {
    const log = getLogger('test')
    log.trace('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object)
    log.debug('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4])
    log.info('hello %s %d', 'world', 123, {foo:'bar'})
    log.warn('hello %s', 'world', 123)
    log.error('hello', 'world')
    log.fatal('hello')
  })

})
