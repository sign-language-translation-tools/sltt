import { toast } from 'react-toastify'

function stringify(err) {
  if (typeof err === 'string') return err
  return JSON.stringify(err)
}

export function displayError(message) { 
  message = stringify(message)
  console.log('<ERROR>', message)
  return toast.error(message, {autoClose: 10000}) 
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