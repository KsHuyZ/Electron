import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";

const wareHouse = {
  createWareHouse: (name: string, description: string) => {
    db.run(
      "INSERT INTO warehouse (name, description) VALUES (?,?)",
      [name, description],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ID = this.lastID;
          const newData = { ID, name, description };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("append-warehouse", newData);
          }
        }
      }
    );
  },
  
  getAllWareHouse: (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    db.get("SELECT COUNT(ID) as count FROM warehouse", (err, row:any) => {
      if (err) {
        console.log(err);
      }
      const count = row?.count
      db.all(
        " SELECT * FROM warehouse LIMIT ? OFFSET ?",
        [pageSize, offsetValue],
        (err, rows) => {
          if (err) {
            console.log(err);
          }
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            const data = { rows, total: count };
            mainWindow.webContents.send("all-warehouse", data);
          }
        }
      );
    });
  },


  updateWarehouse: (name: string, description: string, ID: number) => {
    db.run(
      "UPDATE warehouse SET name = ?, description = ? WHERE id = ?",
      [name, description, ID],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const newData = {
            ID,
            name,
            description,
          };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("update-success", newData);
          }
        }
      }
    );
  },
  
};

export default wareHouse;
