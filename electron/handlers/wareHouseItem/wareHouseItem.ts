import { IpcMainEvent, ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { Intermediary, WarehouseItem } from "../../types";
import { startPrint } from "../../module/print";

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItembyWareHouseId,
    deleteWareHouseItem,
    updateWareHouseItem,
    deleteWareHouseItemInWarehouse,
    changeWareHouse,
    getAllWarehouseItem,
    exportWareHouse
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
      data: { pageSize: number; currentPage: number; id?: number; paramsSearch?: any; } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage, paramsSearch } = data;
      const response = await getAllWarehouseItembyWareHouseId(
        data.id,
        pageSize,
        currentPage,
        paramsSearch
      );
      return response;
    }
  );

  ipcMain.handle("get-all-warehouse-item", async (event, data) => {
    const { pageSize, currentPage } = data;
    const response = await getAllWarehouseItem(pageSize, currentPage);
    return response;
  });

  ipcMain.handle(
    "update-warehouseitem",
    async (event, data: WarehouseItem & Intermediary) => {
      const newWareHouse = await updateWareHouseItem(data);
      return newWareHouse;
    }
  );

  // listen delete event
  ipcMain.handle(
    "delete-warehouseitem",
    async (event, id: number, id_wareHouse: number) => {
      const isSuccess = await deleteWareHouseItem(id, id_wareHouse);
      return isSuccess;
    }
  );
  //Change warehouse
  ipcMain.handle(
    "change-warehouse",
    async (event, id_newWareHouse: number, id_list: Intermediary[]) => {
      const isSuccess = await changeWareHouse(id_newWareHouse, id_list);
      return isSuccess;
    }
  );

  ipcMain.handle("print-form", () => {
    startPrint(
      {
        htmlString: `<style>h1{color: #42b983}</style> <h1>hello world !</h1>`,
      },
      undefined
    );
    return null
  });
};

  ipcMain.handle(
    "export-warehouse",
    async (event, id_receiving: number, id_list: Intermediary[]) => {
      const isSuccess = await exportWareHouse(id_receiving, id_list);
      return isSuccess;
    }
  );
}  

export default wareHouseItem;
