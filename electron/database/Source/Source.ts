import sqlite3 from "sqlite3";
import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { Source } from "../../types";
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
        "UPDATE WareHouse SET name = ?, phone = ?, address= ? WHERE is_receiving=0 AND ID = ?",
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
      console.log(error)
      return false
    }

  },

  getAllItemSourceNoPagination: async () => {
    try {
      const selectQuery =
        "SELECT * FROM Source";
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      return { rows};
    } catch (err) {
      console.log(err);
    }
  },
};
export default Source;
