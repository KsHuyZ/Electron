import { ipcMain } from "electron";
import tempCountDeliveryDB from "../../database/tempCountDelivery/index";
import { handleTransaction } from "../../utils";

const tempCountDelivery = () => {
  const {
    getTempCountDelivery,
    getTempDeliveryItem,
    getTemptDeliveryItembyID,
    editTempExport,
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
};
export default tempCountDelivery;
