import { BrowserWindow, IpcMainEvent } from "electron";
import db from "../../utils/connectDB";
import { Intermediary, WarehouseItem, } from "../../types/";

const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

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
  changeWareHouse: async (id_newWareHouse: number, intermediary: Intermediary[]) => {
    try {
      const promises = intermediary.map(async (item) => {
        console.log('item', item);
        
        const ID = await new Promise((resolve, reject) => {
          const query = `SELECT ID from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ?`;
          db.get(query, [id_newWareHouse, item.id_wareHouse_item], function (err, row:any) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              if(row){
                resolve(row.ID);
              }else{
                resolve('NOT_EXITS');
              }
            }
          });
        });

        console.log('checking id', ID);
        
  
        if (ID !== 'NOT_EXITS') {
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE ID = ?`;
            db.get(query, [item.idIntermediary], function (err, row:any) {
              if (err) {
                console.log('bugs',err);
                reject(err);
              } else {
                resolve(row.quantity);
              }
            });
          });

          if (Number(quantity) < item.quantity) {
            throw new Error("Can't change warehouseitem to new warehouse. Is too large");
          } else if (Number(quantity) > item.quantity) {
            const updateQuery1 = `UPDATE Intermediary SET  quantity = quantity + ? WHERE ID = ?`;
            const updateQuery2 = `UPDATE Intermediary SET quantity = quantity - ? WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;

            await runQuery(updateQuery1, [
              item.quantity,
              ID
            ]);

            await runQuery(updateQuery2, [
              item.quantity, 
              item.id_wareHouse_item, 
              item.id_wareHouse
            ]);
          } else {

            console.log('case3');
            

            const changeWareHouseQuery = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
            const deleteWareHouseQuery = `DELETE FROM Intermediary WHERE id_WareHouseItem = ? AND id_WareHouse = ?`;
            
            await runQuery(changeWareHouseQuery, [
              item.quantity,
              ID
            ]);
            
            await runQuery(deleteWareHouseQuery, [
              item.id_wareHouse_item, 
              item.id_wareHouse
            ]);            
          }
        } else {
          console.log('worker here');
          
          const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, quality, quantity, date) VALUES (?, ?, ?, ?, ?, ?)`;
          const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? AND id_WareHouse = ?`;
          const quantity = await new Promise((resolve, reject) => {
            const query = `SELECT quantity from Intermediary WHERE id_WareHouse = ? AND id_WareHouseItem = ?`;
            db.get(query, [item.id_wareHouse, item.id_wareHouse_item], function (err, row:any) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve(row.quantity);
              }
            });
          });

          console.log('quantity', quantity);
          
  
          if (Number(quantity) < item.quantity) {
            throw new Error("Can't change warehouseitem to new warehouse. Is too large");
          } else if (Number(quantity) > item.quantity) {
            await runQuery(changeWareHouseQuery, [
              id_newWareHouse,
               item.id_wareHouse_item,
                item.status,
                 item.quality,
                  item.quantity,
                  new Date(),
            ]);
            await runQuery(updateWareHouseQuery, [item.quantity, item.idIntermediary, item.id_wareHouse])
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
            new Date(),
          ]);

          await runQuery(deleteQuery, [item.idIntermediary]);
          console.log('Transaction committed successfully');
        } catch (err) {
          console.log('Transaction rolled back:', err);
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
  //Filter WareHouseItem By Source
  getWareHouseItemBySource: async (Source_name: string) => {
    try {
      const query= `SELECT WareHouseItem.*, Intermediary.* FROM WareHouseItem JOIN Source ON WareHouseItem.id_Source = Source.ID JOIN Intermediary ON WareHouseItem.ID = Intermediary.id_WareHouseItem WHERE Source.name = ?`
      const rows: any[]= await new Promise((resolve, reject) => {
        db.all(query,[Source_name], (err, row)=>{
          if(err){
            reject(err);
          }
          else{
            resolve(rows);
          }
        });
      });
      const warehouseItems: WarehouseItem[] = rows.map(row => ({
        idWarehouseItem: row.ID,
        idSource: row.id_Source,
        name: row.name,
        price: row.price,
        unit: row.unit,
        date_expried: row.date_expried,
        date_created_at: row.date_create_at,
        date_updated_at: row.date_updated_at,
        quantity_plane: row.quantity_plane,
        quantity_real: row.quantity_real,
        note: row.note
      }));  
      const intermediaries: Intermediary[] = rows.map(row => ({
        idIntermediary: row.IDIntermediary,
        id_wareHouse: row.id_WareHouse,
        id_wareHouse_item: row.IDWarehouseItem,
        status: row.status,
        quality: row.quality,
        quantity: row.quantity,
        date: row.date,
        date_temp_export: row.date_temp_export
      }));
      const newData={
        warehouseItems,
        intermediaries,
      };
      return newData;
    } catch (error) {
      return null;
    }
  },
  
  
};

export default wareHouseItem;

