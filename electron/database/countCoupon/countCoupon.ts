import { Moment } from "moment";
import {
  runQuery,
  runQueryGetData,
  runQueryGetAllData,
  runQueryReturnID,
} from "../../utils";
import { DataType, Intermediary, WarehouseItem } from "../../types";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";
import tempCountCoupon from "../tempCountCoupon/tempCountCoupon";

const { createWareHouseItem } = wareHouseItemDB;

const countCoupon = {
  createCountCoupon: async (
    id_Source: number | string,
    idWareHouse: number,
    name: string,
    title: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null,
    author: string,
    numContract: number | string
  ) => {
    const createQuery =
      "INSERT INTO CoutCoupon(id_Source,idWareHouse, name, title, nature, Note,Total,date, author, numContract) VALUES (?,?,?,?,?,?,?, ?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
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
  countCouponRow: async () => {
    const query = "select Count(ID) from CoutCoupon";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createCouponItem: async (
    idCoutCoupon: number | unknown,
    idIntermediary: number | string | unknown,
    quantity: number,
    quality: number,
    idWareHouse: number
  ) => {
    const createQuery =
      "INSERT INTO Coupon_Item(id_Cout_Coupon, id_intermediary, quantity, quality, id_Warehouse) VALUES(?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        idCoutCoupon,
        idIntermediary,
        quantity,
        quality,
        idWareHouse,
      ]);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getCountCoupon: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source,cu.idWareHouse, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, cu.author, cu.numContract,cu.status, COUNT(cu.ID) OVER() AS total  from CoutCoupon cu
    JOIN Source s on s.ID = cu.id_Source
    ORDER BY cu.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  getCouponItem: async (id: number) => {
    const selectQuery = `select wi.ID as IDWarehouseItem,wi.name,ci.quantity, ci.quality, wi.price, wi.date_expried, w.name as nameWareHouse from coupon_item ci
    join Intermediary i on i.ID = ci.id_intermediary 
    join warehouseitem wi on wi.ID = i.id_WareHouseItem 
    join warehouse w on w.ID = ci.id_Warehouse
    where ci.id_Cout_Coupon = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  getCouponItembyCouponID: async (id: number) => {
    const selectQuery = `select wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,i.prev_idwarehouse,i.status,wi.name, ci.quantity ,i.quantity as quantityI, ci.quantity as quantityOrigin, CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane, wi.quantity_plane AS quantityPlaneOrigin,wi.date_expried, wi.price, wi.price as priceOrigin, wi.unit from Coupon_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = IDWarehouse
    where ci.id_Cout_Coupon = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    const promises = await rows.map(async (row, index) => {
      const results = await tempCountCoupon.getListStatusItem(
        row.IDIntermediary
      );

      const quantityExport = results
        .filter(({ status }) => status === 2 || status === 4)
        .reduce(
          (accumulator: number, currentValue: any) =>
            accumulator + currentValue.quantity,
          0
        );
      return { ...row, quantityExport };

      return row;
    });
    const rowsWithStatus = await Promise.all(promises);
    return rowsWithStatus;
  },
  updateCouponItem: async (quantity: number, id: string | number) => {
    try {
      await runQuery(
        `UPDATE Coupon_Item SET quantity = ? WHERE id_intermediary = ?`,
        [quantity, id]
      );
      return { success: true, message: "" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  updateCountCoupon: async (
    id: number,
    idSource: number,
    name: string,
    nature: string,
    Total: number,
    date: string,
    title: string,
    author: string,
    numContract: number | string
  ) => {
    const updateQuery = `UPDATE CoutCoupon SET id_Source = ?, name = ?, nature = ?, Total = ?, date = ?, title = ?, author = ?, numContract = ? where id = ?`;
    try {
      await runQuery(updateQuery, [
        idSource,
        name,
        nature,
        Total,
        date,
        title,
        author,
        numContract,
        id,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  importWarehouseEdit: async (
    id: number | string,
    IDWarehouseItem: number | string,
    name: string,
    price: number,
    dateExpried: string,
    quantityPlane: number,
    quantity: number,
    idSource: string | number,
    status: number,
    idWareHouse: number,
    ID: unknown | number,
    quantityOrigin: number
  ) => {
    try {
      const quantityInWareHouse: any = await runQueryGetData(
        "SELECT quantity FROM Intermediary WHERE ID = ?",
        [id]
      );
      const finalQuantity =
        quantity - quantityOrigin + quantityInWareHouse.quantity;
      if (finalQuantity < 0)
        throw new Error("Bạn không thể sửa quá số lượng xuống nữa");
      const updateQueryI = `UPDATE Intermediary SET status = ${
        status === 5 || status === 1 ? 2 : 3
      }, quantity = ?, id_WareHouse = ? WHERE ID = ?`;
      const updateQueryW = `UPDATE warehouseItem SET name = ?, price = ?, date_expried = ?, quantity_plane = ?,id_Source = ? WHERE ID = ?`;
      await runQuery(updateQueryI, [finalQuantity, idWareHouse, id]);
      await runQuery(updateQueryW, [
        name,
        price,
        dateExpried,
        quantityPlane,
        idSource,
        IDWarehouseItem,
      ]);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error.message);
      return { success: false, message: error.message };
    }
  },

  backtoTempImport: async (item: DataType) => {
    try {
      const updateQuery = `UPDATE Intermediary SET status = ${
        item.status === 2 ? 5 : 1
      },quantity = 0 WHERE ID = ?`;
      await runQuery(updateQuery, [item.IDIntermediary]);
      return { success: true, message: "" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  deleteCouponItem: async (id: number | string) => {
    try {
      await runQuery(`DELETE FROM Coupon_Item WHERE id_intermediary = ?`, [id]);
      return { success: true, message: "" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  editCountCoupon: async (
    removeItemList: DataType[],
    newItemList: DataType[],
    items: (WarehouseItem & Intermediary)[],
    ID: number,
    idSource: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: string | number,
    note: string,
    idWareHouse: number
  ) => {
    try {
      let isError = { error: false, message: "" };
      removeItemList.forEach(async (item) => {
        const result1 = await countCoupon.backtoTempImport(item);
        if (!result1.success)
          isError = { error: true, message: result1.message };
        const result2 = await countCoupon.deleteCouponItem(item.IDIntermediary);
        if (!result2.success)
          isError = { error: true, message: result2.message };
      });
      if (isError.error) throw new Error(isError.message);
      items.forEach(async (item) => {
        if (item.IDIntermediary) {
          const result1 = await countCoupon.updateCouponItem(
            item.quantity,
            item.IDIntermediary
          );
          if (!result1.success)
            isError = { error: true, message: result1.message };
          const result2 = await countCoupon.importWarehouseEdit(
            item.IDIntermediary,
            item.IDWarehouseItem,
            item.name,
            item.price,
            item.date_expried,
            item.quantity_plane,
            item.quantity,
            idSource,
            item.status,
            idWareHouse,
            ID,
            item["quantityOrigin"]
          );
          if (!result2.success)
            isError = { error: true, message: result2.message };
        } else {
          const result = await createWareHouseItem(
            ID,
            idWareHouse,
            idSource,
            item,
            3
          );
          if (!result.success)
            isError = { error: true, message: result.message };
        }
      });
      if (isError.error) throw new Error(isError.message);
      const result = await countCoupon.updateCountCoupon(
        ID,
        idSource,
        name,
        nature,
        total,
        date,
        title,
        author,
        numContract
      );
      if (!result.success) throw new Error(result.message);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  approveAccept: async (id: number | string) => {
    const updateQuery = `UPDATE CoutCoupon SET status = 1 where id = ?`;
    const isSuccess = await runQuery(updateQuery, [id]);
    return isSuccess;
  },
};

export default countCoupon;
