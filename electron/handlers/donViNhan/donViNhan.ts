import { ipcMain } from "electron";
import donViNhanDB from "../../database/donViNhan/donViNhan";
const donViNhan = () => {
  const { createDonViNhan, getAllDonViNhan, updateDonViNhan, deleteDonViNhan } =
    donViNhanDB;

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
      console.log(data);
      const { pageSize, currentPage } = data;
      getAllDonViNhan(pageSize, currentPage);
    }
  );

  ipcMain.on(
    "update-recipient",
    (
      event,
      data: { id: number; name: string; address: string; phonenumber: string }
    ) => {
      const { id, name, address, phonenumber } = data;
      updateDonViNhan(name, address, phonenumber, id);
    }
  );

  // listen delete event
  ipcMain.on("delete-recipient", (event, id: number) => {
    deleteDonViNhan(id);
  });

 
};
export default donViNhan;
