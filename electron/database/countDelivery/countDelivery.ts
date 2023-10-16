import { Moment } from "moment";
import {
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
  runQueryReturnID,
} from "../../utils";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";
import { DataType, Intermediary } from "../../types";

const countDelivery = {
  createCountDelivery: async (
    idWarehouse: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    title: string,
    date: Moment | null,
    author: string,
    numContract: string | number
  ) => {
    const createQuery =
      "INSERT INTO CoutDelivery(id_WareHouse, name, nature, Note,Total,title,date, author, numContract) VALUES (?,?,?,?,?,?,?, ?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        idWarehouse,
        name,
        nature,
        note,
        total,
        title,
        date,
        author,
        numContract,
      ]);
      return { success: true, ID };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  countDeliveryRow: async () => {
    const query = "select Count(ID) from CoutDelivery";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createDeliveryItem: async (
    idCoutDelivery: number | unknown,
    idIntermediary: number | string,
    quantity: number
  ) => {
    const createQuery =
      "INSERT INTO Delivery_Item(id_Cout_Delivery,id_intermediary, quantity) VALUES(?, ?, ?)";
    try {
      await runQuery(createQuery, [idCoutDelivery, idIntermediary, quantity]);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  getCountDelivery: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ce.ID, ce.name, ce.nature,ce.title, ce.Note, ce.Total as Totalprice, ce.date,w.name as nameReceiving,ce.id_WareHouse,ce.status,ce.author, ce.numContract, COUNT(ce.ID) OVER() AS total  from CoutDelivery ce
    JOIN warehouse w on w.ID = ce.id_WareHouse
    ORDER BY ce.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  getDeliveryItem: async (id: number) => {
    const selectQuery = `select di.ID,wi.name, wi.ID as IDWarehouseItem, wi.price, i.quality, di.quantity, w.name as nameWareHouse from Delivery_Item di
    join Intermediary i on i.ID = di.id_intermediary
    join warehouseitem wi on wi.ID = i.id_WareHouseItem
    join warehouse w on w.ID = i.prev_idwarehouse
    where id_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  getDeliveryItembyDeliveryID: async (id: number) => {
    const { getWareHouseItemInWareHouse } = wareHouseItemDB;

    const selectQuery = `select ci.ID,wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,wi.name, ci.quantity,ci.quantity AS quantityOrigin,i.prev_idwarehouse AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.date_expried,ci.quantity as quantityOrigin,i.status,wi.price, wi.unit from Delivery_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
   join warehouse w on w.ID = i.prev_idwarehouse
    where ci.id_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    const promises = await rows.map(async (row, index) => {
      const quantityInWareHouse = await getWareHouseItemInWareHouse(
        row.IDWarehouseItem,
        row.IDWarehouse,
        row.quality,
        3
      );
      if (!quantityInWareHouse) return row;
      return {
        ...row,
        quantityRemain: quantityInWareHouse ? quantityInWareHouse.quantity : 0,
        IDIntermediary1: quantityInWareHouse?.IDIntermediary,
      };
    });
    const newRows = await Promise.all(promises);
    return newRows;
  },
  exportWarehouseEdit: async (
    id: number | string,
    idCoutDelivery: number,
    quantity: number,
    idWarehouse: number,
    idReceiving: number,
    idWareHouseItem: number,
    quality: number
  ) => {
    const query = `SELECT ID,quantity from Intermediary WHERE id_WareHouse = ? and id_WareHouseItem = ? and quality = ? AND status = 4`;
    const selectQuery = "SELECT quantity FROM Intermediary WHERE ID = ?";
    try {
      const quantityRemain = await runQueryGetData(selectQuery, [id]);
      if (!quantityRemain) throw new Error("Có lỗi xảy ra, Vui lòng thử lại!");
      if (Number(quantityRemain) < quantity)
        throw new Error("Số lượng xuất ra lớn hơn số lượng trong kho");

      const row: any = await runQueryGetData(query, [
        idReceiving,
        idWareHouseItem,
        quality,
      ]);
      await runQuery(
        `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ?`,
        [quantity, id]
      );
      if (row) {
        await runQuery(
          `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`,
          [quantity, row.ID]
        );
        const result = await countDelivery.createDeliveryItem(
          idCoutDelivery,
          row.id,
          quantity
        );
        if (!result.success) throw new Error(result.message);
      } else {
        const ID: any = await runQueryReturnID(
          `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status, prev_idwarehouse
          , quality, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
          [idReceiving, idWareHouseItem, 4, idWarehouse, quality, quantity]
        );
        if (!ID) throw new Error("Đã có lỗi xảy ra! Vui lòng thử lại");
        const result = await countDelivery.createDeliveryItem(
          idCoutDelivery,
          ID,
          quantity
        );
        if (!result.success) throw new Error(result.message);
      }

      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  deleteDeliveryItem: async (id: number | string) => {
    try {
      await runQuery(`DELETE FROM Delivery_Item WHERE ID = ?`, [id]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  backtoImportWarehouseItem: async (
    id: number | string,
    IDIntermediary: number
  ) => {
    try {
      const quantityResult: any = await runQueryGetData(
        `SELECT quantity FROM Intermediary WHERE ID = ?`,
        [id]
      );
      await runQuery(
        `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`,
        [quantityResult.quantity, IDIntermediary]
      );
      await runQuery("UPDATE Intermediary set quantity = 0 WHERE ID = ?", [id]);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  updateCountDelivery: async (
    id: number,
    idWareHouse: number,
    name: string,
    nature: string,
    Total: number,
    date: string,
    title: string,
    author: string,
    numContract: number | string
  ) => {
    const updateQuery = `UPDATE CoutDelivery SET id_WareHouse = ?, name = ?, nature = ?, Total = ?, date = ?, title = ?, author = ?, numContract = ? where id = ?`;
    try {
      await runQuery(updateQuery, [
        idWareHouse,
        name,
        nature,
        Total,
        date,
        title,
        id,
        author,
        numContract,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  updateCountDeliveryItem: async (ID: number, quantity: number) => {
    console.log(ID, quantity);
    try {
      await runQuery(`UPDATE Delivery_Item SET quantity = ? WHERE ID = ?`, [
        quantity,
        ID,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  editCountDelivery: async (
    removeItemList: DataType[],
    items: Intermediary[],
    ID: number,
    idWarehouse: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number | string
  ) => {
    const { updateWarehouseItemExport } = wareHouseItemDB;
    let isError = { error: false, message: "" };
    try {
      removeItemList.forEach(async (item) => {
        const result = await countDelivery.backtoImportWarehouseItem(
          item.IDIntermediary,
          item.IDIntermediary1
        );
        if (!result.success) isError = { error: true, message: result.message };
        const result1 = await countDelivery.deleteDeliveryItem(item.ID);
        if (!result1.success)
          isError = { error: true, message: result1.message };
      });
      if (isError.error) throw new Error(isError.message);
      items.forEach(async (item) => {
        if (item.status === 3) {
          const result = await countDelivery.exportWarehouseEdit(
            item.IDIntermediary,
            ID,
            item.quantity,
            item.id_WareHouse,
            idWarehouse,
            item.IDWarehouseItem,
            item.quality
          );
          if (!result.success)
            isError = { error: true, message: result.message };
        } else if (item.status === 4) {
          const result = await updateWarehouseItemExport(
            idWarehouse,
            item.quantity,
            item.IDIntermediary,
            item.IDIntermediary1,
            item.quantityRemain,
            item.quantityOrigin
          );
          if (!result.success) {
            isError = { error: true, message: result.message };
          }
          const result1 = await countDelivery.updateCountDeliveryItem(
            item.ID,
            item.quantity
          );
          if (!result1.success) {
            isError = { error: true, message: result1.message };
          }
        }
      });
      if (isError.error) throw new Error(isError.message);
      await countDelivery.updateCountDelivery(
        ID,
        idWarehouse,
        name,
        nature,
        total,
        date,
        title,
        author,
        numContract
      );
      console.log(isError);
      if (isError.error) throw new Error(isError.message);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  approveAccept: async (id: number | string) => {
    const updateQuery = `UPDATE CoutDelivery SET status = 1 where id = ?`;
    const isSuccess = await runQuery(updateQuery, [id]);
    return isSuccess;
  },
  getWareHouseItemOfficialInWareHouse: async (
    id: number,
    pageSize: number,
    currentPage: number,
    paramsSearch: { name: string; itemWareHouse: string },
    listItemHasChoose: DataType[]
  ) => {
    const { name, itemWareHouse } = paramsSearch;
    const offsetValue = (currentPage - 1) * pageSize;
    const whereConditions: string[] = [];
    const queryParams: any[] = [pageSize, offsetValue];
    const listIntermediaryID = listItemHasChoose
      .filter((item) => item.status === 4)
      .map((item) => item.IDIntermediary1);

    if (name) {
      whereConditions.unshift(`wi.name LIKE ?`);
      queryParams.unshift(`%${name}%`);
    }
    if (itemWareHouse) {
      whereConditions.unshift(`i.id_WareHouse = ?`);
      queryParams.unshift(itemWareHouse);
    }
    const sameCondition = `status = 3 AND i.quantity > 0 ${
      listIntermediaryID.length > 0
        ? `AND IDIntermediary NOT IN (${listIntermediaryID.toString()})`
        : ""
    }`;
    console.log(sameCondition);
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ") + "AND"} 
          ${sameCondition}`
        : `WHERE ${sameCondition}`;
    const selectQuery = `SELECT wi.ID as IDWarehouseItem, wi.name, wi.price, wi.unit,
    wi.id_Source, wi.date_expried, wi.note, wi.quantity_plane, wi.quantity_real,
    i.ID as IDIntermediary, i.id_WareHouse, i.status, i.prev_idwarehouse, i.quality, i.quantity, i.quantity AS quantityRemain,
    h.name as nameWareHouse,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse,
    i.date, COUNT(i.ID) OVER() AS total 
    FROM warehouseItem wi
    JOIN Intermediary i ON wi.ID = i.id_WareHouseItem
    JOIN WareHouse h ON h.ID = IDWarehouse
    ${whereClause}
    ORDER BY i.ID DESC
    LIMIT ? OFFSET ?`;

    try {
      const rows: any = await runQueryGetAllData(selectQuery, queryParams);
      const countResult = rows.length > 0 ? rows[0].total : 0;
      return { rows, total: countResult };
    } catch (error) {
      console.log(error);
      return { rows: [], total: 0 };
    }
  },
};

export default countDelivery;
