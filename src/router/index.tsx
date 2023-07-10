import { Route, useLocation, Router, Outlet, createBrowserRouter } from "react-router-dom";
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

export default createBrowserRouter([
  {
    element: <Login />,
    path: "/"
  },
  {
    element: <MainLayout />,
    children: [
      {
        element: <Warehouse />,
        path: "/home",
      },
      {
        element: <Product />,
        path: "/products"
      },
      {
        element: <WareHouseItem />,
        path: "/home/:idWareHouse"
      },
      {
        element: <ItemSource />,
        path: "/item-source"
      },
      {
        element: <Recipient />,
        path: "/recipient"
      },
      {
        element: <RecipientItem />,
        path: "/recipient/:idRecipient"
      },
      {
        element: <ItemSource />,
        path: "/item-source/:id"
      },

    ]
  }
])