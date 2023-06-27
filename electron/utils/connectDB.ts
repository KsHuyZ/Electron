import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./inventory.sqlite", (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("Connect to Database success!");
});

db.run(
  "CREATE TABLE IF NOT EXISTS Warehouse (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(255))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Source (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Receiving (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Warehouseitem (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Source INTEGER NOT NULL, name VARCHAR (255), price REAL, unit VARCHAR(10) NOT NULL, quality INTEGER, date_expried DATE, date_create_at DATE, date_updated_at DATE, note VARCHAR(255), quantity_plane INTEGER, FOREIGN KEY (id_Source) REFERENCES Intermediary(ID)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS Intermediary (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_WareHouse INTEGER NOT NULL, id_WareHouseItem INTEGER NOT NULL, id_Receiving INTEGER NOT NULL, status INTEGER, quatity INTEGER, date DATE, FOREIGN KEY (id_WareHouse) REFERENCES WareHouse(ID),  FOREIGN KEY (id_WareHouseItem) REFERENCES WareHouseItem(ID), FOREIGN KEY (id_Receiving) REFERENCES Receiving(ID)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutDelivery (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Receiving INTEGER NOT NULL, name VARCHAR(100) NOT NULL, Nature VACHAR(100), Note VARCHAR(250), Total REAL, date DATE, FOREIGN KEY (id_Receiving) REFERENCES Receiving(ID)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS CoutCoupon (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_Source INTEGER NOT NULL, name VARCHAR(100) NOT NULL, Nature VACHAR(100), Note VARCHAR(250), Total REAL, date DATE, FOREIGN KEY (id_Source) REFERENCES Source(ID)"
);
export default db;
