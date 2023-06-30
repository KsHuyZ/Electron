import { BrowserWindow } from "electron";
import db from "../../utils/connectDB";
import { WarehouseReceiving } from "../../types";


const WareHouse = {
  //Insert warehouse and Receiving
  create_WareHouse_Receiving: (data: WarehouseReceiving) => {
    return new Promise((resolve, reject) => {
      const {
        name,
        address,
        description,
        is_receiving,
        phone
      } = data;
      db.run(
        "INSERT INTO WareHouse (name, description, is_receiving, phone, address) VALUES (?,?,?,?,?)",
        [name, description, is_receiving, phone, address],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err); 
          } else {
            const ID = this.lastID;
            const newData = { ID, name, description, is_receiving, phone, address };
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
      const selectQuery = "SELECT COUNT(*) OVER() AS count, * FROM WareHouse WHERE is_receiving=0 LIMIT ? OFFSET ?";
      const rows: any = await new Promise((resolve, reject) => {
          db.all(
            selectQuery,
            [pageSize, offsetValue],
            (err, rows) => {
                if (err) {
                reject(err);
                } else {
                resolve(rows);
                }
            }
          );
        });
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
    } catch (err) {
    console.log(err);
    }
  },
  //GetAllReceving
  getAllReceiving: async (pageSize: number, currentPage: number) => {
    try {
      const offsetValue = (currentPage - 1) * pageSize;
      const selectQuery = "SELECT COUNT(*) OVER() AS count, * FROM WareHouse WHERE is_receiving=1 LIMIT ? OFFSET ?";
      const rows: any = await new Promise((resolve, reject) => {
          db.all(
            selectQuery,
            [pageSize, offsetValue],
            (err, rows) => {
                if (err) {
                reject(err);
                } else {
                resolve(rows);
                }
            }
          );
        });
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
    } catch (err) {
    console.log(err);
    }
  },


  //UpdateWareHouse
  updateWarehouse: (data: WarehouseReceiving, id: number) => {
    return new Promise((resolve, reject) => {
      const { name, description } = data;
      db.run(
        "UPDATE WareHouse SET name = ?, description = ? WHERE is_receiving = 0 AND ID = ?",
        [name, description, id],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err); 
          } else {
            const newData = {
              name,
              description,
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
      const { name, description } = data;
      db.run(
        "UPDATE WareHouse SET name = ?, description = ? WHERE is_receiving = 1 AND ID = ?",
        [name, description, id],
        function (err) {
          if (err) {
            console.log(err.message);
            reject(err); 
          } else {
            const newData = {
              name,
              description,
              id,
            };
            resolve(newData);
          }
        }
      );
    });
  },
  
};

export default WareHouse;
