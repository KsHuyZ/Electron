import db from "../../utils/connectDB";
import {
  Intermediary,
  WarehouseItem,
  ISearchWareHouseItem,
  IPostMultipleItem,
} from "../../types";
import { runQuery, runQueryGetAllData, runQueryReturnID } from "../../utils";
import countDelivery from "../countDelivery/countDelivery";
import countCoupon from "../countCoupon/countCoupon";
import { Moment } from "moment";

const wareHouseItem = {
  getAllWarehouseItembyWareHouseId: async (
    id: number,
    pageSize: number,
    currentPage: number,
    paramsSearch: ISearchWareHouseItem
  ) => {
    const {
      name,
      idSource,
      startDate,
      endDate,
      status,
      now_date_ex,
      after_date_ex,
    } = paramsSearch;

    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const whereConditions: string[] = [];
      const queryParams: any[] = [id, pageSize, offsetValue];

      console.log("offsetValue", offsetValue);
      console.log("pageSize", pageSize);

      // Add query conditions based on the provided search parameters
      if (name) {
        whereConditions.unshift(`wi.name LIKE ?`);
        queryParams.unshift(`%${name}%`);
      }
      if (idSource) {
        whereConditions.unshift(`wi.id_Source = ?`);
        queryParams.unshift(idSource);
      }
      if (startDate) {
        whereConditions.unshift(`wi.date_created_at >= ?`);
        queryParams.unshift(startDate);
      }
      if (endDate) {
        whereConditions.unshift(`wi.date_created_at <= ?`);
        queryParams.unshift(endDate);
      }
      if (status) {
        whereConditions.unshift(`i.status = ?`);
        queryParams.unshift(status);
      }

      if (now_date_ex !== after_date_ex) {
        whereConditions.unshift(`wi.date_expried >= ?`);
        queryParams.unshift(now_date_ex);
      }

      if (after_date_ex) {
        whereConditions.unshift(`wi.date_expried <= ?`);
        queryParams.unshift(after_date_ex);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")} AND i.id_WareHouse = ?`
          : "WHERE i.id_WareHouse = ?";
      const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
        wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
        i.ID as IDIntermediary, i.id_WareHouse, i.status, i.prev_idwarehouse, i.quality, i.quantity,
        i.date, COUNT(i.ID) OVER() AS total 
        FROM warehouseItem wi
        JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
        ${whereClause}
        ORDER BY i.ID DESC
        LIMIT ? OFFSET ?`;

      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, ...queryParams, (err, rows) => {
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
  getAllWarehouseItembyReceivingId: async (
    id: number,
    pageSize: number,
    currentPage: number,
    paramsSearch: ISearchWareHouseItem
  ) => {
    const { name, idSource, startDate, endDate, status } = paramsSearch;

    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const whereConditions: string[] = [];
      const queryParams: any[] = [id, pageSize, offsetValue];

      if (name) {
        whereConditions.unshift(`wi.name LIKE ?`);
        queryParams.unshift(`%${name}%`);
      }
      if (idSource) {
        whereConditions.unshift(`wi.id_Source = ?`);
        queryParams.unshift(idSource);
      }
      if (startDate) {
        whereConditions.unshift(`wi.date_created_at >= ?`);
        queryParams.unshift(startDate);
      }
      if (endDate) {
        whereConditions.unshift(`wi.date_created_at <= ?`);
        queryParams.unshift(endDate);
      }
      if (status) {
        whereConditions.unshift(`i.status = ?`);
        queryParams.unshift(status);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")} AND i.id_WareHouse = ?`
          : "WHERE i.id_WareHouse = ?";
      const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
        wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
        i.ID as IDIntermediary, i.id_WareHouse, i.status, i.prev_idwarehouse, i.quality, i.quantity, w.name AS nameWareHouse,
        i.date, COUNT(i.ID) OVER() AS total 
        FROM warehouseItem wi
        JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
        JOIN Warehouse w ON w.ID = i.prev_idwarehouse
        ${whereClause}
        ORDER BY i.ID DESC
        LIMIT ? OFFSET ?`;
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, ...queryParams, (err, rows) => {
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
  getAllWarehouseItem: async (
    pageSize: number,
    currentPage: number,
    paramsSearch: ISearchWareHouseItem
  ) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const whereConditions: string[] = [];
    const queryParams: any[] = [pageSize, offsetValue];
    const {
      name,
      idSource,
      startDate,
      endDate,
      status,
      now_date_ex,
      after_date_ex,
    } = paramsSearch;
    if (name) {
      whereConditions.unshift(`wi.name LIKE ?`);
      queryParams.unshift(`%${name}%`);
    }
    if (idSource) {
      whereConditions.unshift(`wi.id_Source = ?`);
      queryParams.unshift(idSource);
    }
    if (startDate) {
      whereConditions.unshift(`wi.date_created_at >= ?`);
      queryParams.unshift(startDate);
    }
    if (endDate) {
      whereConditions.unshift(`wi.date_created_at <= ?`);
      queryParams.unshift(endDate);
    }
    if (status) {
      whereConditions.unshift(`i.status = ?`);
      queryParams.unshift(status);
    }

    if (now_date_ex !== after_date_ex) {
      whereConditions.unshift(`wi.date_expried >= ?`);
      queryParams.unshift(now_date_ex);
    }

    if (after_date_ex) {
      whereConditions.unshift(`wi.date_expried <= ?`);
      queryParams.unshift(after_date_ex);
    }
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")} AND i.status IN(1,3)`
        : "AND i.status IN(1,3)";
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
    wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
     i.ID as IDIntermediary,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS id_WareHouse, i.status, i.quality, i.quantity,
      i.date,w.name AS warehouseName, COUNT(i.ID) OVER() AS total 
     FROM warehouseItem wi
     JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
     JOIN warehouse w ON id_WareHouse = w.ID
    ${whereClause}
     ORDER BY i.ID DESC LIMIT ? OFFSET ?`;

    try {
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, ...queryParams, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      const countResult = rows.length > 0 ? rows[0].total : 0;
      return { rows, total: countResult };
    } catch (error) {
      console.log(error);
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
      const createItemQuery = `INSERT INTO warehouseItem (id_Source, name, price, unit, date_expried, 
        date_created_at, date_updated_at, note, quantity_plane, quantity_real) VALUES 
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
            quantity_real,
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
  createWareHouseItemMultiple: async (
    dataArray: IPostMultipleItem[],
    idSource: number,
    paramsOther: {
      id_wareHouse: number;
      status: string;
      date: string;
      date_created_at: string;
      date_updated_at: string;
    }
  ) => {
    try {
      const status = 1;

      const createItemQuery = `INSERT INTO warehouseItem (id_Source, name, price, unit, date_expried, 
        date_created_at, date_updated_at, note, quantity_plane, quantity_real) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const createIntermediary = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status
        , quality, quantity, date) VALUES (?, ?, ?, ?, ?, ?)`;

      const results = await Promise.all(
        dataArray.map(async (data) => {
          const {
            name,
            price,
            unit,
            quality,
            date_expried,
            note,
            quantity_plane,
            quantity_real,
          } = data;

          const idWarehouseItem = await new Promise<number>(
            (resolve, reject) => {
              db.run(
                createItemQuery,
                [
                  idSource,
                  name,
                  price,
                  unit,
                  date_expried,
                  paramsOther.date_created_at,
                  paramsOther.date_updated_at,
                  note,
                  quantity_plane,
                  quantity_real,
                ],
                function (err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(this.lastID);
                  }
                }
              );
            }
          );

          const idIntermediary = await new Promise<number>(
            (resolve, reject) => {
              db.run(
                createIntermediary,
                [
                  paramsOther.id_wareHouse,
                  idWarehouseItem,
                  status,
                  quality,
                  quantity_real,
                  paramsOther.date,
                ],
                function (err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(this.lastID);
                  }
                }
              );
            }
          );

          return { idWarehouseItem, idIntermediary };
        })
      );

      return results;
    } catch (error) {
      console.log(error);
      return [];
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
        `UPDATE warehouseItem SET name = ?, price = ?, unit = ?, id_Source = ?, date_expried = ?, date_created_at = ?, date_updated_at = ?, note = ?, quantity_plane = ? WHERE ID = ?`,
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
        db.run(`SELECT * FROM Intermediary WHERE ID = ${ID}`, function (err) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(true);
          }
        });
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
        db.run(`SELECT * FROM Intermediary WHERE ID = ${ID}`, function (err) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
      if (!intermediary) {
        return "Warehouse item not exist or is importing";
      }
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM Intermediary WHERE ID = ${ID}`, function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM WareHouseItem WHERE ID = ${ID_warehouse}`,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err.message);
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

  //ChangeWareHouse
  changeWareHouse: async (
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      const promises = intermediary.map(async (item) => {
        const ID = await new Promise((resolve, reject) => {
          const query = `SELECT ID from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ?`;
          db.get(
            query,
            [id_newWareHouse, item.id_wareHouse_item],
            function (err, row: any) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                if (row) {
                  resolve(row.ID);
                } else {
                  resolve("NOT_EXITS");
                }
              }
            }
          );
        });

        if (ID !== "NOT_EXITS") {
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE ID = ?`;
            db.get(query, [item.idIntermediary], function (err, row: any) {
              if (err) {
                console.log("bugs", err);
                reject(err);
              } else {
                resolve(row.quantity);
              }
            });
          });

          if (Number(quantity) < item.quantity) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is too large"
            );
          } else if (Number(quantity) > item.quantity) {
            const updateQuery1 = `UPDATE Intermediary SET  quantity = quantity + ? WHERE ID = ?`;
            const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;

            await runQuery(updateQuery1, [item.quantity, ID]);

            await runQuery(updateQuery2, [
              item.quantity,
              item.id_wareHouse_item,
              item.id_wareHouse,
            ]);
          } else {
            const changeWareHouseQuery = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
            const deleteWareHouseQuery = `DELETE FROM Intermediary WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;

            await runQuery(changeWareHouseQuery, [item.quantity, ID]);

            await runQuery(deleteWareHouseQuery, [
              item.id_wareHouse_item,
              item.id_wareHouse,
            ]);
          }
        } else {
          console.log("worker here");

          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, quality, quantity, date) VALUES (?, ?, ?, ?, ?, ?)`;
          const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? AND id_WareHouse = ?`;
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE id_WareHouse = ? AND id_WareHouseItem = ?`;
            db.get(
              query,
              [item.id_wareHouse, item.id_wareHouse_item],
              function (err, row: any) {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(row.quantity);
                }
              }
            );
          });

          if (Number(quantity) < item.quantity) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is too large"
            );
          } else if (Number(quantity) > item.quantity) {
            await runQuery(changeWareHouseQuery, [
              id_newWareHouse,
              item.id_wareHouse_item,
              item.status,
              item.quality,
              item.quantity,
              item.date,
            ]);
            await runQuery(updateWareHouseQuery, [
              item.quantity,
              item.idIntermediary,
              item.id_wareHouse,
            ]);
          } else {
            const insertQuery = `
          INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, quality, quantity, date)
          VALUES (?, ?, ?, ?, ?, ?)`;

            const deleteQuery = `
          DELETE FROM Intermediary WHERE ID = ?`;

            try {
              await runQuery(insertQuery, [
                id_newWareHouse,
                item.id_wareHouse_item,
                item.status,
                item.quality,
                item.quantity,
                item.date,
              ]);

              await runQuery(deleteQuery, [item.idIntermediary]);
              console.log("Transaction committed successfully");
            } catch (err) {
              console.log("Transaction rolled back:", err);
              // Handle error
            }
          }
        }
      });

      await Promise.all(promises);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  //export warehouse item
  tempExportWareHouse: async (
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      const promises = intermediary.map(async (item) => {
        const row: any = await new Promise((resolve, reject) => {
          const query = `SELECT ID,quantity, status from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? and quality = ? and prev_idwarehouse = ? AND status IN (2,5)`;
          db.all(
            query,
            [
              id_newWareHouse,
              item.id_wareHouse_item,
              item.quality,
              item.id_wareHouse,
            ],
            function (err, row: any) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve(row);
              }
            }
          );
        });
        if (row.length > 0) {
          // If have warehouseitem already export
          console.log("Warehouseitem is already export");
          await row.forEach(async (element) => {
            console.log("This is row data", element);
            const { quantity, status, ID } = element;
            if (Number(quantity) < item.quantity) {
              throw new Error(
                "Can't export warehouseitem to receiving. Is too large"
              );
            } else if (Number(quantity) > item.quantity) {
              console.log(
                "update quantity in new warehouse and remove quantity in old warehouse"
              );
              const updateQuery1 = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
              const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;
              await runQuery(updateQuery1, [item.quantity, ID]);

              await runQuery(updateQuery2, [
                item.quantity,
                item.id_wareHouse_item,
                item.id_wareHouse,
              ]);
            } else {
              console.log("update and remove old warehouse item!");
              const changeWareHouseQuery = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
              const deleteWareHouseQuery = `DELETE FROM Intermediary WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;

              await runQuery(changeWareHouseQuery, [item.quantity, ID]);

              await runQuery(deleteWareHouseQuery, [
                item.id_wareHouse_item,
                item.id_wareHouse,
              ]);
            }
          });
        } else {
          // Chưa tồn tại
          console.log("Nahh, Is a first time!");

          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, prev_idwarehouse, status, quality, quantity, date) VALUES (?, ?,?,?, ?, ?, ?)`;
          const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? `;
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE ID = ?`;
            db.get(query, [item.idIntermediary], function (err, row: any) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve(row.quantity);
              }
            });
          });

          if (Number(quantity) < item.quantity) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is too large"
            );
          } else if (Number(quantity) > item.quantity) {
            await runQuery(changeWareHouseQuery, [
              id_newWareHouse,
              item.id_wareHouse_item,
              item.id_wareHouse,
              item.status === 1 ? 5 : 2,
              item.quality,
              item.quantity,
              item.date,
            ]);
            await runQuery(updateWareHouseQuery, [
              item.quantity,
              item.idIntermediary,
            ]);
          } else {
            const insertQuery = `
          INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, quality, quantity, date)
          VALUES (?, ?, ?, ?, ?, ?)`;

            const deleteQuery = `
          DELETE FROM Intermediary WHERE ID = ?`;

            try {
              await runQuery(changeWareHouseQuery, [
                id_newWareHouse,
                item.id_wareHouse_item,
                item.id_wareHouse,
                item.status === 1 ? 5 : 2,
                item.quality,
                item.quantity,
                item.date,
              ]);

              await runQuery(deleteQuery, [item.idIntermediary]);
              console.log("Transaction committed successfully");
            } catch (err) {
              console.log("Transaction rolled back:", err);
              // Handle error
            }
          }
        }
      });

      await Promise.all(promises);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  exportWarehouse: async (
    intermediary: Intermediary[],
    name: string,
    note: string,
    nature: string,
    total: number,
    title: string,
    date: Moment | null | any
  ) => {
    try {
      const { createCountDelivery } = countDelivery;
      await createCountDelivery(
        intermediary[0]["id_WareHouse"],
        name,
        nature,
        note,
        total,
        title,
        date
      );
      const promises = intermediary.map(async (item) => {
        const insertQuery = `UPDATE Intermediary SET status = 4 WHERE ID = ?`;
        await runQueryReturnID(insertQuery, [item["IDIntermediary"]]);
      });
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  importWarehouse: async (
    intermediary: Intermediary[],
    name: string,
    note: string,
    nature: string,
    total: number,
    title: string,
    date: Moment | null | any
  ) => {
    try {
      const { createCountCoupon, createCouponItem } = countCoupon;
      const idCoutCoupon = await createCountCoupon(
        intermediary[0]["id_WareHouse"],
        name,
        title,
        nature,
        note,
        total,
        date
      );
      const promises = intermediary.map(async (item) => {
        const insertQuery = `UPDATE Intermediary SET status = 3 WHERE ID = ?`;
        await runQueryReturnID(insertQuery, [item["IDIntermediary"]]);
        await createCouponItem(
          idCoutCoupon,
          item["IDWarehouseItem"],
          item.quantity,
          item.quality,
          item["id_WareHouse"]
        );
      });
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getAllWarehouseItemandWHName: async (id: number) => {
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
    wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
     i.ID as IDIntermediary,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS id_WareHouse, i.status, i.quality, i.quantity,
      i.date,w.name AS warehouseName 
     FROM warehouseItem wi
     JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
     JOIN warehouse w ON id_WareHouse = w.ID
     WHERE status IN (1,3,5) AND id_WareHouse = ?`;
    const rows = runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
};

export default wareHouseItem;
