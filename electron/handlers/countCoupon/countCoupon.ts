import { BrowserWindow, ipcMain } from "electron";
import countCouponDB from "../../database/countCoupon/countCoupon";
import { startPrint } from "../../module/print";
import { formImportBill } from "../../utils/formImportBill";
import WareHouse from "../../database/WareHouse-Receiving/wareHouse-Receiving";

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
  ipcMain.handle("get-import-item-by-id", async (event, ID: number) => {
    return await getCouponItembyCouponID(ID);
  });
  ipcMain.handle("approve-import", async (event, id: number | string) => {
    return await approveAccept(id);
  });
  ipcMain.on("print-import", async (event, data) => {
    console.log("Ye")
    const { getWareHousebyID } = WareHouse;
    const items = await getCouponItembyCouponID(data.ID);
    const wareHouse: any = await getWareHousebyID(data.idWareHouse);
    startPrint(
      {
        htmlString: await formImportBill({
          ...data,
          items,
          nameWareHouse: wareHouse.name,
        }),
      },
      undefined
    );
  });
};
export default countCoupon;
