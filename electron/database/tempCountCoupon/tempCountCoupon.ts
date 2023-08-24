import { DataType, Intermediary, WarehouseItem } from "../../types";
import { runQuery, runQueryGetAllData, runQueryReturnID } from "../../utils";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";
const tempCountCoupon = {
  getTempCoutCoupon: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, cu.author, cu.numContract,cu.status, COUNT(cu.ID) OVER() AS total  from CoutCoupon cu
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
};

export default tempCountCoupon;
