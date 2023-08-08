import React, { FormEvent, SyntheticEvent, useEffect, useRef, useState } from 'react'
import "./login.scss"
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Input, Button, InputRef } from 'antd';
const { ipcRenderer } = window.require('electron');
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [error, setError] = useState("")
  const [loadings, setLoadings] = useState<boolean[]>([]);

  const navigate = useNavigate()

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

  const handleLogin = (e:SyntheticEvent) => {
    e.preventDefault()
    const username = userNameInput.current!.input!.value || 'admin'
    const password = passwordInput.current!.input!.value || '123456789'
    if (username === "" || password === "") {
      setError("Tên đăng nhập và mật khẩu trống")
    } else {
      ipcRenderer.send("login-request", { username, password })
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[0] = true;
        return newLoadings;
      });

    }
  }

  const handleLoginSucess = () => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[0] = false;
      return newLoadings;
    });
    navigate("/home")
  }

  const handleLoginFailed = () => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[0] = false;
      return newLoadings;
    });
    setError("Thông tin đăng nhập không đúng")
  }

  useEffect(() => {
    ipcRenderer.on('login-success', handleLoginSucess);
    ipcRenderer.on('login-failed', handleLoginFailed);
    return () => {
      ipcRenderer.removeListener('login-success', handleLoginSucess)
      ipcRenderer.removeListener('login-failed', handleLoginFailed)
    }
  }, [])

  const closeApp = () => {
    ipcRenderer.send('close', [])
  }

  return (
    <div className='login-form'>
      <form className="form" onSubmit={handleLogin}>
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
            <Button type="primary" htmlType='submit'>Đăng nhập</Button>
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
