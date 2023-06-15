import { ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";

const wareHouseItem = () => {
  const { createWareHouseItem, getAllProductInWarehouse } = wareHouseItemDB;

  //  listen create warehouse item request
  ipcMain.on("create-product-item", (event, data: string) => {
    const newData = JSON.parse(data);
    createWareHouseItem(newData);
  });

  // listen get all warehouse item request

  ipcMain.on("warehouseitem-request-read", (event, data: string) => {
    getAllProductInWarehouse(data);
  });
};
export default wareHouseItem;
