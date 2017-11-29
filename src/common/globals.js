
export const notify = (message) => {
  //fixme: beside logging, we need to notify operations ...
  console.log(message)
}

export const exceptionHandler = (e) => {
  //fixme: we need real logging ...
  console.log(`>>>>> ${e} <<<<<`)
  //fixme: and either and swallowing or gracefully shutdown
  //throw e
}
