import { Route, useLocation, Router, Outlet, createBrowserRouter, Navigate, HashRouter, Routes } from "react-router-dom";
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
import RecipientItem from "@/page/Recipient/components/RecipientItem";


export const MainLayout: FC = () => {
  return (
    <div className="AppGlass">
      <Sidebar />
      <div className="MainDash">
        <Outlet />
        {/* <Login /> */}
      </div>
    </div>
  );
};

const Routers = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to={'/login'} />} />
        <Route element={<MainLayout />}>
          <Route path='/home' element={<Warehouse />} />
          <Route path='/home/:idWareHouse' element={<WareHouseItem />} />
          <Route path='/recipient' element={<Recipient />} />
          <Route path='/recipient/:idRecipient' element={<RecipientItem />} />
          <Route path='/item-source' element={<ItemSource />} />
          <Route path='/warehouse-item' element={<WareHouseItem />} />
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </HashRouter>
  )
}

export default Routers

// export default createBrowserRouter([
//   {
//     element: <Navigate to={"/login"} />,
//     path: "/"
//   },
//   {
//     element: <Login />,
//     path: "/login"
//   },
//   {
//     element: <MainLayout />,
//     children: [
//       {
//         element: <Warehouse />,
//         path: "/home",
//       },
//       // {
//       //   element: <Product />,
//       //   path: "/home/:id"
//       // },
//       {
//         element: <WareHouseItem />,
//         path: "/home/:idWareHouse"
//       },
//       {
//         element: <ItemSource />,
//         path: "/item-source"
//       },
//       {
//         element: <Recipient />,
//         path: "/recipient"
//       },
//       {
//         element: <RecipientItem />,
//         path: "/recipient/:idRecipient"
//       },
//       {
//         element: <ItemSource />,
//         path: "/item-source/:id"
//       },

//     ]
//   }
// ])