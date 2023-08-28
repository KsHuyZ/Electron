import { Intermediary } from "../../types";
import { runQuery, runQueryGetAllData, runQueryReturnID } from "../../utils";
import wareHouseItem from "../wareHouseItem/wareHouseItem";

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
      return ID;
    } catch (error) {
      console.log(error);
      return false;
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
      return true;
    } catch (error) {
      console.log(error);
      return false;
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
      const ID = await createTempCountDelivery(
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
      await tempExportWareHouse(ID, id_newWareHouse, intermediary);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getTempCountDelivery: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ce.ID, ce.name, ce.nature,ce.title, ce.Note, ce.Total as Totalprice,ce.author,ce.numContract, ce.date,w.name as nameReceiving,ce.id_WareHouse, COUNT(ce.ID) OVER() AS total  from CoutTempDelivery ce
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
};

export default tempCountDelivery;
