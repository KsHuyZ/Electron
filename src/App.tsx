import './App.scss'
import Sidebar from './components/SideBar/Sidebar'
import MainDash from "./components/MainDash/MainDash"

function App() {
  return (
    <div className="App">
      <div className="AppGlass">
        <Sidebar />
        <MainDash />
      </div>
    </div>
  )
}

export default App
