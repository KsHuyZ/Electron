import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./inventory.sqlite", (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("Connect to Database success!");
});

db.run(
  "CREATE TABLE IF NOT EXISTS WareHouse (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(255), is_receiving INTEGER NOT NULL, phone VARCHAR(20), address VARCHAR(255))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Source (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS WareHouseItem (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Source INTEGER NOT NULL, name NVARCHAR (255), price REAL, unit VARCHAR(10) NOT NULL, date_expried DATE, date_created_at DATE, date_updated_at DATE, note VARCHAR(255), quantity_plane INTEGER, quantity_real INTEGER, origin VARCHAR(100), FOREIGN KEY (id_Source) REFERENCES Source(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Intermediary (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_WareHouse INTEGER NOT NULL, prev_idwarehouse INTEGER, id_WareHouseItem INTEGER NOT NULL, status INTEGER, quantity INTEGER, quality INTEGER ,date_temp_export DATE, date DATE, FOREIGN KEY (id_WareHouse) REFERENCES WareHouse(ID), FOREIGN KEY (id_WareHouseItem) REFERENCES WareHouseItem(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutDelivery (ID INTEGER PRIMARY KEY AUTOINCREMENT,id_WareHouse INTEGER NOT NULL, name VARCHAR(10) NOT NULL, nature VARCHAR(100), Note VARCHAR(250), Total REAL, date DATE, title VARCHAR(250), author VARCHAR(250), numContract INTEGER, status INTEGER DEFAULT 0 NOT NULL, dateApproved VARCHAR(100), FOREIGN KEY (id_WareHouse) REFERENCES WareHouse(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutCoupon (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Source INTEGER NOT NULL, idWareHouse INTEGER NOT NULL, name VARCHAR(100) NOT NULL, nature VARCHAR(100), Note VARCHAR(250), Total REAL, date DATE, title VARCHAR(250),author VARCHAR(250), numContract INTEGER, status INTEGER DEFAULT 0 NOT NULL, dateApproved VARCHAR(100), FOREIGN KEY (id_Source) REFERENCES Source(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutTempCoupon (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Source INTEGER NOT NULL, idWareHouse INTEGER NOT NULL, name VARCHAR(100) NOT NULL, nature VARCHAR(100), Note VARCHAR(250), Total REAL, date DATE, title VARCHAR(250),author VARCHAR(250), numContract INTEGER, status INTEGER DEFAULT 0, FOREIGN KEY (id_Source) REFERENCES Source(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutTempDelivery (ID INTEGER PRIMARY KEY AUTOINCREMENT,id_WareHouse INTEGER NOT NULL, name VARCHAR(10) NOT NULL, nature VARCHAR(100), Note VARCHAR(250), Total REAL, date DATE, title VARCHAR(250), author VARCHAR(250), numContract INTEGER,status INTEGER DEFAULT 0 NOT NULL, FOREIGN KEY (id_WareHouse) REFERENCES WareHouse(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS HistoryItem (ID INTEGER PRIMARY KEY AUTOINCREMENT, IDIntermediary INTEGER NOT NULL, quantity INTEGER NOT NULL, quality INTEGER NOT NULL, time DATE, type VARCHAR(10) CHECK(type IN('TRANSFER', 'IMPORT', 'EXPORT')) NOT NULL, FOREIGN KEY (IDIntermediary) REFERENCES Intermediary(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Coupon_Item (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Cout_Coupon INTEGER NOT NULL, id_intermediary INTEGER, quantity INTEGER,quality INTEGER,id_Warehouse INTEGER NOT NULL, FOREIGN KEY (id_Cout_Coupon) REFERENCES CountCoupon(ID),FOREIGN KEY (id_intermediary) REFERENCES Intermediary(ID), FOREIGN KEY (id_Warehouse) REFERENCES WareHouse(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Delivery_Item (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Cout_Delivery INTEGER NOT NULL, id_intermediary INTEGER,quantity INTEGER, FOREIGN KEY (id_Cout_Delivery) REFERENCES CountDelivery(ID),FOREIGN KEY (id_intermediary) REFERENCES Intermediary(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Coupon_Temp_Item (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Temp_Cout_Coupon INTEGER NOT NULL, id_intermediary INTEGER, quantity INTEGER,quality INTEGER,id_Warehouse INTEGER NOT NULL, FOREIGN KEY (id_Temp_Cout_Coupon) REFERENCES CoutTempCoupon(ID),FOREIGN KEY (id_intermediary) REFERENCES Intermediary(ID), FOREIGN KEY (id_Warehouse) REFERENCES WareHouse(ID))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Delivery_Temp_Item (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Temp_Cout_Delivery INTEGER NOT NULL, id_intermediary INTEGER,quantity INTEGER, FOREIGN KEY (id_Temp_Cout_Delivery) REFERENCES CoutTempDelivery(ID),FOREIGN KEY (id_intermediary) REFERENCES Intermediary(ID))"
);
export default db;
