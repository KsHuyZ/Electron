import { ipcMain } from "electron";
import tempCountDeliveryDB from "../../database/tempCountDelivery/index";
import { handleTransaction } from "../../utils";
import { DataType } from "../../types";

const tempCountDelivery = () => {
  const {
    getTempCountDelivery,
    getTempDeliveryItem,
    getTemptDeliveryItembyID,
    editTempExport,
    getNewTempExportItem,
  } = tempCountDeliveryDB;
  ipcMain.handle(
    "get-history-temp-export",
    async (
      event,
      { current, pageSize }: { current: number; pageSize: number }
    ) => {
      const reuslt = await getTempCountDelivery(pageSize, current);
      return reuslt;
    }
  );
  ipcMain.handle("get-temp-export-item", async (event, id: number) => {
    return await getTempDeliveryItem(id);
  });
  ipcMain.handle("get-temp-export-item-by-id", async (event, id: number) => {
    return await getTemptDeliveryItembyID(id);
  });
  ipcMain.handle("temp-export-edit", async (event, data: any) => {
    const {
      ID,
      removeItemList,
      items,
      name,
      note,
      nature,
      date,
      total,
      title,
      author,
      numContract,
      id_WareHouse,
    } = data;

    const result = await handleTransaction(
      async () =>
        await editTempExport(
          removeItemList,
          items,
          ID,
          name,
          nature,
          total,
          date,
          title,
          author,
          numContract,
          note,
          id_WareHouse
        )
    );
    return result;
  });
  ipcMain.handle(
    "get-warehouse-item-temp",
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
      const { pageSize, currentPage, paramsSearch, listEntryForm } = data;

      return await getNewTempExportItem(
        pageSize,
        currentPage,
        paramsSearch,
        listEntryForm
      );
    }
  );
};
export default tempCountDelivery;
