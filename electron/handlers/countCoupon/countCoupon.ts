import { ipcMain } from "electron";
import countCouponDB from "../../database/countCoupon/countCoupon";
import wareHouseItem from "../../database/wareHouseItem/wareHouseItem";
import { DataType } from "../../types";
import { startPrint } from "../../module/print";
import { formImportBill } from "../../utils/formImportBill";

const {
  getCountCoupon,
  getCouponItem,
  getCouponItembyCouponID,
} = countCouponDB;



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
  ipcMain.handle("get-coupon-item-by-coupon-id", async (event, ID: number) => {
    return await getCouponItembyCouponID(ID);
  });

};
export default countCoupon;
