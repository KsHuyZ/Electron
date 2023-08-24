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
      return ID;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  countDeliveryRow: async () => {
    const query = "select Count(ID) from CoutDelivery";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createDeliveryItem: async (
    idCoutDelivery: number | unknown,
    idIntermediary: number | string
  ) => {
    const createQuery =
      "INSERT INTO Delivery_Item(id_Cout_Delivery,id_intermediary) VALUES(?,?)";
    try {
      await runQuery(createQuery, [idCoutDelivery, idIntermediary]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getCountDelivery: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ce.ID, ce.name, ce.nature,ce.title, ce.Note, ce.Total as Totalprice, ce.date,w.name as nameReceiving,ce.id_WareHouse, COUNT(ce.ID) OVER() AS total  from CoutDelivery ce
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
    const selectQuery = `select di.ID,wi.name, wi.ID as IDWarehouseItem, wi.price, i.quality, i.quantity, w.name as nameWareHouse from Delivery_Item di
    join Intermediary i on i.ID = di.id_intermediary
    join warehouseitem wi on wi.ID = i.id_WareHouseItem
    join warehouse w on w.ID = i.prev_idwarehouse
    where id_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  getDeliveryItembyDeliveryID: async (id: number) => {
    const selectQuery = `select wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,wi.name, i.quantity,i.prev_idwarehouse AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.date_expried, wi.price, wi.unit from Delivery_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
   join warehouse w on w.ID = i.prev_idwarehouse
    where ci.id_Cout_Delivery = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },

  exportWarehouseEdit: async (
    id: number | string,
    IDWarehouseItem: number | string,
    name: string,
    price: number,
    dateExpried: string,
    quantityPlane: number,
    idCoutDelivery: number,
    quantity: number,
    quality: number,
    idWarehouse: number
  ) => {
    const updateQueryI = `UPDATE Intermediary SET status = 4, quantity = ?,id_WareHouse = ? WHERE ID = ?`;
    const updateQueryW = `UPDATE warehouseItem SET name = ?, price = ?, date_expried = ?, quantity_plane = ? WHERE ID = ?`;
    const isSuccess = await runQuery(updateQueryI, [quantity, idWarehouse, id]);
    const updateW = await runQuery(updateQueryW, [
      name,
      price,
      dateExpried,
      quantityPlane,
      IDWarehouseItem,
    ]);
    await countDelivery.createDeliveryItem(idCoutDelivery, id);
    return isSuccess && updateW;
  },
  deleteDeliveryItem: async (id: number | string) => {
    const deleteQuery = `DELETE FROM Delivery_Item WHERE id_intermediary = ?`;
    const isSuccess = await runQuery(deleteQuery, [id]);
    return isSuccess;
  },
  backtoTempExport: async (id: number | string) => {
    const updateQuery = `UPDATE Intermediary SET status = 2 WHERE ID = ?`;
    const isSuccess = await runQuery(updateQuery, [id]);
    return isSuccess;
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
    const isSuccess = await runQuery(updateQuery, [
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
    return isSuccess;
  },
  updateWHItem: async (
    idWareHouse: number | string,
    idIntermediary: number | string
  ) => {
    const updateQuery = `UPDATE Intermediary SET id_WareHouse = ? WHERE ID = ?`;
    const isSuccess = await runQuery(updateQuery, [
      idWareHouse,
      idIntermediary,
    ]);
    return isSuccess;
  },
  editCountDelivery: async (
    itemEditList: DataType[],
    newItemList: DataType[],
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

    itemEditList.forEach(async (item) => {
      await updateWarehouseItemExport(
        item.name,
        item.price,
        idWarehouse,
        item.date_expried,
        item.quantity_plane,
        item.quantity,
        item.IDWarehouseItem,
        item.IDIntermediary
      );
    });
    newItemList.forEach(async (item) => {
      await countDelivery.exportWarehouseEdit(
        item.IDIntermediary,
        item.IDWarehouseItem,
        item.name,
        item.price,
        item.date_expried,
        item.quantity_plane,
        ID,
        item.quantity,
        item.quality,
        item.id_WareHouse
      );
    });
    removeItemList.forEach(async (item) => {
      await countDelivery.backtoTempExport(item.IDIntermediary);
      await countDelivery.deleteDeliveryItem(item.IDIntermediary);
    });
    items.forEach(async (item) => {
      await countDelivery.updateWHItem(item.id_WareHouse, item.IDIntermediary);
    });
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
  },
  approveAccept: async (id: number | string) => {
    const updateQuery = `UPDATE CoutDelivery SET status = 1 where id = ?`;
    const isSuccess = await runQuery(updateQuery, [id]);
    return isSuccess;
  },
};

export default countDelivery;
