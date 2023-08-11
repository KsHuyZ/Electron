import sqlite3 from "sqlite3";
import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { Source } from "../../types";
import { ISearchWareHouseItem } from "../../types";

sqlite3.verbose();

const Source = {
  //Insert Source
  createItemSource: (data: Source) => {
    return new Promise((resolve, reject) => {
      const { name, phone, address } = data;
      db.run(
        "INSERT INTO Source (name,address,phone) VALUES (?,?,?)",
        [name, address, phone],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            const ID = this.lastID;
            const newData = { ID, name, address, phone };
            resolve(newData);
          }
        }
      );
    });
  },
  getAllItemSource: async (pageSize: number, currentPage: number) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const selectQuery =
        "SELECT * ,COUNT(ID) OVER() AS total FROM Source ORDER BY ID LIMIT ? OFFSET ?";
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, [pageSize, offsetValue], (err, rows) => {
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
    }
  },

  //Update Source
  updateSource: (data: Source, ID: number) => {
    return new Promise((resolve, reject) => {
      const { name, phone, address } = data;
      db.run(
        "UPDATE Source SET name = ?, phone = ?, address= ? WHERE ID = ?",
        [name, phone, address, ID],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            const newData = {
              name,
              phone,
              address,
              ID,
            };
            resolve(newData);
          }
        }
      );
    });
  },

  deleteItemSource: (id: number) => {
    try {
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM Source WHERE ID = ?", [id], function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getAllItemSourceNoPagination: async () => {
    try {
      const selectQuery = "SELECT * FROM Source";
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      return { rows };
    } catch (err) {
      console.log(err);
    }
  },
  getAllEntryForm: async (
    id: number,
    pageSize: number,
    currentPage: number,
    paramsSearch: { name: string; itemWareHouse: string },
    isEdit?: boolean,
    isExport?: boolean
  ) => {
    const { name, itemWareHouse } = paramsSearch;

    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const whereConditions: string[] = [];
      const queryParams: any[] = [pageSize, offsetValue];

      // Add query conditions based on the provided search parameters
      if (name) {
        whereConditions.unshift(`wi.name LIKE ?`);
        queryParams.unshift(`%${name}%`);
      }
      if (itemWareHouse) {
        whereConditions.unshift(`i.id_WareHouse = ?`);
        queryParams.unshift(itemWareHouse);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")} AND ${
              !isExport ? `wi.id_Source = ${id} AND ` : ""
            }status ${
              isExport ? "= 2" : `IN(${!isEdit ? "3," : ""}1,5)`
            } AND i.quantity > 0`
          : `WHERE ${!isExport ? `wi.id_Source = ${id} AND ` : ""}status ${
              isExport ? "= 2" : `IN(${!isEdit ? "3," : ""}1,5)`
            } AND i.quantity > 0`;
      const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
        wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
        i.ID as IDIntermediary, i.id_WareHouse, i.status, i.prev_idwarehouse, i.quality, i.quantity,
        h.name as nameWareHouse,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse,
        i.date, COUNT(i.ID) OVER() AS total 
        FROM warehouseItem wi
        JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
        JOIN WareHouse h ON h.ID = ${isEdit ? "IDWarehouse" : "id_WareHouse"}
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
};
export default Source;
