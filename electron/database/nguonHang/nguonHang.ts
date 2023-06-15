import sqlite3 from "sqlite3";
import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
sqlite3.verbose();

const nguonHang = {
  createItemSource: (name: string, address: string, phonenumber: string) => {
    db.run(
      "INSERT INTO nguonHang (name,address,phone) VALUES (?,?,?)",
      [name, address, phonenumber],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ID = this.lastID;
          const newData = { ID, name, address, phonenumber };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("append-itemsource", newData);
          }
        }
      }
    );
  },

  getAllItemSource: () => {
    db.all("SELECT * FROM itemsource", (err, rows) => {
      if (err) {
        console.log(err);
      }
      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-itemsource", rows);
      }
    });
  },
};
export default nguonHang;
