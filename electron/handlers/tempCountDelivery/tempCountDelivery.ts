import { ipcMain } from "electron";
import tempCountDeliveryDB from "../../database/tempCountDelivery/index";

const tempCountDelivery = () => {
  const {
    getTempCountDelivery,
    getTempDeliveryItem,
    getTemptDeliveryItembyID,
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
};
export default tempCountDelivery;
