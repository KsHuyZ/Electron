import { ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { WarehouseItem } from "../../types";

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItem,
    deleteWareHouseItem,
    updateWareHouseItem,
    changeWareHouse,
  } = wareHouseItemDB;

  //  listen create warehouse item request
  ipcMain.on("create-product-item", (event, data: string) => {
    const newData = JSON.parse(data);
    createWareHouseItem(newData);
  });

  // listen get all warehouse item request

  ipcMain.on("warehouseitem-request-read", (
    event,
    data: { pageSize: number; currentPage: number; id?: string } = {
      pageSize: 10,
      currentPage: 1,
    }
  ) => {
    const { pageSize, currentPage } = data;
    getAllWarehouseItem(data.id ,pageSize, currentPage);
  });

  ipcMain.on(
    "update-warehouseitem",
    (event, data: WarehouseItem, id: number) => {
      updateWareHouseItem(data, id);
    }
  );

  // listen delete event
  ipcMain.on("delete-warehouseitem", (event, id: number) => {
    deleteWareHouseItem(id);
  });
  //Change warehouse
  ipcMain.on("change-warehouse", (event, id_newWareHouse:number, id_list: number[]) => {
    changeWareHouse(id_newWareHouse, id_list);
  });
};
export default wareHouseItem;
