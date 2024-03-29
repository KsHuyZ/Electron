import { ipcMain } from "electron";
import tempCountCouponDB from "../../database/tempCountCoupon/tempCountCoupon";
import { handleTransaction } from "../../utils";
import { startPrint } from "../../module/print";
import { formImportBill } from "../../utils/formImportBill";
import WareHouse from "../../database/WareHouse-Receiving/wareHouse-Receiving";

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
  ipcMain.on("print-temp-import", async (event, data) => {
    const { getWareHousebyID } = WareHouse;
    const items = await getTempCouponItembyCouponID(data.ID);
    const wareHouse: any = await getWareHousebyID(data.idWareHouse);

    startPrint(
      {
        htmlString: await formImportBill({
          ...data,
          items,
          temp: true,
          nameWareHouse: wareHouse.name,
        }),
      },
      undefined
    );
  });
};
export default tempCountCoupon;
