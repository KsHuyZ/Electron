import { BrowserWindow, ipcMain } from "electron";
import wareHouseDB from "../../database/WareHouse-Receiving/wareHouse-Receiving";
import { WarehouseReceiving } from "../../types";

const WareHouse = (mainScreen: BrowserWindow) => {
  const {
    create_WareHouse_Receiving,
    getAllWareHouse,
    getAllReceiving,
    updateWarehouse,
    updateReceiving,
    getListWareHouseExceptId,
    getListReceiving,
    getAllWareHouseNoPagination,
  } = wareHouseDB;

  //listen create warehouse request
  ipcMain.handle(
    "create-new-warehouse",
    async (event, data: string) => {
      const newData = JSON.parse(data);
      const response = await create_WareHouse_Receiving(newData);
      return response;
    }
  );
  //listen create receiving request
  ipcMain.handle("create-new-receiving", async (event, data: string) => {
    const newData = JSON.parse(data);
    const response = await create_WareHouse_Receiving(newData);
    return response;
  });

  // listen get all WareHouse request
  ipcMain.handle(
    "warehouse-request-read",
    async (
      event,
      data: { pageSize: number; currentPage: number; id?: string } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      const response = await getAllWareHouse(pageSize, currentPage);
      return response;
    }
  );

  ipcMain.handle("get-warehouse-no-pagination", async (event) => {
    const response = await getAllWareHouseNoPagination();
    return response;
  });

  // listen get all Receiving request
  ipcMain.handle(
    "receiving-request-read",
    async (
      event,
      data: { pageSize: number; currentPage: number; id?: string } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      const response = await getAllReceiving(pageSize, currentPage);
      return response;
    }
  );

  //listen update WareHouse request
  ipcMain.handle(
    "update-warehouse",
    async (event, data: Pick<WarehouseReceiving, "name">) => {
      const response = await updateWarehouse(data);
      return response;
    }
  );
  //listen update Receiving request
  ipcMain.handle(
    "update-receiving",
    async (event, data: WarehouseReceiving, id: number) => {
      const response = await updateReceiving(data, id);
      return response;
    }
  );

  ipcMain.handle(
    "warehouse-list-except-id",
    async (event, idWareHouse: string) => {
      const response = await getListWareHouseExceptId(idWareHouse);
      return response;
    }
  );

  ipcMain.handle("receiving-list", async () => {
    const response = await getListReceiving();
    return response;
  });
};
export default WareHouse;
