import { ipcMain } from "electron";
import tempCountCouponDB from "../../database/tempCountCoupon/tempCountCoupon";
import { handleTransaction } from "../../utils";

const tempCountCoupon = () => {
  const {
    getTempCoutCoupon,
    getTempCoutCouponItem,
    getTempCouponItembyCouponID,
    editTempCountCoupon,
  } = tempCountCouponDB;
  ipcMain.handle(
    "get-history-temp-import",
    async (
      event,
      { current, pageSize }: { current: number; pageSize: number }
    ) => {
      const reuslt = await getTempCoutCoupon(pageSize, current);
      return reuslt;
    }
  );
  ipcMain.handle("get-temp-import-item", async (event, id: number) => {
    return await getTempCoutCouponItem(id);
  });
  ipcMain.handle("get-temp-import-item-by-id", async (event, id: number) => {
    return await getTempCouponItembyCouponID(id);
  });
  ipcMain.handle("temp-import-edit", async (event, data: any) => {
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
      idSource,
      author,
      numContract,
      idWareHouse,
    } = data;

    const result = await handleTransaction(() =>
      editTempCountCoupon(
        removeItemList,
        items,
        ID,
        idSource,
        name,
        nature,
        total,
        date,
        title,
        author,
        numContract,
        note,
        idWareHouse
      )
    );
    return result;
  });
};
export default tempCountCoupon;
