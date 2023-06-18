import { ipcMain } from "electron";
import wareHouseDB from "../../database/wareHouse/wareHouse";

const wareHouse = () => {
  const { createWareHouse, getAllWarehouse, updateWarehouse } = wareHouseDB;

  //listen create warehouse request
  ipcMain.on(
    "create-new-warehouse",
    (event, name: string, description: string) => {
      createWareHouse(name, description);
    }
  );

   // listen get all nguon hang request
   ipcMain.on(
    "warehouse-request-read",
    (
      event,
      data: { pageSize: number; currentPage: number } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      getAllWareHouse(pageSize, currentPage);
    }
  );

  ipcMain.on(
    "update-warehouse",
    (event, data: { name: string; description: string; id: number }) => {
      const { name, description, id } = data;
      updateWarehouse(name, description, id);
    }
  );

};
export default wareHouse;
