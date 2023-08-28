import db from "../../utils/connectDB";
import {
  Intermediary,
  WarehouseItem,
  ISearchWareHouseItem,
  IPostMultipleItem,
} from "../../types";
import {
  isDate,
  runQuery,
  runQueryGetAllData,
  runQueryReturnID,
} from "../../utils";
import countDelivery from "../countDelivery/countDelivery";
import countCoupon from "../countCoupon/countCoupon";
import { Moment } from "moment";
import tempCountDelivery from "../tempCountDelivery";
const { createTempDeliveryItem } = tempCountDelivery;
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

      if (now_date_ex) {
        whereConditions.unshift(`wi.date_expried >= ?`);
        queryParams.unshift(now_date_ex);
      }

      if (after_date_ex) {
        whereConditions.unshift(`wi.date_expried <= ?`);
        queryParams.unshift(after_date_ex);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(
              " AND "
            )} AND i.id_WareHouse = ? AND i.quantity > 0`
          : "WHERE i.id_WareHouse = ? AND i.quantity > 0";
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
    const { name, idSource, startDate, endDate, status, itemWareHouse } =
      paramsSearch;

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

      if (itemWareHouse) {
        whereConditions.unshift(`i.prev_idwarehouse = ?`);
        queryParams.unshift(itemWareHouse);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(
              " AND "
            )} AND i.id_WareHouse = ? AND i.status IN(2,4,5)  AND i.quantity > 0`
          : "WHERE i.id_WareHouse = ? AND i.status IN(2,4,5)  AND i.quantity > 0";

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

    if (now_date_ex) {
      whereConditions.unshift(`wi.date_expried >= ?`);
      queryParams.unshift(now_date_ex);
    }

    if (after_date_ex) {
      whereConditions.unshift(`wi.date_expried <= ?`);
      queryParams.unshift(after_date_ex);
    }
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(
            " AND "
          )} AND i.status IN(1,3) AND i.quantity > 0`
        : "AND i.status IN(1,3) AND i.quantity > 0";
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
    wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
     i.ID as IDIntermediary,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS id_WareHouse, i.status, i.quality, i.quantity,
      i.date,w.name AS nameWareHouse, COUNT(i.ID) OVER() AS total 
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
  createWareHouseItem: async (
    idTempCoutCoupon: number | unknown,
    idWareHouse: number,
    idSource: number,
    data: WarehouseItem & Intermediary
  ) => {
    const {
      name,
      price,
      unit,
      quality,
      date_expried,
      date_created_at,
      date_updated_at,
      note,
      date,
      quantity_plane,
      quantity_real,
      origin,
    } = data;
    const status = 1;

    try {
      const createItemQuery = `INSERT INTO warehouseItem (id_Source, name, price, unit, date_expried, 
        date_created_at, date_updated_at, note, quantity_plane, quantity_real, origin) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
            origin,
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
          [idWareHouse, idWarehouseItem, status, quality, quantity_real, date],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
      const createTempCountCoupon = `INSERT INTO Coupon_Temp_Item (id_Temp_Cout_Coupon,id_intermediary,quantity,quality,id_Warehouse)
      VALUES (?, ?, ?, ?, ?)`;
      const ID = await runQueryReturnID(createTempCountCoupon, [
        idTempCoutCoupon,
        idIntermediary,
        quantity_real,
        quality,
        idWareHouse,
      ]);

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
                  isDate(date_expried) ? date_expried : null,
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
  // Bug maybe
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
      origin,
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
        `UPDATE warehouseItem SET name = ?, price = ?, unit = ?, id_Source = ?, date_expried = ?, date_created_at = ?, date_updated_at = ?, note = ?, quantity_plane = ?, origin = ? WHERE ID = ?`,
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
          origin,
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
  changeWareHouse: async (
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      const promises = intermediary.map(async (item) => {
        const ID = await new Promise((resolve, reject) => {
          const query = `SELECT ID from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? AND quantity > 0`;
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
          } else {
            const updateQuery1 = `UPDATE Intermediary SET  quantity = quantity + ? WHERE ID = ?`;
            const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;

            await runQuery(updateQuery1, [item.quantity, ID]);

            await runQuery(updateQuery2, [
              item.quantity,
              item.id_wareHouse_item,
              item.id_wareHouse,
            ]);
          }
        } else {
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
          } else {
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
  tempExportWareHouse: async (
    idCoutDelivery: number | unknown,
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      const promises = intermediary.map(async (item) => {
        const row: any = await new Promise((resolve, reject) => {
          const query = `SELECT ID,quantity, status from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? and quality = ? and prev_idwarehouse = ? AND status IN (2,5) AND quantity > 0`;
          db.all(
            query,
            [
              id_newWareHouse,
              item["IDWarehouseItem"],
              item["newQuantity"],
              item["id_WareHouse"],
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
          await row.forEach(async (element) => {
            console.log("This is row data", element);
            const { quantity, status, ID } = element;
            if (Number(quantity) < item["newQuantity"]) {
              throw new Error(
                "Can't export warehouseitem to receiving. Is too large"
              );
            } else {
              console.log(
                "update quantity in new warehouse and remove quantity in old warehouse"
              );
              const updateQuery1 = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
              const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;
              await runQuery(updateQuery1, [item["newQuantity"], ID]);

              await runQuery(updateQuery2, [
                item["newQuantity"],
                item["IDWarehouseItem"],
                item["id_WareHouse"],
              ]);
              await createTempDeliveryItem(
                idCoutDelivery,
                ID,
                item["newQuantity"]
              );
            }
          });
        } else {
          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, prev_idwarehouse, status, quality, quantity, date) VALUES (?, ?,?,?, ?, ?, ?)`;
          const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? `;
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE ID = ?`;
            db.get(query, [item["IDIntermediary"]], function (err, row: any) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve(row.quantity);
              }
            });
          });
          if (Number(quantity) < item["newQuantity"]) {
            throw new Error(
              "Can't change warehouseitem to new warehouse. Is too large"
            );
          } else {
            const ID = await runQueryReturnID(changeWareHouseQuery, [
              id_newWareHouse,
              item["IDWarehouseItem"],
              item["id_WareHouse"],
              item.status === 1 ? 5 : 2,
              item.quality,
              item["newQuantity"],
              item.date,
            ]);

            await runQuery(updateWareHouseQuery, [
              item["newQuantity"],
              item["IDIntermediary"],
            ]);
            await createTempDeliveryItem(
              idCoutDelivery,
              ID,
              item["newQuantity"]
            );
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
    date: Moment | null | any,
    author: string,
    numContract: string | number
  ) => {
    try {
      const { createCountDelivery, createDeliveryItem } = countDelivery;
      const ID = await createCountDelivery(
        intermediary[0]["id_WareHouse"],
        name,
        nature,
        note,
        total,
        title,
        date,
        author,
        numContract
      );
      const promises = intermediary.map(async (item) => {
        const insertQuery = `UPDATE Intermediary SET status = 4 WHERE ID = ?`;
        await runQueryReturnID(insertQuery, [item["IDIntermediary"]]);
        await createDeliveryItem(ID, item["IDIntermediary"], item.quantity);
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
    date: Moment | null | any,
    idSource: string | number,
    author: string,
    numContract: number | string
  ) => {
    try {
      const { createCountCoupon, createCouponItem } = countCoupon;
      const idCoutCoupon = await createCountCoupon(
        idSource,
        name,
        title,
        nature,
        note,
        total,
        date,
        author,
        numContract
      );
      const promises = intermediary.map(async (item) => {
        const insertQuery = `UPDATE Intermediary SET status = ${
          item.status == 5 ? 2 : 3
        } WHERE ID = ?`;
        const idWarehouse = item["prev_idwarehouse"]
          ? item["prev_idwarehouse"]
          : item["id_WareHouse"];
        await runQueryReturnID(insertQuery, [item["IDIntermediary"]]);
        await createCouponItem(
          idCoutCoupon,
          item["IDIntermediary"],
          item.quantity,
          item.quality,
          idWarehouse
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
      i.date,w.name AS nameWareHouse 
     FROM warehouseItem wi
     JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
     JOIN warehouse w ON id_WareHouse = w.ID
     WHERE status IN (1,3,5) AND id_WareHouse = ? and i.quantity > 0`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows.map((item, index: number) => ({
      ...item,
      index: index + 1,
    }));
  },

  updateWarehouseItemExport: async (
    name: string,
    price: number,
    idWarehouse: number | string,
    dateExpried: string,
    quantityPlane: number,
    quantity: number,
    idWareHouseItem: number | string,
    idIntermediary: number | string
  ) => {
    const updateQuery = `UPDATE warehouseItem SET name = ?, price = ?, date_expried = ?, quantity_plane = ? WHERE ID = ?`;
    const updateIntMediary = `UPDATE Intermediary SET quantity = ?,id_WareHouse = ? WHERE ID = ?`;
    const result1 = await runQuery(updateQuery, [
      name,
      price,
      dateExpried,
      quantityPlane,
      idWareHouseItem,
    ]);
    const result2 = await runQuery(updateIntMediary, [
      quantity,
      idWarehouse,
      idIntermediary,
    ]);
    return result1 && result2;
  },
  getWarehouseItemByName: async (name: string) => {
    const selectQuery = `select DISTINCT * from warehouseitem where name like ? limit 3`;
    const result: any = await runQueryGetAllData(selectQuery, [`%${name}%`]);
    return result;
  },
};

export default wareHouseItem;
