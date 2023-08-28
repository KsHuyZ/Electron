import { ipcMain } from "electron";
import tempCountCouponDB from "../../database/tempCountCoupon/tempCountCoupon";

const tempCountCoupon = () => {
  const { getTempCoutCoupon, getTempCoutCouponItem } = tempCountCouponDB;
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
};
export default tempCountCoupon;
