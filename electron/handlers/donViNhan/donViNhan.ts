import { ipcMain } from "electron";
import donViNhanDB from "../../database/donViNhan/donViNhan";
const donViNhan = () => {
const { createDonViNhan, getAllDonViNhan } = donViNhanDB;

  // listen create donViNhan request
  ipcMain.on(
    "create-new-donViNhan",
    (event, data: { name: string; address: string; phonenumber: string }) => {
      const { name, address, phonenumber } = data;
      createDonViNhan(name, address, phonenumber);
    }
  );

  // listen get all donViNhan request
  ipcMain.on(
    "donViNhan-request-read",
    (
      event,
      data: { pageSize: number; currentPage: number } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      getAllDonViNhan(pageSize, currentPage);
    }
  );
};
export default donViNhan;
