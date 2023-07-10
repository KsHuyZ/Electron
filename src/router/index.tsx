import { Route, useLocation, Router, Outlet, createBrowserRouter, HashRouter, Routes, Navigate } from "react-router-dom";
import Login from "@/page/Login";
import Sidebar from "@/components/SideBar/Sidebar";
import { FC } from "react";
import MainDash from "@/components/MainDash/MainDash";
import TableData from "@/components/TableData/TableData";
import "../App.scss"
import Warehouse from "@/page/Warehouse/Warehouse";
import ModalItemSource from "@/page/ItemSource/components/ModalItemSource";
import ItemSource from "@/page/ItemSource/ItemSource";
import Product from "@/page/Product/Product";
import WareHouseItem from "@/page/WarehouseItem/WareHouseItem";
import Recipient from "@/page/Recipient/Recipient";


const MainLayout: FC = () => {
  return (
    <div className="AppGlass">
      <Sidebar />
      <div className="MainDash">
        <Outlet />
      </div>
    </div>
  );
};

const Routers = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/home' element={<Warehouse />} />
          <Route path='/home/:idWareHouse' element={<WareHouseItem />} />
          <Route path='/recipient' element={<Recipient />} />
          <Route path='/item-source' element={<ItemSource />} />
          <Route path='/warehouse-item' element={<WareHouseItem />} />
        </Route>
        <Route path='/' element={<Login />} />
      </Routes>
    </HashRouter>
  )
}
export default Routers
