import { ipcMain } from "electron";
import countDeliveryDB from "../../database/countDelivery/countDelivery";

const { getCountDelivery, getDeliveryItem, getDeliveryItembyDeliveryID } = countDeliveryDB;

const countDelivery = () => {
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
  ipcMain.handle("get-delivery-item-by-delivery-id", async (event, ID: number) => {
    return await getDeliveryItembyDeliveryID(ID);
  });
};
export default countDelivery;
