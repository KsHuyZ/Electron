import { Moment } from "moment";
import {
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
  runQueryReturnID,
} from "../../utils";
import wareHouseItemDB from "../wareHouseItem/wareHouseItem";
import { DataType } from "../../types";

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
      "INSERT INTO Delivery_Item(id_Cout_Delivery,id_intermediary, quantity) VALUES(?,?, ?)";
    try {
      await runQuery(createQuery, [idCoutDelivery, idIntermediary, quantity]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
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
    const selectQuery = `select ci.ID,wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,wi.name, ci.quantity,i.prev_idwarehouse AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.date_expried, wi.price, wi.unit from Delivery_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
   join warehouse w on w.ID = i.prev_idwarehouse
    where ci.id_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  exportWarehouseEdit: async (
    id: number | string,
    idCoutDelivery: number,
    quantity: number,
    idWarehouse: number,
    idReceiving: number
  ) => {
    const updateQueryI = `UPDATE Intermediary SET status = 4, quantity = ?,prev_idwarehouse =?,id_WareHouse = ? WHERE ID = ?`;
    try {
      const isSuccess = await runQuery(updateQueryI, [
        quantity,
        idWarehouse,
        idReceiving,
        id,
      ]);
      await countDelivery.createDeliveryItem(idCoutDelivery, id, quantity);
      return { success: isSuccess, message: "" };
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
    idWarehouse: number,
    idWareHouseItem: number | string,
    quality: number,
    quantity: number
  ) => {
    const { getWareHouseItemByWareHouseItemIDAndWarehouseID } = wareHouseItemDB;
    try {
      const result = await getWareHouseItemByWareHouseItemIDAndWarehouseID(
        idWareHouseItem,
        idWarehouse,
        quality
      );
      if (!result) {
        await runQuery(
          `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, status
          , quality, quantity) VALUES (?, ?, ?, ?, ?)`,
          [idWarehouse, idWareHouseItem, quality, quantity]
        );
      } else {
        await runQuery(
          `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`,
          [quantity, result.IDIntermediary]
        );
      }
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
  editCountDelivery: async (
    removeItemList: DataType[],
    items: DataType[],
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
          item.id_prev_warehouse,
          item.IDWarehouseItem,
          item.quality,
          item.quality
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
            idWarehouse
          );
          if (!result.success)
            isError = { error: true, message: result.message };
        } else if (item.status === 4) {
          const result = await updateWarehouseItemExport(
            idWarehouse,
            item.quantity,
            item.IDIntermediary
          );
          if (!result.success) {
            isError = { error: true, message: result.message };
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
    paramsSearch: { name: string; itemWareHouse: string }
  ) => {
    const { name, itemWareHouse } = paramsSearch;
    const offsetValue = (currentPage - 1) * pageSize;
    const whereConditions: string[] = [];
    const queryParams: any[] = [pageSize, offsetValue];

    if (name) {
      whereConditions.unshift(`wi.name LIKE ?`);
      queryParams.unshift(`%${name}%`);
    }
    if (itemWareHouse) {
      whereConditions.unshift(`i.id_WareHouse = ?`);
      queryParams.unshift(itemWareHouse);
    }
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}  ${
            id ? `AND wi.id_Source = ${id} AND ` : ""
          } 
          status = 3 AND i.quantity > 0`
        : `WHERE ${
            id ? `wi.id_Source = ${id} AND ` : ""
          } status =3 AND i.quantity > 0`;
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
