export const sleep = (millis) => new Promise(resolve => setTimeout(resolve, millis))

export const withTimeout = (millis, promise, action='unspesified') => Promise.race([promise, timeout(millis, action)])

const timeout = (millis, action) => new Promise((resolve, reject) => {
  let id = setTimeout(() => {
    clearTimeout(id)
    reject(`[${action}] timed out after ${millis} millis`)
  }, millis)
})

