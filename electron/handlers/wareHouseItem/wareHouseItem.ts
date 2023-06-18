import { ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { WarehouseItem } from "../../types";

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItem,
    deleteWareHouseItem,
    updateWareHouseItem,
  } = wareHouseItemDB;

  //  listen create warehouse item request
  ipcMain.on("create-product-item", (event, data: string) => {
    const newData = JSON.parse(data);
    createWareHouseItem(newData);
  });

  // listen get all warehouse item request

  ipcMain.on("warehouseitem-request-read", (event, data: string) => {
    getAllWarehouseItem(data);
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
};
export default wareHouseItem;
