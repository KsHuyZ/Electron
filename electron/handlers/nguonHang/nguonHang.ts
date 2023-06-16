import { ipcMain } from "electron";
import nguonHangDB from "../../database/nguonHang/nguonHang";
const nguonHang = () => {
  const { createItemSource, getAllItemSource } = nguonHangDB;

  // listen create nguon hang request
  ipcMain.on(
    "create-new-nguonHang",
    (event, data: { name: string; address: string; phonenumber: string }) => {
      const { name, address, phonenumber } = data;
      createItemSource(name, address, phonenumber);
    }
  );

  // listen get all nguon hang request
  ipcMain.on("itemsource-request-read", () => {
    getAllItemSource();
  });
};
export default nguonHang;
