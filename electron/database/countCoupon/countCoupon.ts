import { Moment } from "moment";
import {
  runQuery,
  runQueryGetData,
  runQueryGetAllData,
  runQueryReturnID,
} from "../../utils";
import { DataType } from "../../types";
import wareHouseItem from "../wareHouseItem/wareHouseItem";
const { updateWarehouseItemField } = wareHouseItem;
const countCoupon = {
  createCountCoupon: async (
    id_Source: number | string,
    name: string,
    title: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null
  ) => {
    const createQuery =
      "INSERT INTO CoutCoupon(id_Source, name, title, nature, Note,Total,date) VALUES (?,?,?,?,?,?, ?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
        name,
        title,
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
  countCouponRow: async () => {
    const query = "select Count(ID) from CoutCoupon";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createCouponItem: async (
    idCoutCoupon: number | unknown,
    idIntermediary: number | string,
    quantity: number,
    quality: number,
    idWareHouse: number
  ) => {
    const createQuery =
      "INSERT INTO Coupon_Item(id_Cout_Coupon, id_intermediary, quantity, quality, id_Warehouse) VALUES(?,?,?,?,?)";
    try {
      await runQuery(createQuery, [
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
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, COUNT(cu.ID) OVER() AS total  from CoutCoupon cu
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
    const selectQuery = `select wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,wi.name, ci.quantity,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.date_expried, wi.price, wi.unit from Coupon_Item ci
    join Intermediary i on i.ID = ci.id_intermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = IDWarehouse
    where ci.id_Cout_Coupon = ?`;
    const rows: any = await runQueryGetAllData(selectQuery, [id]);
    return rows;
  },
  updateCouponItem: async (quantity: number, id: string) => {
    const updateQuery = `UPDATE Coupon_Item SET quantity = ? WHERE id_intermediary = ?`;
    const isSuccess = await runQuery(updateQuery, [quantity, id]);
    return isSuccess;
  },
  updateCountCoupon: async (
    id: number,
    idSource: number,
    name: string,
    nature: string,
    Total: number,
    date: string,
    title: string
  ) => {
    const updateQuery = `UPDATE CoutCoupon SET id_Source = ?, name = ?, nature = ?, Total = ?, date = ?, title = ? where id = ?`;
    const isSuccess = await runQuery(updateQuery, [
      idSource,
      name,
      nature,
      Total,
      date,
      title,
      id,
    ]);
    return isSuccess;
  },
  importWarehouseEdit: async (
    id: number | string,
    IDWarehouseItem: number | string,
    name: string,
    price: number,
    dateExpried: string,
    quantityPlane: number,
    idCoutCoupon: number,
    quantity: number,
    quality: number,
    idWarehouse: number
  ) => {
    const updateQueryI = `UPDATE Intermediary SET status = 3, quantity = ? WHERE ID = ?`;
    const updateQueryW = `UPDATE warehouseItem SET name = ?, price = ?, date_expried = ?, quantity_plane = ? WHERE ID = ?`;
    const isSuccess = await runQuery(updateQueryI, [id]);
    const updateW = await runQuery(updateQueryW, [
      name,
      price,
      dateExpried,
      quantityPlane,
      IDWarehouseItem,
    ]);
    await countCoupon.createCouponItem(
      idCoutCoupon,
      id,
      quantity,
      quality,
      idWarehouse
    );
    return isSuccess && updateW;
  },

  backtoTempImport: async (item: DataType) => {
    const updateQuery = `UPDATE Intermediary SET status = ${
      item.status === 2 ? 5 : 1
    } WHERE ID = ?`;
    const isSuccess = await runQuery(updateQuery, [item.IDIntermediary]);
    return isSuccess;
  },
  deleteCouponItem: async (id: number | string) => {
    const deleteQuery = `DELETE FROM Coupon_Item WHERE id_intermediary = ?`;
    const isSuccess = await runQuery(deleteQuery, [id]);
    return isSuccess;
  },
  updateSourceItem: async (
    idSource: number | string,
    idWareHouseItem: number | string
  ) => {
    const updateQuery = `UPDATE WareHouseItem SET id_Source = ? WHERE ID = ?`;
    const isSuccess = await runQuery(updateQuery, [idSource, idWareHouseItem]);
    return isSuccess;
  },
  editCountCoupon: async (
    itemEditList: DataType[],
    newItemList: DataType[],
    removeItemList: DataType[],
    items: DataType[],
    ID: number,
    idSource: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string
  ) => {
    itemEditList.forEach(async (item) => {
      await countCoupon.updateCouponItem(item.quantity, item.IDIntermediary);
      await updateWarehouseItemField(
        item.name,
        item.price,
        item.date_expried,
        item.quantity_plane,
        item.quantity,
        item.IDWarehouseItem,
        item.IDIntermediary
      );
    });

    newItemList.forEach(async (item) => {
      await countCoupon.importWarehouseEdit(
        item.IDIntermediary,
        item.IDWarehouseItem,
        item.name,
        item.price,
        item.date_expried,
        item.quantity_plane,
        ID,
        item.quantity,
        item.quality,
        item["prev_idwarehouse"] ? item["prev_idwarehouse"] : item.id_WareHouse
      );
    });

    removeItemList.forEach(async (item) => {
      await countCoupon.backtoTempImport(item);
      await countCoupon.deleteCouponItem(item.IDIntermediary);
    });
    items.forEach(async (item) => {
      await countCoupon.updateSourceItem(idSource, item.IDWarehouseItem);
    });
    await countCoupon.updateCountCoupon(
      ID,
      idSource,
      name,
      nature,
      total,
      date,
      title
    );
  },
};

export default countCoupon;
