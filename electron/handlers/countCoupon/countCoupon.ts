import { BrowserWindow, ipcMain } from "electron";
import countCouponDB from "../../database/countCoupon/countCoupon";

const {
  getCountCoupon,
  getCouponItem,
  getCouponItembyCouponID,
  approveAccept,
} = countCouponDB;

const countCoupon = (mainScreen: BrowserWindow) => {
  ipcMain.handle(
    "get-history-import",
    async (
      event,
      { current, pageSize }: { current: number; pageSize: number }
    ) => {
      const reuslt = await getCountCoupon(pageSize, current);
      return reuslt;
    }
  );
  ipcMain.handle("get-import-item", async (event, id: number) => {
    return await getCouponItem(id);
  });
  ipcMain.handle("get-coupon-item-by-coupon-id", async (event, ID: number) => {
    return await getCouponItembyCouponID(ID);
  });
  ipcMain.handle("approve-import", async (event, id: number | string) => {
    return await approveAccept(id);
  });
};
export default countCoupon;
