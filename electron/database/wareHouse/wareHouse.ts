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
  getAllWarehouse: () => {
    db.all("SELECT * FROM warehouse", (err, rows) => {
      if (err) {
        console.log(err);
      }
      console.log(rows);

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-warehouse", rows);
      }
    });
  },
};

export default wareHouse
