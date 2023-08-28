import { Route, Outlet, HashRouter, Routes, Navigate } from "react-router-dom";
import Login from "@/page/Login";
import Sidebar from "@/components/SideBar/Sidebar";
import { FC } from "react";
import "../App.scss"
import Warehouse from "@/page/Warehouse/Warehouse";
import ModalItemSource from "@/page/ItemSource/components/ModalItemSource";
import ItemSource from "@/page/ItemSource/ItemSource";
import Product from "@/page/Product/Product";
import WareHouseItem from "@/page/WarehouseItem/WareHouseItem";
import Recipient from "@/page/Recipient/Recipient";
import RecipientItem from "@/page/Recipient/components/RecipientItem";
import EntryForm from "@/page/EntryForm/EntryForm";
import History from "@/page/History/History";
import HistoryItem from "@/page/History/components/HistoryItem";
import UploadXlsx from "@/page/UploadXlsx";


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
          <Route path='/home/:idWareHouse/:nameWareHouse' element={<WareHouseItem />} />
          <Route path='/products' element={<Product />} />
          <Route path='/recipient' element={<Recipient />} />
          <Route path='/recipient/:idRecipient/:nameReceiving' element={<RecipientItem />} />
          <Route path='/item-source' element={<ItemSource />} />
          <Route path='/item-source/:id/:nameSource' element={<EntryForm />} />
          <Route path='/warehouse-item' element={<WareHouseItem />} />
          <Route path="/history" element={<Navigate to={"/history/import"} />} />
          <Route path="/history/export" element={<History />} />
          <Route path="/history/temp-export" element={<History />} />
          <Route path="/history/import" element={<History />} />
          <Route path="/history/temp-import" element={<History />} />
          <Route path="/history/import/:id" element={<HistoryItem />} />
          <Route path="/history/temp-import/:id" element={<HistoryItem />} />
          <Route path="/history/export/:id" element={<HistoryItem />} />
          <Route path="/history/temp-export/:id" element={<HistoryItem />} />
          <Route path='/upload-multiple/:idWareHouse/:nameWareHouse' element={<UploadXlsx />} />
        </Route>
        <Route path='/' element={<Login />} />
      </Routes>
    </HashRouter>
  )
}
export default Routers

