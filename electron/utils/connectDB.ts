import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./inventory.sqlite", (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("Connect to Database success!");
});

db.run(
  "CREATE TABLE IF NOT EXISTS warehouse (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(255))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS nguonHang (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS donViNhan (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
);
db.run(
  "CREATE TABLE IF NOT EXISTS warehouseitem (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_wareHouse INTEGER NOT NULL, id_nguonHang INTEGER NOT NULL, name VARCHAR (255), price REAL, unit VARCHAR(10) NOT NULL, quality INTEGER, date_expried DATE, date_create_at DATE, date_updated_at DATE, note VARCHAR(255), quantity_plane INTEGER, quantity_real INTEGER, status INTEGER, FOREIGN KEY (id_wareHouse) REFERENCES wareHouse(ID), FOREIGN KEY (id_nguonHang) REFERENCES nguonHang(ID))"
);

export default db;
