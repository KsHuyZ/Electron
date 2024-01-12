import db from "../../utils/connectDB";
import {
  Intermediary,
  WarehouseItem,
  ISearchWareHouseItem,
  IPostMultipleItem,
  IDateRangerItem,
} from "../../types";
import {
  getTimeNow,
  isDate,
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
  runQueryReturnID,
} from "../../utils";
import countDelivery from "../countDelivery/countDelivery";
import countCoupon from "../countCoupon/countCoupon";
import historyItem from "../historyItem/historyItem";
import { Moment } from "moment";
import tempCountDelivery from "../tempCountDelivery";
import { historyItemType } from "../../utils";
const { createTempDeliveryItem } = tempCountDelivery;
const { createHistoryItem, updateLastedVersionIntermediary, getLastItemType } =
  historyItem;
const { IMPORT, EXPORT, TRANSFER } = historyItemType;

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
    wi.id_Source, wi.date_expried, wi.note, i.quantity, i.quantity AS quantityOrigin,
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
    idSource: number | string,
    data: WarehouseItem & Intermediary,
    status: number,
    dateBill?: string
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
            date_created_at ? date_created_at : getTimeNow(),
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
      const idIntermediary: any = await new Promise((resolve, reject) => {
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
      await createHistoryItem(
        idIntermediary,
        quantity_real,
        quality,
        IMPORT,
        dateBill
      );
      if (status === 1) {
        const createTempCountCoupon = `INSERT INTO Coupon_Temp_Item (id_Temp_Cout_Coupon,id_intermediary,quantity,quality,id_Warehouse)
        VALUES (?, ?, ?, ?, ?)`;

        await runQuery(createTempCountCoupon, [
          idTempCoutCoupon,
          idIntermediary,
          quantity_real,
          quality,
          idWareHouse,
        ]);
      } else if (status === 3) {
        const createCountCoupon = `INSERT INTO Coupon_Item (id_Cout_Coupon,id_intermediary,quantity,quality,id_Warehouse)
        VALUES (?, ?, ?, ?, ?)`;
        await runQuery(createCountCoupon, [
          idTempCoutCoupon,
          idIntermediary,
          quantity_real,
          quality,
          idWareHouse,
        ]);
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateWareHouseItem: async (
    idSource: number,
    data: WarehouseItem &
      Intermediary & { quantityOrigin: number; quantityI: number },
    idWareHouse: number
  ) => {
    const {
      ID,
      name,
      price,
      unit,
      quality,
      date_expried,
      note,
      quantity_plane,
      quantity,
      IDWarehouseItem,
      IDIntermediary,
      quantityOrigin,
      quantityI,
    } = data;
    try {
      await runQuery(
        `UPDATE warehouseItem SET name = ?, price = ?, unit = ?, id_Source = ?, date_expried = ?, note = ?, quantity_plane = ? WHERE ID = ?`,
        [
          name,
          price,
          unit,
          idSource,
          date_expried,
          note,
          quantity_plane,
          IDWarehouseItem,
        ]
      );

      const quantityFinal =
        Number(quantityI) + Number(quantity) - quantityOrigin;
      if (quantityI < 0) throw new Error("Bạn đã xuất mặt hàng này đi rồi");
      await runQuery(
        `UPDATE Intermediary SET quality = ?, quantity = ?, id_WareHouse = ? WHERE ID = ?`,
        [quality, quantityFinal, idWareHouse, IDIntermediary]
      );
      await updateLastedVersionIntermediary(IDIntermediary, quantityFinal);
      const updateCoutCouponItem = `UPDATE Coupon_Temp_Item SET quantity = ?, id_Warehouse = ? WHERE ID= ?`;
      await runQuery(updateCoutCouponItem, [quantity, idWareHouse, ID]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
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
  deleteWareHouseItem: async (
    IDWarehouseItem: number | string,
    IDIntermediary: number | string
  ) => {
    try {
      let isError = false;
      const rows: any = await runQueryGetAllData(
        `select status from Intermediary Where id_WareHouseItem = ?`,
        [IDWarehouseItem]
      );

      if (rows.length > 0) {
        rows.forEach(async ({ status }) => {
          if (status === 5) {
            isError = true;
          }
          await runQuery(
            `DELETE FROM Intermediary WHERE id_WareHouseItem = ?`,
            [IDWarehouseItem]
          );
        });
      }
      if (isError) {
        throw new Error("Mặt hàng đã được tạm xuất. Không thể xuất đi!");
      }
      await runQuery("DELETE FROM Coupon_Temp_Item WHERE id_intermediary = ?", [
        IDIntermediary,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  changeWareHouse: async (
    id_newWareHouse: number,
    intermediary: Intermediary[]
  ) => {
    try {
      const promises = intermediary.map(async (item) => {
        const resultID: any = await runQueryGetData(
          `SELECT * from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? AND status = ? AND quality = ?`,
          [id_newWareHouse, item.id_wareHouse_item, item.status, item.quality]
        );
        const resultQuantity: any = await runQueryGetData(
          `SELECT quantity from Intermediary WHERE ID = ?`,
          [item.idIntermediary]
        );
        if (!resultQuantity) throw new Error("Có lỗi xảy ra! Vui lòng thử lại");
        if (resultID) {
          if (Number(resultQuantity.quantity) < item.quantity) {
            throw new Error("Số lượng xuất ra lớn hơn số lượng trong kho");
          } else {
            await runQuery(
              `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`,
              [item.quantity, resultID.ID]
            );
            const quantityIncrease = resultID.quantity + item.quantity;
            await createHistoryItem(
              resultID.ID,
              quantityIncrease,
              item.quality,
              TRANSFER
            );
            await runQuery(
              `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ?`,
              [item.quantity, item.idIntermediary]
            );

            const updateResult: any = await runQueryGetData(
              "SELECT quantity FROM Intermediary WHERE ID = ?",
              [item.idIntermediary]
            );
            const type = await getLastItemType(item.idIntermediary)
            await createHistoryItem(
              item.idIntermediary,
              updateResult.quantity,
              item.quality,
              type
            );
          }
        } else {
          if (Number(resultQuantity.quantity) < item.quantity) {
            throw new Error("Số lượng xuất ra lớn hơn số lượng trong kho");
          } else {
            const IDIntermediary: any = await runQueryReturnID(
              `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, quality, quantity, date) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                id_newWareHouse,
                item.id_wareHouse_item,
                item.status,
                item.quality,
                item.quantity,
                item.date,
              ]
            );
            await createHistoryItem(
              IDIntermediary,
              item.quantity,
              item.quality,
              TRANSFER
            );
            await runQuery(
              `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ?`,
              [item.quantity, item.idIntermediary]
            );
            const updateResult: any = await runQueryGetData(
              "SELECT quantity FROM Intermediary WHERE ID = ?",
              [item.idIntermediary]
            );
            const type = await getLastItemType(item.idIntermediary)
            await createHistoryItem(
              item.idIntermediary,
              updateResult.quantity,
              item.quality,
              type
            );
          }
        }
      });

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: "" };
    }
  },
  tempExportWarehouseExist: async (
    ID: number,
    idCoutDelivery: number | unknown,
    item: Intermediary
  ) => {
    const updateQuery1 = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
    const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ?`;
    const selectQuery =
      "SELECT quantity, quality FROM Intermediary WHERE ID = ?";

      await runQuery(updateQuery2, [item.quantity, item.IDIntermediary]);
    const updateResult2: any = await runQueryGetData(selectQuery, [
      item.IDIntermediary,
    ]);
    const type = await getLastItemType(item.IDIntermediary)
    await createHistoryItem(
      item.IDIntermediary,
      updateResult2.quantity,
      updateResult2.quality,
      type
    );

    await runQuery(updateQuery1, [item.quantity, ID]);
    const updateResult1: any = await runQueryGetData(selectQuery, [ID]);
    await createHistoryItem(
      ID,
      updateResult1.quantity,
      updateResult1.quality,
      EXPORT
    );
    
    const result = await createTempDeliveryItem(
      idCoutDelivery,
      ID,
      item.quantity
    );
    return result;
  },
  tempExportWareHouse: async (
    idCoutDelivery: number | unknown,
    id_newWareHouse: number,
    intermediary: Intermediary[],
    date: string
  ) => {
    let isError = { error: false, message: "" };
    try {
      const promises = intermediary.map(async (item) => {
        const row: any = await new Promise((resolve, reject) => {
          const query = `SELECT ID,quantity, status from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? and quality = ? AND status IN (2,5)`;
          db.all(
            query,
            [id_newWareHouse, item.IDWarehouseItem, item.quality],
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
            const { status, ID } = element;
            if (status === 5 && item.status === 1) {
              if (item.quantityOrigin < item.quantity) {
                isError = {
                  error: true,
                  message: "Số lượng xuất ra lớn hơn số lượng trong kho",
                };
              } else {
                const result = await wareHouseItem.tempExportWarehouseExist(
                  ID,
                  idCoutDelivery,
                  item
                );
                if (!result.success) {
                  isError = {
                    error: true,
                    message: result.message,
                  };
                }
              }
            } else if (status === 2 && item.status === 3) {
              const result = await wareHouseItem.tempExportWarehouseExist(
                ID,
                idCoutDelivery,
                item
              );
              if (!result.success) {
                isError = {
                  error: true,
                  message: result.message,
                };
              }
            } else {
              isError = {
                error: true,
                message: "Dữ liệu không hợp lệ",
              };
            }
          });
        } else {
          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, prev_idwarehouse, status, quality, quantity, date) VALUES (?, ?,?,?, ?, ?, ?)`;
          const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? `;
          if (item.quantityOrigin < item.quantity) {
            isError = {
              error: true,
              message: "Số lượng xuất ra lớn hơn số lượng trong kho",
            };
          } else {
            const ID: any = await runQueryReturnID(changeWareHouseQuery, [
              id_newWareHouse,
              item.IDWarehouseItem,
              item.id_WareHouse,
              item.status === 1 ? 5 : 2,
              item.quality,
              item.quantity,
              item.date,
            ]);
            await createHistoryItem(
              ID,
              item.quantity,
              item.quality,
              EXPORT,
              date
            );
            await runQuery(updateWareHouseQuery, [
              item.quantity,
              item.IDIntermediary,
            ]);
            const updateResult: any = await runQueryGetData(
              "SELECT quantity FROM Intermediary WHERE ID = ?",
              [item.IDIntermediary]
            );
            const type = await getLastItemType(item.IDIntermediary)
            await createHistoryItem(
              item.IDIntermediary,
              updateResult.quantity,
              item.quality,
              type
            );
            const result = await createTempDeliveryItem(
              idCoutDelivery,
              ID,
              item.quantity
            );
            if (!result.success) {
              isError = {
                error: true,
                message: result.message,
              };
            }
          }
        }
      });
      await Promise.all(promises);
      if (isError.error) throw new Error(isError.message);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  exportWarehouse: async (
    ID: number,
    intermediary: Intermediary[],
    idReceiving: number,
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
      let isError = { error: false, message: "" };
      const { createCountDelivery, createDeliveryItem } = countDelivery;
      const result = await createCountDelivery(
        idReceiving,
        name,
        nature,
        note,
        total,
        title,
        date,
        author,
        numContract
      );
      if (!result.success) throw new Error(result.message);
      const promises = intermediary.map(async (item) => {
        if (item.status !== 2) {
          isError = { error: true, message: "Mặt hàng chưa tạm xuất" };
        }
        const insertQuery = `UPDATE Intermediary SET status = 4 WHERE ID = ?`;
        await runQueryReturnID(insertQuery, [item.IDIntermediary]);
        await createDeliveryItem(result.ID, item.IDIntermediary, item.quantity);
      });
      await Promise.all(promises);
      await runQuery(`UPDATE CoutTempDelivery SET status = 1 WHERE ID = ?`, [
        ID,
      ]);
      if (isError.error) {
        throw new Error(isError.message);
      }
      return { success: true, message: "" };
    } catch (error) {
      console.error("Lỗi", error);
      return { success: false, message: error.message };
    }
  },
  importWarehouse: async (
    intermediary: Intermediary[],
    name: string,
    note: string,
    nature: string,
    total: number,
    title: string,
    date: null | any,
    idSource: string | number,
    author: string,
    numContract: number | string,
    idTempCoutCoupon: number,
    idWareHouse: number
  ) => {
    try {
      const { createCountCoupon, createCouponItem } = countCoupon;
      const idCoutCoupon = await createCountCoupon(
        idSource,
        idWareHouse,
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
        const result: any = await runQueryGetData(
          "select id_WareHouseItem as IDWarehouseItem from Intermediary where ID = ?",
          [item.IDIntermediary]
        );
        const IDIntermediaries: any = await runQueryGetAllData(
          "select ID, status from Intermediary WHERE id_WareHouseItem = ?",
          [result.IDWarehouseItem]
        );

        IDIntermediaries.forEach(async ({ ID, status }) => {
          await runQuery(
            `UPDATE Intermediary SET status = ${
              status == 5 ? 2 : 3
            } WHERE ID = ?`,
            [ID]
          );
        });

        await createCouponItem(
          idCoutCoupon,
          item.IDIntermediary,
          item.quantity,
          item.quality,
          idWareHouse
        );
      });
      await Promise.all(promises);
      const updateQuery = `UPDATE CoutTempCoupon SET status = 1 WHERE ID = ?`;
      await runQuery(updateQuery, [idTempCoutCoupon]);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error };
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
  getAllWareHouseByDateCreated: async (
    id: number,
    dateRanger: IDateRangerItem
  ) => {
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
    wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
     i.ID as IDIntermediary,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS id_WareHouse, i.status, i.quality, i.quantity,
      i.date,w.name AS warehouseName 
     FROM warehouseItem wi
     JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
     JOIN warehouse w ON id_WareHouse = w.ID
     WHERE status IN (1,3,5) 
     AND id_WareHouse = ? 
     AND wi.date_created_at >= ? 
     AND wi.date_created_at <= ?
     AND i.quantity > 0`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      id,
      dateRanger.start,
      dateRanger.end,
    ]);
    return rows.map((item, index: number) => ({
      ...item,
      index: index + 1,
    }));
  },
  updateWarehouseItemExport: async (
    idWarehouse: number | string,
    quantity: number,
    idIntermediary: number | string,
    IDIntermediary1: number,
    quantityRemain: number,
    quantityOrigin: number
  ) => {
    const updateIntMediary = `UPDATE Intermediary SET quantity = ?,id_WareHouse = ? WHERE ID = ?`;
    try {
      const result = await runQuery(updateIntMediary, [
        quantity,
        idWarehouse,
        idIntermediary,
      ]);
      await updateLastedVersionIntermediary(idIntermediary, quantity);
      const newQuantity = quantityRemain - (quantity - quantityOrigin);
      if (newQuantity < 0) throw new Error("Số lượng chưa hợp lệ");
      await runQuery(`UPDATE Intermediary SET quantity = ? WHERE ID = ?`, [
        newQuantity,
        IDIntermediary1,
      ]);
      await updateLastedVersionIntermediary(IDIntermediary1, newQuantity);
      return { success: result, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  getWarehouseItemByName: async (name: string) => {
    const selectQuery = `select DISTINCT * from warehouseitem where name like ? limit 3`;
    const result: any = await runQueryGetAllData(selectQuery, [`%${name}%`]);
    return result;
  },
  getWareHouseItemByWareHouseItemIDAndWarehouseID: async (
    warehouseItemID: number | string,
    wareHouseID: number,
    quality: number,
    dateExpried?: string
  ) => {
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, i.ID as IDIntermediary, i.quantity
    FROM warehouseItem wi
    JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
    WHERE i.id_WareHouse = ? AND IDWarehouseItem = ? AND i.quality = ? AND (i.status = 1 OR i.status = 3)`;
    const rows: any = await runQueryGetData(selectQuery, [
      wareHouseID,
      warehouseItemID,
      quality,
    ]);
    return rows;
  },
  getWareHouseItemInWareHouse: async (
    warehouseItemID: number | string,
    wareHouseID: number,
    quality: number,
    status: number
  ) => {
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, i.ID as IDIntermediary, i.quantity
    FROM warehouseItem wi
    JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
    WHERE i.id_WareHouse = ? AND IDWarehouseItem = ? AND i.quality = ? AND i.status = ?`;
    const rows: any = await runQueryGetData(selectQuery, [
      wareHouseID,
      warehouseItemID,
      quality,
      status,
    ]);
    return rows;
  },
};

export default wareHouseItem;
