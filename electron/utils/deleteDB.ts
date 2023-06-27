import db from "./connectDB";

const deleteDB = () => {
  db.run("DROP TABLE IF EXISTS warehouse");
  db.run("DROP TABLE IF EXISTS itemsource");
  db.run("DROP TABLE IF EXISTS warehouseitem");
  db.run("DROP TABLE IF EXISTS donViNhan");
  db.run("DROP TABLE IF EXISTS nguonHang");

};
export default deleteDB;
