import { BrowserWindow, ipcMain } from "electron";
import countDeliveryDB from "../../database/countDelivery/countDelivery";
import { DataType } from "../../types";
import { startPrint } from "../../module/print";
import { formExportBill } from "../../utils/formExportBill";

const {
  getCountDelivery,
  getDeliveryItem,
  getDeliveryItembyDeliveryID,
  approveAccept,
  getWareHouseItemOfficialInWareHouse,
} = countDeliveryDB;

const countDelivery = (mainScreen: BrowserWindow) => {
  ipcMain.handle(
    "get-history-export",
    async (
      event,
      { current, pageSize }: { current: number; pageSize: number }
    ) => {
      const result = await getCountDelivery(pageSize, current);
      return result;
    }
  );
  ipcMain.handle("get-delivery-item", async (event, id: number) => {
    const result = await getDeliveryItem(id);
    return result;
  });
  ipcMain.handle("get-export-item-by-id", async (event, ID: number) => {
    return await getDeliveryItembyDeliveryID(ID);
  });
  ipcMain.handle("approve-export", async (event, id: number | string) => {
    return await approveAccept(id);
  });
  ipcMain.handle(
    "get-warehouse-item-official",
    async (
      event,
      data: {
        pageSize: number;
        currentPage: number;
        id?: number;
        paramsSearch?: any;
        listEntryForm: DataType[];
      }
    ) => {
      const { pageSize, currentPage, paramsSearch, id, listEntryForm } = data;
      const result = await getWareHouseItemOfficialInWareHouse(
        id,
        pageSize,
        currentPage,
        paramsSearch,
        listEntryForm
      );
      return result;
    }
  );
  ipcMain.on("print-temp-export", async (event, data) => {
    const items = await getDeliveryItembyDeliveryID(data.ID);
    startPrint(
      {
        htmlString: await formExportBill({ ...data, items }),
      },
      undefined
    );
  });
};
export default countDelivery;
