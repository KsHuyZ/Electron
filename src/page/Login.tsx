import React, { useEffect, useRef, useState } from 'react'
import "./login.scss"
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Input, Button, InputRef } from 'antd';
const { ipcRenderer } = window.require('electron');
import { useNavigate } from 'react-router-dom';
import toastify from "../lib/toastify"

const Login = () => {

  const [error, setError] = useState("")

  const navigate = useNavigate()

  const { notifySuccess } = toastify

  const passwordInput = useRef<InputRef | null>(null);
  const userNameInput = useRef<InputRef | null>(null);

  const handleDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "ArrowDown") {
      passwordInput.current!.focus()
    }
  }

  const handleUpInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "ArrowUp") {
      userNameInput.current!.focus()
    }
  }

  const handleLogin = () => {
    const username = userNameInput.current!.input!.value
    const password = passwordInput.current!.input!.value
    if (username === "" || password === "") {
      setError("Tên đăng nhập và mật khẩu trống")
    } else {
      ipcRenderer.send("login-request", { username, password })
    }
  }

  useEffect(() => {
    ipcRenderer.on('login-success', (event, data) => {
      console.log(data.message); // "Hello from main process!"
      navigate("/home")
    });

    ipcRenderer.on('login-failed', (event, data) => {
      console.log(data.message); // "Hello from main process!"
      setError("Thông tin đăng nhập không đúng")
    });

  }, [])

  const closeApp = () => {
    ipcRenderer.send('close', [])
  }

  return (
    <div className='login-form'>
      <form className="form">
        <div className="header">
          <h2 className="title">Đăng nhập</h2>
        </div>
        <div className="form-input">
          <div className="input">
            <Input size="large" placeholder="Tên đăng nhập" prefix={<UserOutlined />} onKeyDown={handleDownInput} ref={userNameInput} autoFocus />
          </div>
          <div className="error">{error}</div>
          <div className="input">
            <Input.Password placeholder="Mật khẩu" size="large" prefix={<LockOutlined />} onKeyDown={handleUpInput} ref={passwordInput} />
          </div>
        </div>
        <div className="submit-form">
          <div className="login">
            <Button type="primary" onClick={handleLogin}>Đăng nhập</Button>
          </div>
          <div className="exit">
            <Button type="primary" danger ghost onClick={closeApp}>
              <span>Thoát</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
