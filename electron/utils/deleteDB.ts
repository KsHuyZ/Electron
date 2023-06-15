import db from "./connectDB";

const deleteDB = () => {
  db.run("DROP TABLE IF EXISTS warehouse");
  db.run("DROP TABLE IF EXISTS itemsource");
  db.run("DROP TABLE IF EXISTS warehouseitem");
};
export default deleteDB;
