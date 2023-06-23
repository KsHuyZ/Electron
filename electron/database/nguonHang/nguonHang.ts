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
          const newData = { ID, name, address, phone: phonenumber };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("append-itemsource", newData);
          }
        }
      }
    );
  },

  getAllItemSource: (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    db.get("SELECT COUNT(ID) as count FROM nguonHang", (err, row: any) => {
      if (err) {
        console.log(err);
      }
      const count = row?.count;
      db.all(
        " SELECT * FROM nguonHang LIMIT ? OFFSET ?",
        [pageSize, offsetValue],
        (err, rows) => {
          if (err) {
            console.log(err);
          }
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            const data = { rows, total: count };
            mainWindow.webContents.send("all-itemsource", data);
          }
        }
      );
    });
  },

  getFulllItemSource: () => {
    db.all("SELECT * FROM nguonHang", (err, rows) => {
      if (err) {
        console.log(err);
      }
      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-nguonHang", rows);
      }
    });
  },

  updateItemSource: (
    name: string,
    address: string,
    phonenumber: string,
    id: number
  ) => {
    db.run(
      "UPDATE nguonHang SET name = ?, address = ?, phone = ? WHERE id = ?",
      [name, address, phonenumber, id],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const newData = {
            ID: id,
            name,
            address,
            phone: phonenumber,
          };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("update-success", newData);
          }
        }
      }
    );
  },

  deleteItemSource: (id: number) => {
    db.run("DELETE FROM nguonHang WHERE ID = ?", [id], function (err) {
      if (err) {
        console.log(err.message);
      } else {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("delete-success", id);
        }
      }
    });
  },
};
export default nguonHang;
