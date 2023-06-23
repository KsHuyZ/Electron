import { ipcMain } from "electron";
import nguonHangDB from "../../database/nguonHang/nguonHang";
const nguonHang = () => {
  const {
    createItemSource,
    getAllItemSource,
    updateItemSource,
    deleteItemSource,
    getFulllItemSource,
  } = nguonHangDB;

  // listen create nguon hang request
  ipcMain.on(
    "create-new-nguonHang",
    (event, data: { name: string; address: string; phonenumber: string }) => {
      const { name, address, phonenumber } = data;
      createItemSource(name, address, phonenumber);
    }
  );

  // listen get nguon hang request
  ipcMain.on(
    "itemsource-request-read",
    (
      event,
      data: { pageSize: number; currentPage: number } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      getAllItemSource(pageSize, currentPage);
    }
  );

  ipcMain.on("itemsource-request-get-all", () => {
    getFulllItemSource();
  });

  //listen update
  ipcMain.on(
    "update-itemsource",
    (
      event,
      data: { id: number; name: string; address: string; phonenumber: string }
    ) => {
      const { id, name, address, phonenumber } = data;
      updateItemSource(name, address, phonenumber, id);
    }
  );

  // listen delete event
  ipcMain.on("delete-itemsource", (event, id: number) => {
    console.log(id);
    deleteItemSource(id);
  });

  // ipcMain.on("get-product-nguonHang")
};
export default nguonHang;
