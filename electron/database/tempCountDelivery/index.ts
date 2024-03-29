import { DataType, Intermediary, WarehouseItem } from "../../types";
import {
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
  runQueryReturnID,
} from "../../utils";
import wareHouseItem from "../wareHouseItem/wareHouseItem";
import historyItem from "../historyItem/historyItem";
const { updateLastedVersionIntermediary } = historyItem;

const tempCountDelivery = {
  createTempCountDelivery: async (
    idWarehouse: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    title: string,
    date: any,
    author: string,
    numContract: string | number
  ) => {
    const createQuery =
      "INSERT INTO CoutTempDelivery(id_WareHouse, name, nature, Note,Total,title,date, author, numContract) VALUES (?,?,?,?,?,?,?, ?,?)";
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
  updateTempCountDelivery: async (
    ID: number,
    idWarehouse: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    title: string,
    date: any,
    author: string,
    numContract: string | number
  ) => {
    try {
      await runQuery(
        `UPDATE CoutTempDelivery 
      SET id_WareHouse = ?, name = ?,nature = ?, Note = ?, Total = ?, title = ?, date = ?, author = ?, numContract = ?
      WHERE ID = ?`,
        [
          idWarehouse,
          name,
          nature,
          note,
          total,
          title,
          date,
          author,
          numContract,
          ID,
        ]
      );
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  createTempDeliveryItem: async (
    idTempCoutDelivery: number | unknown,
    idIntermediary: number | string | unknown,
    quantity: number
  ) => {
    const createQuery =
      "INSERT INTO Delivery_Temp_Item(id_Temp_Cout_Delivery,id_intermediary,quantity) VALUES(?,?, ?)";
    try {
      await runQuery(createQuery, [
        idTempCoutDelivery,
        idIntermediary,
        quantity,
      ]);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  tempExportWarehouse: async (
    intermediary: Intermediary[],
    id_newWareHouse: number,
    name: string,
    note: string,
    nature: string,
    total: number,
    title: string,
    date: any,
    author: string,
    numContract: string | number
  ) => {
    try {
      const { createTempCountDelivery, createTempDeliveryItem } =
        tempCountDelivery;
      const { tempExportWareHouse } = wareHouseItem;
      const result1 = await createTempCountDelivery(
        id_newWareHouse,
        name,
        nature,
        note,
        total,
        title,
        date,
        author,
        numContract
      );
      if (!result1.success) throw new Error(result1.message);
      const result2 = await tempExportWareHouse(
        result1.ID,
        id_newWareHouse,
        intermediary,
        date
      );
      if (!result2.success) throw new Error(result2.message);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  getTempCountDelivery: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ce.ID, ce.name, ce.nature,ce.title, ce.Note, ce.Total as Totalprice,ce.author,ce.numContract, ce.date,w.name as nameReceiving,ce.id_WareHouse,ce.status, COUNT(ce.ID) OVER() AS total  from CoutTempDelivery ce
    JOIN warehouse w on w.ID = ce.id_WareHouse
    ORDER BY ce.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  getTempDeliveryItem: async (id: number) => {
    const selectQuery = `select di.ID,wi.name, wi.ID as IDWarehouseItem, wi.price, i.quality, di.quantity, w.name as nameWareHouse from Delivery_Temp_Item di
    join Intermediary i on i.ID = di.id_intermediary
    join warehouseitem wi on wi.ID = i.id_WareHouseItem
    join warehouse w on w.ID = i.prev_idwarehouse
    where id_Temp_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  getTemptDeliveryItembyID: async (id: number) => {
    const { getWareHouseItemByWareHouseItemIDAndWarehouseID } = wareHouseItem;
    const selectQuery = `select ci.ID, wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.status,i.quality,wi.name, ci.quantity, ci.quantity AS quantityOrigin, i.prev_idwarehouse AS IDWarehouse, w.name as nameWareHouse,wi.date_expried, wi.price, wi.unit from Delivery_Temp_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
   join warehouse w on w.ID = i.prev_idwarehouse
    where ci.id_Temp_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    const promises = await rows.map(async (row, index) => {
      const quantityInWareHouse =
        await getWareHouseItemByWareHouseItemIDAndWarehouseID(
          row.IDWarehouseItem,
          row.IDWarehouse,
          row.quality,
          row.date_expried
        );
      if (quantityInWareHouse) {
        return {
          ...row,
          quantityRemain: quantityInWareHouse.quantity,
          IDIntermediary1: quantityInWareHouse.IDIntermediary,
        };
      }
      return row;
    });
    const newRows = await Promise.all(promises);
    return newRows;
  },
  backToImportWareHouse: async (id: number, IDIntermediary: number) => {
    try {
      const quantityResult: any = await runQueryGetData(
        `SELECT quantity FROM Intermediary WHERE ID = ?`,
        [id]
      );
      const updateQuery = `UPDATE Intermediary SET quantity = quantity + ? WHERE ID = ?`;
      await runQuery(updateQuery, [quantityResult.quantity, IDIntermediary]);
      const updateResult: any = await runQueryGetData(
        "SELECT quantity FROM Intermediary WHERE ID = ?",
        [IDIntermediary]
      );
      await updateLastedVersionIntermediary(IDIntermediary, updateResult);
      await runQuery("UPDATE Intermediary set quantity = 0 WHERE ID = ?", [id]);
      await updateLastedVersionIntermediary(id, 0);
      return { success: true };
    } catch (error) {
      console.error(error.message);
      return { success: false, message: error.message };
    }
  },
  deleteDeliveryItem: async (id: number) => {
    const deleteQuery = `DELETE FROM Delivery_Temp_Item WHERE ID = ?`;
    try {
      await runQuery(deleteQuery, [id]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  updateTempExportItem: async (
    ID: number,
    IDIntermediary: number,
    quantity: number,
    quantityOrigin: number,
    quantityRemain: number,
    IDIntermediary1: number
  ) => {
    try {
      await runQuery(`UPDATE Intermediary SET quantity = ? WHERE ID = ?`, [
        quantity,
        IDIntermediary,
      ]);
      await updateLastedVersionIntermediary(IDIntermediary, quantity);
      const newQuantity = quantityRemain - (quantity - quantityOrigin);
      if (newQuantity < 0) throw new Error("Số lượng chưa hợp lệ");
      await runQuery(`UPDATE Intermediary SET quantity =  ? WHERE ID = ?`, [
        newQuantity,
        IDIntermediary1,
      ]);
      await updateLastedVersionIntermediary(IDIntermediary1, newQuantity);
      await runQuery(
        `UPDATE Delivery_Temp_Item SET quantity = ? WHERE ID = ?`,
        [quantity, ID]
      );
      console.log("ID: ", ID);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  editTempExport: async (
    removeItemList: DataType[],
    items: (WarehouseItem & Intermediary & { quantityOrigin: number })[],
    ID: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: number,
    note: string,
    idReceiving: number
  ) => {
    const idTempCoutDelivery = ID;
    try {
      let isError = { error: false, message: "" };
      removeItemList.forEach(async (item) => {
        const result = await tempCountDelivery.backToImportWareHouse(
          item.IDIntermediary,
          item.IDIntermediary1
        );
        if (!result.success) {
          isError = { error: true, message: result.message };
        }
        const result1 = await tempCountDelivery.deleteDeliveryItem(item.ID);
        if (result1.success)
          isError = { error: true, message: result1.message };
      });
      if (isError.error) throw new Error(isError.message);
      items.forEach(
        async ({
          ID,
          IDIntermediary,
          status,
          quantity,
          IDWarehouseItem,
          IDWarehouse,
          quality,
          quantityOrigin,
          IDIntermediary1,
          quantityRemain,
          id_WareHouse,
        }) => {
          if (status === 5 || status === 2) {
            const result = await tempCountDelivery.updateTempExportItem(
              ID,
              IDIntermediary,
              quantity,
              quantityOrigin,
              quantityRemain,
              IDIntermediary1
            );
            if (!result.success) {
              isError = { error: true, message: result.message };
            }
          } else if (status === 1 || status === 3) {
            const changeWareHouseQuery = `INSERT INTO Intermediary(id_WareHouse, id_WareHouseItem, prev_idwarehouse, status, quality, quantity) VALUES (?, ?,?,?, ?, ?)`;
            const updateWareHouseQuery = `UPDATE Intermediary SET quantity = quantity - ? WHERE ID = ? `;
            const newID: any = await runQueryReturnID(changeWareHouseQuery, [
              idReceiving,
              IDWarehouseItem,
              id_WareHouse,
              status === 1 ? 5 : 2,
              quality,
              quantity,
            ]);
            await updateLastedVersionIntermediary(newID, quantity);
            const result = await tempCountDelivery.createTempDeliveryItem(
              idTempCoutDelivery,
              newID,
              quantity
            );
            await runQuery(updateWareHouseQuery, [quantity, IDIntermediary]);
            const updateResult: any = await runQueryGetData(
              "SELECT quantity FROM Intermediary WHERE ID = ?",
              [IDIntermediary]
            );
            await updateLastedVersionIntermediary(
              IDIntermediary,
              updateResult.quantity
            );
            if (!result.success) {
              isError = { error: true, message: result.message };
            }
          }
        }
      );
      if (isError.error) throw new Error(isError.message);
      const result = await tempCountDelivery.updateTempCountDelivery(
        ID,
        idReceiving,
        name,
        nature,
        note,
        total,
        title,
        date,
        author,
        numContract
      );
      if (!result.success) throw new Error(result.message);
      if (isError.error) throw new Error(isError.message);
      return { success: true, message: "" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  },
  getNewTempExportItem: async (
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
      .filter((item) => item.status === 2 || item.status === 5)
      .map((item) => item.IDIntermediary1);

    // Add query conditions based on the provided search parameters
    if (name) {
      whereConditions.unshift(`wi.name LIKE ?`);
      queryParams.unshift(`%${name}%`);
    }
    if (itemWareHouse) {
      whereConditions.unshift(`i.id_WareHouse = ?`);
      queryParams.unshift(itemWareHouse);
    }
    const sameCondition = `status IN(1,3) AND i.quantity > 0 ${
      listIntermediaryID.length > 0
        ? `AND IDIntermediary NOT IN (${listIntermediaryID.toString()})`
        : ""
    }`;
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")} AND ${sameCondition}`
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
    const rows: any = await runQueryGetAllData(selectQuery, [...queryParams]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
};

export default tempCountDelivery;
