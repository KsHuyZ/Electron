import { IpcMainEvent, ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { Intermediary, WarehouseItem } from "../../types";

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItembyWareHouseId,
    deleteWareHouseItem,
    updateWareHouseItem,
    deleteWareHouseItemInWarehouse,
    changeWareHouse,
    getWareHouseItemBySource
  } = wareHouseItemDB;

  //  listen create warehouse item request
  ipcMain.handle(
    "create-product-item",
    async (event: IpcMainEvent, data: string) => {
      const newData = JSON.parse(data);
      const isCreated = await createWareHouseItem(newData);
      return isCreated;
    }
  );

  // listen get all warehouse item request

  ipcMain.handle(
    "warehouseitem-request-read",
    async (
      event,
      data: { pageSize: number; currentPage: number; id?: number } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      const response = await getAllWarehouseItembyWareHouseId(
        data.id,
        pageSize,
        currentPage
      );
      return response;
    }
  );

  ipcMain.handle(
    "update-warehouseitem",
    async (event, data: WarehouseItem & Intermediary) => {
      const newWareHouse = await updateWareHouseItem(data);
      return newWareHouse;
    }
  );

  // listen delete event
  ipcMain.handle("delete-warehouseitem", async (event, id: number, id_wareHouse: number) => {
    const isSuccess = await deleteWareHouseItem(id, id_wareHouse);
    return isSuccess;
  });
  //Change warehouse
  ipcMain.handle(
    "change-warehouse",
    async (event, id_newWareHouse: number, id_list: Intermediary[]) => {
      console.log(id_newWareHouse, id_list);
      
      const isSuccess = await changeWareHouse(id_newWareHouse, id_list);
      return isSuccess;
    }
  );
  //Filter warehouseItem by Source
  ipcMain.handle('filterWarehouseItemsBySource', async (event, Source_name) => {
    try {
      const newData = await getWareHouseItemBySource(Source_name);
      return newData;
    } catch (err) {
      console.log(err);
      return null;
    }
  });
}  
export default wareHouseItem;
