import { DataType, Intermediary, WarehouseItem } from "../../types";
import { runQuery, runQueryGetAllData, runQueryReturnID } from "../../utils";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";

const { createWareHouseItem, updateWareHouseItem } = wareHouseItemDB;

const tempCountCoupon = {
  getTempCoutCoupon: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source, cu.note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, cu.author, cu.numContract,cu.idWareHouse, cu.status,COUNT(cu.ID) OVER() AS total  from CoutTempCoupon cu
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
    idWareHouse: number,
    nature: string,
    note: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number
  ) => {
    const createQuery = `INSERT INTO CoutTempCoupon(id_Source,idWareHouse, name, title, nature, Note,Total,date, author, numContract) VALUES (?,?,?,?,?,?, ?,?,?,?)`;
    try {
      const ID = await runQueryReturnID(createQuery, [
        idSource,
        idWareHouse,
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
    try {
      items.forEach(
        async (item) =>
          await createWareHouseItem(
            idTempCoutCoupon,
            idWareHouse,
            idSource,
            item,
            1
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
  getTempCouponItembyCouponID: async (id: number) => {
    const selectQuery = `select cu.ID, wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,i.prev_idwarehouse,i.status,wi.name, cu.quantity,i.quantity AS quantityI,cu.quantity AS quantityOrigin,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.quantity_plane AS quantityPlaneOrigin,wi.date_expried, wi.price,wi.price AS priceOrigin, wi.unit FROM Coupon_Temp_Item cu
    join Intermediary i on i.ID = cu.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = IDWarehouse
    where cu.id_Temp_Cout_Coupon = ?`;
    let rows: any = await runQueryGetAllData(selectQuery, [id]);
    const promises = await rows.map(async (row, index) => {
      const status = await tempCountCoupon.getListStatusItem(
        row.IDIntermediary
      );

      if (status.some((element) => [2, 4, 5].includes(element.status))) {
        return { ...row, isExport: true };
      }
      return row;
    });
    const rowsWithStatus = await Promise.all(promises);
    return rowsWithStatus;
  },
  getListStatusItem: async (id: number) => {
    const selectQuery = `SELECT i2.status
    FROM Intermediary i1
    JOIN Intermediary i2 ON i1.id_WareHouseItem = i2.id_WareHouseItem
    WHERE i1.ID = ?
    `;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    console.log(rows);
    return rows;
  },
  updateTempCoutCoupon: async (
    ID: number,
    idSource: number,
    idWareHouse: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number,
    note: string
  ) => {
    const updateQuery = `UPDATE CoutTempCoupon SET name = ?,id_Source = ?, idWareHouse =?, nature = ? , total = ?, date = ?, title = ?, author = ?, numContract = ?, note = ? WHERE ID = ?`;
    try {
      await runQuery(updateQuery, [
        name,
        idSource,
        idWareHouse,
        nature,
        total,
        date,
        title,
        author,
        numContract,
        note,
        ID,
      ]);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  editTempCountCoupon: async (
    removeItemList: DataType[],
    items: (WarehouseItem & Intermediary & { quantityOrigin: number })[],
    ID: number,
    idSource: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number,
    note: string,
    idWareHouse: number
  ) => {
    try {
      const { deleteWareHouseItem } = wareHouseItemDB;
      let isError = { error: false, message: "" };
      removeItemList.forEach(async (item) => {
        const result = await deleteWareHouseItem(
          item.IDWarehouseItem,
          item.IDIntermediary
        );
        if (!result.success) {
          isError = { error: true, message: result.error };
        }
      });
      if (isError.error) throw new Error(isError.message);
      items.forEach(async (item) => {
        if (item.IDIntermediary) {
          const result = await updateWareHouseItem(idSource, item, idWareHouse);
          if (!result.success)
            isError = { error: true, message: isError.message };
        } else {
          const result = await createWareHouseItem(
            ID,
            idWareHouse,
            idSource,
            item,
            1
          );
          if (!result.success)
            isError = { error: true, message: isError.message };
        }
      });
      if (isError.error) {
        throw new Error(isError.message);
      }
      const result = await tempCountCoupon.updateTempCoutCoupon(
        ID,
        idSource,
        idWareHouse,
        name,
        nature,
        total,
        date,
        title,
        author,
        numContract,
        note
      );
      if (!result.success) throw new Error(result.message);
      if (isError.error) {
        throw new Error(isError.message);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default tempCountCoupon;
