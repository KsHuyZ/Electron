import React from 'react'
import ReactDOM from 'react-dom/client'
import './samples/node-api'
import './index.scss'
import { RouterProvider } from 'react-router-dom'
import router from "./router"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { ThemeConfig } from 'antd';
import {ConfigProvider} from 'antd';
import vi_VN from 'antd/locale/vi_VN';

const config: any = {
  token: {
    colorPrimary: '#00695c',
  },
  // '@border-color-base': '#00695c',
  // '@table-header-bg': '#f0f2f5', // Customize the table header background color
  // '@table-header-color': '#333', // Customize the table header text color
  // '@table-font-size': '32px',
  button: {
    hover: {
      color: '#00695c',
      borderColor: '#00695c',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={vi_VN} theme={config}>
      <ToastContainer />
      <div className="App">
        <RouterProvider router={router} />
      </div>
      </ConfigProvider>
,
)

postMessage({ payload: 'removeLoading' }, '*')
