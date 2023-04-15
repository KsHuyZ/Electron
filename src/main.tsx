import React from 'react'
import ReactDOM from 'react-dom/client'
import './samples/node-api'
import './index.scss'
import { RouterProvider } from 'react-router-dom'
import router from "./router"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastContainer />
    <div className="App">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
