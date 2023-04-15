import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './samples/node-api'
import './index.scss'
import { BrowserRouter, RouterProvider } from 'react-router-dom'
import router from "./router"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="App">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
