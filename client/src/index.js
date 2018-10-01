import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
//import registerServiceWorker from './registerServiceWorker'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import * as Sentry from '@sentry/browser'

import SLTool from './components/app/SLTool.jsx'

Sentry.init({ dsn: 'https://22b4aa67aad0493cbfd0445e3d7ba309@sentry.io/1292222' })


ReactDOM.render(<SLTool />, document.getElementById('root'))
//registerServiceWorker()
