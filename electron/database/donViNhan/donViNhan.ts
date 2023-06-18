import sqlite3 from "sqlite3";
import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
sqlite3.verbose();

const donViNhan = {
  createDonViNhan: (name: string, address: string, phonenumber: string) => {
    db.run(
      "INSERT INTO donViNhan (name,address,phone) VALUES (?,?,?)",
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

  getAllDonViNhan: (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    db.get("SELECT COUNT(ID) as count FROM donViNhan", (err, row:any) => {
      if (err) {
        console.log(err);
      }
      const count = row?.count
      db.all(
        " SELECT * FROM donViNhan LIMIT ? OFFSET ?",
        [pageSize, offsetValue],
        (err, rows) => {
          if (err) {
            console.log(err);
          }
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            const data = { rows, total:count };
            mainWindow.webContents.send("all-donViNhan", data);
          }
        }
      );
    });
  },
};
export default donViNhan;