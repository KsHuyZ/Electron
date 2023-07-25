import { Moment } from "moment";
import {
  runQuery,
  runQueryGetData,
  runQueryGetAllData,
  runQueryReturnID,
} from "../../utils";

const countCoupon = {
  createCountCoupon: async (
    id_Source: number,
    name: string,
    title: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null
  ) => {
    const createQuery =
      "INSERT INTO CoutCoupon(id_Source, name, title, Nature, Note,Total,date) VALUES (?,?,?,?,?,?, ?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
        name,
        title,
        nature,
        note,
        total,
        date,
      ]);
      return ID;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  countCouponRow: async () => {
    const query = "select Count(ID) from CoutCoupon";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createCouponItem: async (
    idCoutCoupon: number | unknown,
    idWarehouseItem: number,
    quantity: number,
    quality: number,
    idWarehouse: number
  ) => {
    const createQuery =
      "INSERT INTO Coupon_Item(id_Cout_Coupon, id_warehouse_item, quantity, quality, id_Warehouse) VALUES(?,?,?,?,?)";
    try {
      await runQuery(createQuery, [
        idCoutCoupon,
        idWarehouseItem,
        quantity,
        quality,
        idWarehouse,
      ]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getCountCoupon: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select cu.ID, cu.name, cu.Nature, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource, COUNT(cu.ID) OVER() AS total  from CoutCoupon cu
    JOIN Source s on s.ID = cu.id_Source
    ORDER BY cu.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    console.log({ rows, total: countResult });
    return { rows, total: countResult };
  },
  getCouponItem: async (id: number) => {
    const selectQuery = `select wh.ID as IDWarehouseItem,wh.price, ci.quality, wh.name, ci.quantity, w.name as nameWarehouse from Coupon_Item ci
    join warehouse w on w.ID = ci.id_Warehouse
    join warehouseitem wh on wh.ID = ci.id_warehouse_item
    where id_Cout_Coupon = ?
    ORDER BY ci.ID DESC`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
};

export default countCoupon;
