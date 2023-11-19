import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { WarehouseReceiving } from "../../types";
import { runQueryGetAllData, runQueryGetData } from "../../utils";

const WareHouse = {
  //Insert warehouse and Receiving
  create_WareHouse_Receiving: async (data: WarehouseReceiving) => {
    const selectQuery = `SELECT ID FROM warehouse WHERE LOWER(name) = LOWER(?) AND is_receiving = ?`;
    const result: any = await runQueryGetData(selectQuery, [
      data.name,
      data.is_receiving,
    ]);
    if (result?.ID) return false;
    return new Promise((resolve, reject) => {
      const { name, address, description, is_receiving, phone } = data;
      db.run(
        "INSERT INTO WareHouse (name, description, is_receiving, phone, address) VALUES (?,?,?,?,?)",
        [name, description, is_receiving, phone, address],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            const ID = this.lastID;
            const newData = {
              ID,
              name,
              description,
              is_receiving,
              phone,
              address,
            };
            resolve(newData);
          }
        }
      );
    });
  },

  //GetAllWareHouse
  getAllWareHouse: async (pageSize: number, currentPage: number) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const selectQuery =
        "SELECT COUNT(*) OVER() AS count, * FROM WareHouse WHERE is_receiving=0 LIMIT ? OFFSET ?";
      const rows: any = await new Promise((resolve, reject) => {
        db.all(selectQuery, [pageSize, offsetValue], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const countResult = rows.length ? rows[0].count : 0;
      return { rows, total: countResult };
    } catch (err) {
      console.log("error", err);
    }
  },
  //GetAllReceving
  getAllReceiving: async (pageSize: number, currentPage: number) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const selectQuery =
        "SELECT COUNT(*) OVER() AS count, * FROM WareHouse WHERE is_receiving=1 ORDER BY ID DESC LIMIT ? OFFSET ? ";
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

  //UpdateWareHouse
  updateWarehouse: (data: Pick<WarehouseReceiving, "name" | "id">) => {
    return new Promise((resolve, reject) => {
      const { name, id } = data;
      db.run(
        "UPDATE WareHouse SET name = ? WHERE is_receiving = 0 AND ID = ?",
        [name, id],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            const newData = {
              name,
              id,
            };
            resolve(newData);
          }
        }
      );
    });
  },

  //UpdateReceiving
  updateReceiving: (data: WarehouseReceiving, id: number) => {
    return new Promise((resolve, reject) => {
      const { name, description, address } = data;
      db.run(
        "UPDATE WareHouse SET name = ?, address = ?, description = ? WHERE is_receiving = 1 AND ID = ?",
        [name, address, description, id],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  },
  getListWareHouseExceptId: async (idWareHouse: string) => {
    try {
      const selectQuery =
        "SELECT * FROM WareHouse WHERE is_receiving = 0 AND ID NOT IN(?)";
      return new Promise((resolve, reject) => {
        db.all(selectQuery, [idWareHouse], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
  getListReceiving: async () => {
    try {
      const selectQuery = "SELECT * FROM WareHouse WHERE is_receiving = 1";
      return new Promise((resolve, reject) => {
        db.all(selectQuery, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
  getAllWareHouseNoPagination: async () => {
    try {
      const selectQuery = "SELECT * FROM WareHouse WHERE is_receiving = 0";
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
  getWareHousebyID: async (ID: number) => {
    const warehouse = await runQueryGetData(
      "SELECT * FROM WareHouse WHERE id = ?",
      [ID]
    );
    return warehouse;
  },
};

export default WareHouse;
