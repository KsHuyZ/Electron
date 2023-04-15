
import { useState } from 'react'
import './App.scss'
import Sidebar from './components/SideBar/Sidebar'
import MainDash from "./components/MainDash/MainDash"
import RightSide from './components/RigtSide/RightSide'


function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="App">
    <div className="AppGlass">
      <Sidebar/>
      <MainDash/>
    </div>
  </div>
  )
}

export default App
