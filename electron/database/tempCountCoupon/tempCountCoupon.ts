import { DataType, Intermediary, WarehouseItem } from "../../types";
import { runQuery, runQueryGetAllData, runQueryReturnID } from "../../utils";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";
const tempCountCoupon = {
  getTempCoutCoupon: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, cu.author, cu.numContract, COUNT(cu.ID) OVER() AS total  from CoutTempCoupon cu
    JOIN Source s on s.ID = cu.id_Source
    ORDER BY cu.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  createTempCountCoupon: async (
    name: string,
    idSource: number,
    nature: string,
    note: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number
  ) => {
    const createQuery = `INSERT INTO CoutTempCoupon(id_Source, name, title, nature, Note,Total,date, author, numContract) VALUES (?,?,?,?,?,?, ?,?,?)`;
    try {
      const ID = await runQueryReturnID(createQuery, [
        idSource,
        name,
        title,
        nature,
        note,
        total,
        date,
        author,
        numContract,
      ]);
      return ID;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  createMutipleWarehouseItem: async (
    idTempCoutCoupon: number | unknown,
    items: (WarehouseItem & Intermediary)[],
    idSource: number,
    idWareHouse: number
  ) => {
    const { createWareHouseItem } = wareHouseItemDB;
    try {
      items.forEach(
        async (item) =>
          await createWareHouseItem(
            idTempCoutCoupon,
            idWareHouse,
            idSource,
            item
          )
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getTempCoutCouponItem: async (id: number) => {
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name,wi.price,wi.quantity_plane,wi.unit, cu.quantity, cu.quality,w.name as nameWareHouse FROM Coupon_Temp_Item cu
    JOIN Intermediary i on i.ID = cu.id_intermediary
    JOIN WareHouseItem wi on wi.ID = i.id_WareHouseItem
    JOIN WareHouse w on w.ID = cu.id_Warehouse
    WHERE cu.id_Temp_Cout_Coupon = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
};

export default tempCountCoupon;
