import { ipcMain } from "electron";
import countCouponDB from "../../database/countCoupon/countCoupon";

const { getCountCoupon, getCouponItem } = countCouponDB;

const countCoupon = () => {
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
  ipcMain.handle("get-coupon-item", async (event, id: number) => {
    return await getCouponItem(id);
  });
};
export default countCoupon;
