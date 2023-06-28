import db from "./connectDB";

const deleteDB = () => {
  db.run("DROP TABLE IF EXISTS WareHouse");
  db.run("DROP TABLE IF EXISTS WareHouseItem");
  db.run("DROP TABLE IF EXISTS Intermediary");
  db.run("DROP TABLE IF EXISTS Source");
  db.run("DROP TABLE IF EXISTS CoutDelivery");
  db.run("DROP TABLE IF EXISTS CoutCoupon");
  db.run("DROP TABLE IF EXISTS Coupon_Item");
  db.run("DROP TABLE IF EXISTS Delivery_Item");
};
export default deleteDB;
