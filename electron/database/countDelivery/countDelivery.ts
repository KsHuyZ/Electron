import { Moment } from "moment";
import {
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
  runQueryReturnID,
} from "../../utils";

const countDelivery = {
  createCountDelivery: async (
    idWarehouse: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    title: string,
    date: Moment | null
  ) => {
    const createQuery =
      "INSERT INTO CoutDelivery(id_WareHouse, name, Nature, Note,Total,title,date) VALUES (?,?,?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        idWarehouse,
        name,
        nature,
        note,
        total,
        title,
        date,
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
    idIntermediary: number
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
    const selectQuery = `select ce.ID, ce.name, ce.Nature, ce.Note, ce.Total as Totalprice, ce.date,w.name as nameReceiving, COUNT(ce.ID) OVER() AS total  from CoutDelivery ce
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
};

export default countDelivery;
