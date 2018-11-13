import { toast } from 'react-toastify'
import * as Sentry from '@sentry/browser'


function stringify(err) {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.toString()
  return JSON.stringify(err)
}

export function displayError(err) { 
  let message2 = stringify(err)
  console.log('<ERROR>', err, message2)
  Sentry.captureException(err)
  return toast.error(message2, {autoClose: 20000}) 
}

export function displayInfo(message) { 
  message = stringify(message)
  console.log('<INFO>', message)
  return toast.info(message, {autoClose: 60000, position: toast.POSITION.TOP_RIGHT}) 
}

export function displaySuccess(message) { 
  message = stringify(message)
  console.log('<SUCCESS>', message)
  return toast.success(message, { position: toast.POSITION.TOP_RIGHT })
}

export function dismissDisplay(_id) {
  toast.dismiss(_id)
}

 

// http://uk.discovermeteor.com/chapters/errors/