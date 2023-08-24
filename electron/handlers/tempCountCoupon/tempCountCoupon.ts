import { ipcMain } from "electron";
import tempCountCouponDB from "../../database/tempCountCoupon/tempCountCoupon";

const tempCountCoupon = () => {
  const { createTempCountCoupon } = tempCountCouponDB;
  // ipcMain.handle(
  //   "get-history-temp-import",
  //   async (
  //     event,
  //     { current, pageSize }: { current: number; pageSize: number }
  //   ) => {
  //     const reuslt = await getCountCoupon(pageSize, current);
  //     return reuslt;
  //   }
  // );
  ipcMain.handle(
    "create-history-temp-import",
    async (
      event,
      {
        name,
        idSource,
        nature,
        note,
        total,
        date,
        title,
        author,
        numContract,
      }: {
        name: string;
        idSource: number;
        nature: string;
        note: string;
        total: number;
        date: string;
        title: string;
        author: string;
        numContract: number;
      }
    ) => {
      return await createTempCountCoupon(
        name,
        idSource,
        nature,
        note,
        total,
        date,
        title,
        author,
        numContract
      );
    }
  );
};
export default tempCountCoupon;
