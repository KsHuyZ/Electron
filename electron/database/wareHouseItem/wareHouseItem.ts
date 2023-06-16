import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { WarehouseItem } from "../../types";

const wareHouseItem = {
  getAllWarehouseItem: (id: string) => {
    db.all("SELECT * FROM warehouseitem", (err, rows) => {
      if (err) {
        console.log(err);
      }
      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-warehouseitem", rows);
      }
    });
  },
  createWareHouseItem: (data: WarehouseItem) => {
    const {
      id_wareHouse,
      id_nguonHang,
      name,
      price,
      unit,
      quality,
      date_expried,
      date_created_at,
      date_updated_at,
      quantity_plane,
      quantity_real,
      note,
      status,
    } = data;

    db.run(
      "INSERT INTO warehouseitem (id_wareHouse, name, price, unit, quality, id_nguonHang, date_expried, date_create_at, date_updated_at, note, quantity_plane, quantity_real, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id_wareHouse,
        id_nguonHang,
        name,
        price,
        unit,
        quality,
        date_expried,
        date_created_at,
        date_updated_at,
        note,
        quantity_plane,
        quantity_real,
      ],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ID = this.lastID;
          const newData = {
            ID,
            id_wareHouse,
            id_nguonHang,
            name,
            price,
            unit,
            quality,
            date_expried,
            date_created_at,
            date_updated_at,
            note,
            quantity_plane,
            quantity_real,
            status,
          };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("append-warehouseitem", newData);
          }
        }
      }
    );
  },
  updateWareHouseItem: (data: WarehouseItem, id: number) => {
    const {
      id_wareHouse,
      id_nguonHang,
      name,
      price,
      unit,
      quality,
      date_expried,
      date_created_at,
      date_updated_at,
      quantity_plane,
      quantity_real,
      note,
      status,
    } = data;
    db.run(
      "UPDATE warehouseitem SET id_wareHouse = ?, name = ?, price =?, unit = ?, quality = ?, id_nguonHang = ?, date_expried = ?, date_create_at = ?, date_updated_at = ?, note = ?, quantity_plane = ?, quantity_real = ?) WHERE id = ?",
      [
        id_wareHouse,
        id_nguonHang,
        name,
        price,
        unit,
        quality,
        date_expried,
        date_created_at,
        date_updated_at,
        note,
        quantity_plane,
        quantity_real,
        status,
        id,
      ],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const newData = {
            id,
            id_wareHouse,
            id_nguonHang,
            name,
            price,
            unit,
            quality,
            date_expried,
            date_created_at,
            date_updated_at,
            note,
            quantity_plane,
            quantity_real,
            status,
          };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("update-success", newData);
          }
        }
      }
    );
  },
  deleteWareHouseItem: (id: number) => {
    db.run("DELETE FROM warehouseitem WHERE ID = ?", [id], function (err) {
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

export default wareHouseItem;
