import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { WarehouseItem } from "../../types";

const wareHouseItem = {
  getAllWarehouseItem: async (id, pageSize, currentPage) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;

      const countQuery =
        "SELECT COUNT(ID) as count FROM warehouseitem WHERE id_wareHouse = ?";
      const countResult = await new Promise((resolve, reject) => {
        db.get(countQuery, [id], (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row?.count);
          }
        });
      });

      const selectQuery =
        "SELECT * FROM warehouseitem WHERE id_wareHouse = ? ORDER BY ID DESC LIMIT ? OFFSET ?";
      const rows = await new Promise((resolve, reject) => {
        db.all(selectQuery, [id, pageSize, offsetValue], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        const data = { rows, total: countResult };
        console.log(data);

        mainWindow.webContents.send("append-warehouse-item", data);
      }
    } catch (err) {
      console.log(err);
    }
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
        name,
        price,
        unit,
        quality,
        id_nguonHang,
        date_expried,
        date_created_at,
        date_updated_at,
        note,
        quantity_plane,
        quantity_real,
        status,
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
            mainWindow.webContents.send(
              "append-warehouse-item-success",
              newData
            );
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

    console.log("du lieu", data);

    db.run(
      "UPDATE warehouseitem SET id_wareHouse = ?, name = ?, price =?, unit = ?, quality = ?, id_nguonHang = ?, date_expried = ?, date_create_at = ?, date_updated_at = ?, note = ?, quantity_plane = ?, quantity_real = ? WHERE ID = ?",
      [
        id_wareHouse,
        name,
        price,
        unit,
        quality,
        id_nguonHang,
        date_expried,
        date_created_at,
        date_updated_at,
        note,
        quantity_plane,
        quantity_real,
        id,
      ],
      function (err) {
        if (err) {
          console.log(err);
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
  getWareHouseItemByRecipientId: async (
    id: number,
    pageSize: number,
    currentPage: number
  ) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;

      const countQuery =
        "SELECT COUNT(ID) as count FROM warehouseitem WHERE id_wareHouse = ?";
      const countResult = await new Promise((resolve, reject) => {
        db.get(countQuery, [id], (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row?.count);
          }
        });
      });

      const selectQuery =
        "SELECT * FROM warehouseitem WHERE id_wareHouse = ? ORDER BY ID DESC LIMIT ? OFFSET ?";
      const rows = await new Promise((resolve, reject) => {
        db.all(selectQuery, [id, pageSize, offsetValue], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        const data = { rows, total: countResult };
        console.log(data);

        mainWindow.webContents.send("append-warehouse-item", data);
      }
    } catch (err) {
      console.log(err);
    }
  },
};

export default wareHouseItem;
