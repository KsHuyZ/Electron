import { ipcMain } from "electron";
import wareHouseDB from "../../database/wareHouse/wareHouse";

const wareHouse = () => {
  const { createWareHouse, getAllWarehouse } = wareHouseDB;

  //listen create warehouse request
  ipcMain.on(
    "create-new-warehouse",
    (event, name: string, description: string) => {
      createWareHouse(name, description);
    }
  );

  // listen get all warehouse request
  ipcMain.on("warehouse-request-read", () => {
    getAllWarehouse();
  });
};
export default wareHouse;
