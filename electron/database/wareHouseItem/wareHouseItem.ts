import { BrowserWindow, IpcMainEvent } from "electron";
import db from "../../utils/connectDB";
import { Intermediary, WarehouseItem } from "../../types";

const wareHouseItem = {
  getAllWarehouseItembyWareHouseId: async (
    id: number,
    pageSize: number,
    currentPage: number
  ) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
       wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
        i.ID as IDIntermediary, i.id_WareHouse, i.status, i.quality, i.quantity,
         i.date, COUNT(i.ID) OVER() AS total 
        FROM warehouseItem wi
        JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
        WHERE i.id_WareHouse = ? ORDER BY i.ID DESC LIMIT ? OFFSET ?`;
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, [id, pageSize, offsetValue], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      const countResult = rows.length > 0 ? rows[0].total : 0;
      return { rows, total: countResult };
    } catch (err) {
      console.log(err);
      return null;
    }
    
  },
  createWareHouseItem: async (data: WarehouseItem & Intermediary) => {
    const {
      name,
      price,
      unit,
      quality,
      idSource,
      date_expried,
      date_created_at,
      date_updated_at,
      note,
      date,
      quantity_plane,
      quantity_real,
      id_wareHouse,
    } = data;
    const status = 1;
    console.log(data);
    
    try {
      const createItemQuery = `INSERT INTO warehouseItem (id_Source, name, price, unit, date_expried, 
        date_create_at, date_updated_at, note, quantity_plane, quantity_real) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const idWarehouseItem = await new Promise((resolve, reject) => {
        db.run(
          createItemQuery,
          [
            idSource,
            name,
            price,
            unit,
            date_expried,
            date_created_at,
            date_updated_at,
            note,
            quantity_plane,
            quantity_real
          ],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
      const createIntermediary = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status
        , quality, quantity, date) VALUES (?, ?, ?, ?, ?, ?)`;
      const idIntermediary = await new Promise((resolve, reject) => {
        db.run(
          createIntermediary,
          [id_wareHouse, idWarehouseItem, status, quality, quantity_real, date],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },  
  updateWareHouseItem: async (data: WarehouseItem & Intermediary) => {
    const {
      name,
      price,
      unit,
      quality,
      idSource,
      date_expried,
      date_created_at,
      date_updated_at,
      note,
      quantity_plane,
      quantity_real,
      id_wareHouse,
      status,
      quantity,
      idWarehouseItem,
      idIntermediary,
    } = data;
  
    console.log(data);
  
    const intermediaryExists = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(ID) AS count FROM Intermediary WHERE ID = ?`,
        [idIntermediary],
        function (err, row: any) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  
    if (!intermediaryExists) {
      return "Warehouse item does not exist or is being imported";
    }
  
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE warehouseItem SET name = ?, price = ?, unit = ?, id_Source = ?, date_expried = ?, date_create_at = ?, date_updated_at = ?, note = ?, quantity_plane = ? WHERE ID = ?`,
        [
          name,
          price,
          unit,
          idSource,
          date_expried,
          date_created_at,
          date_updated_at,
          note,
          quantity_plane,
          idWarehouseItem,
        ],
        function (err) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE Intermediary SET quality = ?, quantity = ? WHERE ID = ?`,
        [quality, quantity_real, idIntermediary],
        function (err) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  
    return {
      idIntermediary,
      name,
      price,
      unit,
      quality,
      idSource,
      date_expried,
      date_created_at,
      date_updated_at,
      note,
      quantity_plane,
      quantity_real,
      id_wareHouse,
      status,
      quantity,
    };
  },
  deleteWareHouseItemInWarehouse: async (ID: number) => {
    try {
      const intermediary = await new Promise((resolve, reject) => {
        db.run(
          `SELECT * FROM Intermediary WHERE ID = ${ID}`,
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      });
      if (!intermediary) {
        return "Warehouse item not exist or is importing";
      }
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM Intermediary WHERE id_WareHouseItem = ${ID}`,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  deleteWareHouseItem: async (ID: number, ID_warehouse: number) => {
    try {
      const intermediary = await new Promise((resolve, reject) => {
        db.run(
          `SELECT * FROM Intermediary WHERE ID = ${ID}`,
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      });
      if (!intermediary) {
        return "Warehouse item not exist or is importing";
      }
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM Intermediary WHERE ID = ${ID}`,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM WareHouseItem WHERE ID = ${ID_warehouse}`, function (err) {
          if (err) {
            console.log(err.message);
            reject(err.message);
          } else {
            resolve(this.lastID);
          }
        });
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  //ChangeWareHouse
  changeWareHouse: async (
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      intermediary.forEach(async (item) => {
        const ID = await new Promise((resolve, reject) => {
          db.run(
            `SELECT ID from Intermediary WHERE id_WareHouse = ${id_newWareHouse} and id_WareHouseItem = ${item.id_wareHouse_item}`,
            function (err, row) {
              if (err) {
                console.log(err);
                reject(err)
              } else {
                resolve(row.ID);
              }
            }
          );
        });
        if (ID) {
          const quantity = await new Promise((resolve, reject) => {
            db.run(
              `SELECT quantity from Intermediary WHERE ID = ${ID}`,
              function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(row.quantity);
                }
              }
            );
          });
          if (Number(quantity) < item.quantity) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is to large"
            );
          } else if (Number(quantity) < item.quantity) {
            const changeWareHouseQuery = `UPDATE Intermediary SET  quantity = quantity + ${item.quantity} WHERE ID = ${ID}
            UPDATE Intermediary SET quantity = quantity - ${item.quantity} WHERE id_WareHouseItem = ${item.id_wareHouse_item} AND id_WareHouse= ${item.id_wareHouse}`;
            await new Promise((resolve, reject) => {
              db.run(changeWareHouseQuery, function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(true);
                }
              });
            });
          } else {
            const changeWareHouseQuery = `UPDATE Intermediary SET quantity = quantity + ${item.quantity} WHERE ${ID}
            DELETE Intermediary WHERE id_WareHouseItem = ${item.id_wareHouse_item} AND id_WareHouse= ${item.id_wareHouse}`;
            const isSuccess = await new Promise((resolve, reject) => {
              db.run(changeWareHouseQuery, function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(true);
                }
              });
            });
          }
        } else {
          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse,id_WareHouseItem,status,quality,quantity) VALUES (${id_newWareHouse}, ${item.id_wareHouse_item},${item.status},${item.quality},${item.quantity})
          UPDATE Intermediary SET quantity = quantity - ${item.quantity} WHERE id_WareHouseItem = ${item.id_wareHouse_item} AND id_WareHouse= ${item.id_wareHouse}`;
          const quantity = await new Promise((resolve, reject) => {
            db.run(
              `SELECT quantity from Intermediary WHERE id_WareHouse = ${item.id_wareHouse} AND id_WareHouseItem = ${item.id_wareHouse_item}`,
              function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(row.quantity);
                }
              }
            );
          });
          if (Number(quantity) < item.quantity) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is to large"
            );
          } else if (Number(quantity) > item.quantity) {
            await new Promise((resolve, reject) => {
              db.run(changeWareHouseQuery, function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(true);
                }
              });
            });
          } else {
            const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse,id_WareHouseItem,status,quality,quantity) VALUES (${id_newWareHouse}, ${item.id_wareHouse_item},${item.status},${item.quality},${item.quantity})
            DELETE Intermediary WHERE id_WareHouseItem = ${item.id_wareHouse_item} AND id_WareHouse= ${item.id_wareHouse}`;
            const isSuccess = await new Promise((resolve, reject) => {
              db.run(changeWareHouseQuery, function (err, row) {
                if (err) {
                  console.log(err);
                  reject(err)
                } else {
                  resolve(true);
                }
              });
            });
          }
        }
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

export default wareHouseItem;
