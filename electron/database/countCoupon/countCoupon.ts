import { Moment } from "moment";
import {
   runQuery, 
   runQueryGetData,
   runQueryGetAllData, 
   runQueryReturnID 
  } from "../../utils";

const countCoupon = {
  createCountCoupon: async (
    id_Source: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null,
  ) => {
    const createQuery =
      "INSERT INTO CoutCoupon(id_Source, name, Nature, Note,Total,date) VALUES (?,?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
        name,
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
    name: string,
    quantity: number,
    price: number,
    quality: number,
    idWarehouse: number,
  ) => {
    const createQuery =
      "INSERT INTO Coupon_Item(id_Cout_Coupon, name, quantity, quality, price, id_Warehouse) VALUES(?,?,?,?,?,?)";
    try {
      await runQuery(createQuery, [
        idCoutCoupon, 
        name,
        quantity,
        quality,
        price,
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
    const rows: any = runQueryGetAllData(selectQuery, [pageSize, offsetValue]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  getCouponItem: async (
    id: number,
    pageSize: number,
    currentPage: number
  ) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ci.ID, ci.name, ci.quality, ci.quantity, ci.price, w.name as nameWarehouse,  COUNT(ci.ID) OVER() AS total from Coupon_Item ci
    join warehouse w on w.ID = ci.id_Warehouse
    where id_Cout_Coupon = ?
    ORDER BY ci.ID DESC
    LIMIT ? OFFSET ?`;
    const rows: any = runQueryGetAllData(selectQuery, [
      id,
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
};

export default countCoupon;
