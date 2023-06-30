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
      const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,wi.id_Source,wi.date_expried,wi.note,wi.quantity_plane,wi.quantity_real,i.ID as IDIntermediary,i.id_WareHouse,i.status,i.quality,i.quantity,I.date,COUNT(ID) OVER() AS total,
        FROM warehouseItem wi
        JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
        WHERE i.idWarehouse = ? and status IN (1,3) ORDER BY ID DESC LIMIT ? OFFSET ?`;
      const rows = await new Promise((resolve, reject) => {
        db.all(selectQuery, [id, pageSize, offsetValue], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      const countResult = rows[0].length > 0 ? rows[0].total : 0;
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
    try {
      const createItemQuery = `INSERT INTO warehouseItem (name, price, unit,  id_Source, date_expried, date_create_at, date_updated_at, note, quantity_plane, quantity_real) VALUES (${name},${price},${unit},${idSource},${date_expried},${date_created_at},${date_updated_at},${note},${quantity_plane},${quantity_real})`;
      const idWarehouseItem = await new Promise((resolve, reject) => {
        db.run(createItemQuery, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
      const createIntermediary = `INSERT INTO Intermediary(id_WareHouse,id_WareHouseItem,status,quality,quantity,date) VALUES (${id_wareHouse}, ${idWarehouseItem},${status},${quality},${quantity_real}, ${date})`;
      const idIntermedirary = await new Promise((resolve, reject) => {
        db.run(createIntermediary, function (err) {
          if (err) {
            reject(err);
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

    const intermediary = await new Promise((resolve, reject) => {
      db.run(
        `SELECT * FROM Intermediary WHERE ID = ${idIntermediary} AND status= 1`,
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
        `UPDATE warehouseItem SET name = ${name}, price = ${price}, unit = ${unit}, id_Source = ${idSource}, date_expried = ${date_expried}, date_create_at = ${date_created_at}, date_updated_at = ${date_updated_at}, note = ${note}, quantity_plane = ${quantity_plane}, quantity_real = ${quantity_real} WHERE ID = ${idWarehouseItem}`,
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
        `UPDATE Intermediary SET quality = ${quality}, quantity = ${quantity} WHERE ID = ${idIntermediary}`,
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
      idWarehouseItem,
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
          `SELECT * FROM Intermediary WHERE ID = ${ID} AND status= 1`,
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
  deleteWareHouseItem: async (ID: number) => {
    try {
      const intermediary = await new Promise((resolve, reject) => {
        db.run(
          `SELECT * FROM Intermediary WHERE ID = ${ID} AND status= 1`,
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
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM WareHouseItem WHERE ID = ${ID}`, function (err) {
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
