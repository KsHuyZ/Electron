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
    date: Moment | null
  ) => {
    const createQuery =
      "INSERT INTO CoutDelivery(id_WareHouse, name, Nature, Note,Total,date) VALUES (?,?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        idWarehouse,
        name,
        nature,
        note,
        total,
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
    name: number,
    quantity: number,
    price: number,
    quality: number,
    idWarehouse: number
  ) => {
    const createQuery =
      "INSERT INTO Delivery_Item(id_Cout_Delivery,name, quantity, quality, price, id_Warehouse) VALUES(?,?,?,?,?,?)";
    try {
      await runQuery(createQuery, [
        idCoutDelivery,
        name,
        quantity,
        quality,
        price,
        idWarehouse,
      ]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getCountDelivery: async (pageSize: number, currentPage: number) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select ce.ID, ce.name, ce.Nature, ce.Note, ce.Total, ce.date,w.name as nameReceiving, COUNT(ce.ID) OVER() AS total  from CoutDelivery ce
    JOIN warehouse w on w.ID = ce.id_WareHouse
    ORDER BY ce.ID DESC LIMIT ? OFFSET ?`;
    const rows: any = runQueryGetAllData(selectQuery, [pageSize, offsetValue]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
  getDeliveryItem: async (
    id: number,
    pageSize: number,
    currentPage: number
  ) => {
    const offsetValue = (currentPage - 1) * pageSize;
    const selectQuery = `select di.ID, di.name, di.quality, di.quantity, di.price, w.name as nameWarehouse,  COUNT(di.ID) OVER() AS total from Delivery_Item di
    join warehouse w on w.ID = di.id_Warehouse
    where id_Cout_Delivery = ?
    ORDER BY di.ID DESC
    LIMIT ? OFFSET ?`;
    const rows: any = runQueryGetAllData(selectQuery, [
      id,
      pageSize,
      offsetValue,
    ]);
    const countResult = rows.length > 0 ? rows[0].total : 0;
    return { rows, total: countResult };
  },
};

export default countDelivery;
