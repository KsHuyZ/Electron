import { Moment } from "moment";
import {
  runQuery,
  runQueryGetData,
  runQueryGetAllData,
  runQueryReturnID,
} from "../../utils";
import { DataType } from "../../types";

const countCoupon = {
  createCountCoupon: async (
    id_Source: number | string,
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
      "INSERT INTO CoutCoupon(id_Source, name, title, nature, Note,Total,date, author, numContract) VALUES (?,?,?,?,?,?, ?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
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
    const selectQuery = `select cu.ID, cu.name, cu.nature,cu.id_Source, cu.Note, cu.Total as Totalprice, cu.date,s.name as nameSource,cu.title, cu.author, cu.numContract,cu.status, COUNT(cu.ID) OVER() AS total  from CoutCoupon cu
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
    const selectQuery = `select wi.ID as IDWarehouseItem,i.ID as IDIntermediary,i.quality,i.prev_idwarehouse,i.status,wi.name, ci.quantity,CASE WHEN i.prev_idwarehouse IS NULL THEN i.id_WareHouse ELSE i.prev_idwarehouse END AS IDWarehouse, w.name as nameWareHouse,wi.quantity_plane,wi.date_expried, wi.price, wi.unit from Coupon_Item ci
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
    title: string,
    author: string,
    numContract: number | string
  ) => {
    const updateQuery = `UPDATE CoutCoupon SET id_Source = ?, name = ?, nature = ?, Total = ?, date = ?, title = ?, author = ?, numContract = ? where id = ?`;
    const isSuccess = await runQuery(updateQuery, [
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
    return isSuccess;
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
    status: number
  ) => {
    const updateQueryI = `UPDATE Intermediary SET status = ${
      status === 5 || status === 2 ? 2 : 3
    }, quantity = ? WHERE ID = ?`;
    const updateQueryW = `UPDATE warehouseItem SET name = ?, price = ?, date_expried = ?, quantity_plane = ?,id_Source = ? WHERE ID = ?`;
    const isSuccess = await runQuery(updateQueryI, [quantity, id]);
    const updateW = await runQuery(updateQueryW, [
      name,
      price,
      dateExpried,
      quantityPlane,
      idSource,
      IDWarehouseItem,
    ]);

    return isSuccess && updateW;
  },
  backtoTempImport: async (item: DataType) => {
    console.log(item);
    const updateQuery = `UPDATE Intermediary SET status = ${
      item.status === 2 ? 5 : 1
    } WHERE ID = ?`;
    const isSuccess = await runQuery(updateQuery, [item.IDIntermediary]);
    return isSuccess;
  },
  deleteCouponItem: async (id: number | string) => {
    const deleteQuery = `DELETE FROM Coupon_Item WHERE id_intermediary = ?`;
    console.log(id);
    const isSuccess = await runQuery(deleteQuery, [id]);
    return isSuccess;
  },
  editCountCoupon: async (
    removeItemList: DataType[],
    newItemList: DataType[],
    items: DataType[],
    ID: number,
    idSource: number,
    name: string,
    nature: string,
    total: number,
    date: string,
    title: string,
    author: string,
    numContract: string | number
  ) => {
    removeItemList.forEach(async (item) => {
      await countCoupon.backtoTempImport(item);
      await countCoupon.deleteCouponItem(item.IDIntermediary);
    });

    items.forEach(async (item) => {
      await countCoupon.updateCouponItem(item.quantity, item.IDIntermediary);
      await countCoupon.importWarehouseEdit(
        item.IDIntermediary,
        item.IDWarehouseItem,
        item.name,
        item.price,
        item.date_expried,
        item.quantity_plane,
        item.quantity,
        idSource,
        item.status
      );
    });
    newItemList.forEach(async (item) => {
      await countCoupon.createCouponItem(
        ID,
        item.IDIntermediary,
        item.quantity,
        item.quality,
        item["IDWarehouse"]
          ? item["IDWarehouse"]
          : item["prev_idwarehouse"]
          ? item["prev_idwarehouse"]
          : item["id_WareHouse"]
      );
    });

    await countCoupon.updateCountCoupon(
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
  },
  approveAccept: async (id: number | string) => {
    const updateQuery = `UPDATE CoutCoupon SET status = 1 where id = ?`;
    const isSuccess = await runQuery(updateQuery, [id]);
    return isSuccess;
  },
};

export default countCoupon;
