import {
  getTimeNow,
  historyItemType,
  runQuery,
  runQueryGetAllData,
  runQueryGetData,
} from "../../utils";
const { EXPORT, IMPORT, TRANSFER } = historyItemType;
const historyItem = {
  createHistoryItem: async (
    ID: string | number,
    quantity: number,
    quality: number,
    type: string,
    time?: string
  ) => {
    await runQuery(
      "INSERT INTO HistoryItem (IDIntermediary, quantity, quality, type, time) VALUES (?, ?, ?, ?,?)",
      [ID, quantity, quality, type, time ? time : getTimeNow()]
    );
  },
  updateLastedVersionIntermediary: async (
    ID: number | string,
    quantity: number
  ) => {
    await runQuery(
      "UPDATE HistoryItem SET quantity = ? WHERE IDIntermediary = ? ORDER BY ID DESC LIMIT 1",
      [quantity, ID]
    );
  },
  getTotalHistoryItemBefore: async (ID: number | string, time: string) => {
    const query = `SELECT DISTINCT hi.IDIntermediary ,SUM(i.quantity * wi.price) as total
    FROM HistoryItem hi
    join Intermediary i on i.ID = hi.IDIntermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = i.id_WareHouse
    WHERE w.ID = ? AND hi.time < ?
    `;
    const result: any = await runQueryGetData(query, [ID, time]);
    return result.total ? result.total : 0;
  },
  getTotalImportItem: async (
    ID: number | string,
    startTime: string,
    endTime: string
  ) => {
    const query = `SELECT DISTINCT hi.IDIntermediary ,SUM(hi.quantity * wi.price) as total
    FROM HistoryItem hi
    join Intermediary i on i.ID = hi.IDIntermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = i.id_WareHouse
    WHERE w.ID = ? AND hi.time >= ? AND hi.time <= ? AND hi.type = "${IMPORT}"`;
    const result: any = await runQueryGetData(query, [ID, startTime, endTime]);
    return result.total ? result.total : 0;
  },
  getTotalExportItem: async (
    ID: number | string,
    startTime: string,
    endTime: string
  ) => {
    const query = `SELECT DISTINCT hi.IDIntermediary ,SUM(hi.quantity * wi.price) as total
    FROM HistoryItem hi
    join Intermediary i on i.ID = hi.IDIntermediary
    join WareHouseItem wi on wi.ID = i.id_WareHouseItem
    join WareHouse w on w.ID = i.id_WareHouse
    WHERE w.ID = ? AND hi.time >= ? AND hi.time <= ? AND hi.type = "${EXPORT}"`;
    const result: any = await runQueryGetData(query, [ID, startTime, endTime]);
    return result.total ? result.total : 0;
  },

  getInventoryRecords: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `SELECT ROW_NUMBER() OVER (ORDER BY wi.name) AS i,wi.name, wi.unit, wi.date_expried,wi.price, hi.quantity, hi.IDIntermediary,i.quality, MAX(hi.ID)
    FROM HistoryItem hi
    JOIN Intermediary i on i.ID = hi.IDIntermediary
    JOIN WareHouseItem wi on wi.ID = i.id_WareHouseItem
    JOIN WareHouse w on w.ID = i.id_WareHouse
    JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon 
    WHERE w.ID = 1 AND hi.time >= "${startTime}" AND hi.time <= "${endTime}" AND cc.status = 1 
    GROUP BY hi.IDIntermediary
    HAVING hi.quantity > 0
    `;
    const result: any = await runQueryGetAllData(selectQuery, []);
    return result;
  },
  getInventoryInTimeWH: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `SELECT hi.quantity,
    w.name,
    w.origin,
    w.date_expried,
    w.price
FROM WareHouseItem w
    JOIN
    Intermediary i ON i.id_WareHouseItem = w.ID
    JOIN
    HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN
    Coupon_Item ci ON ci.id_intermediary = i.ID
    JOIN
    CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon
WHERE hi.time > "?" AND 
    hi.time < "?" AND 
    i.id_WareHouse = ?
GROUP BY hi.IDIntermediary
HAVING hi.quantity > 0
`;
    const rows = await runQueryGetAllData(selectQuery, [
      startTime,
      endTime,
      ID,
    ]);
    return rows;
  },
  getWarehouseItemIsAprove: async (ID: string, endTime: string) => {
    const selectQuery = `SELECT hi.quantity,i.ID as IDIntermediary, max(hi.ID), wi.ID, wi.name, wi.price, wi.unit, wi.date_expried, wi.origin FROM WareHouseItem wi
    JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
    JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon 
    WHERE hi.time <= "${endTime}" AND i.id_WareHouse = ${ID} AND hi.type = "IMPORT"
    GROUP BY hi.IDIntermediary
    HAVING hi.quantity > 0`;
    const result = await runQueryGetAllData(selectQuery, []);
    return result;
  },
  getWarehouseItemExportInTime: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `select hi.quantity as quantityExport, max(hi.ID) from WareHouseItem wi
    JOIN Intermediary i on i.id_WareHouseItem = wi.ID
    JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN Delivery_Item di ON di.id_intermediary = i.ID
    JOIN CoutDelivery cd ON cd.ID = di.id_Cout_Delivery
    where hi.time <= "${endTime}" AND cd.date <= "${endTime}" AND wi.ID = ? AND cd.status = 0`;
    const result: any = await runQueryGetData(selectQuery, [ID]);
    return result.quantityExport;
  },
  getWarehouseItemImportIntime: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `select ci.quantity as quantityImport from WareHouseItem wi
    JOIN Intermediary i on i.id_WareHouseItem = wi.ID
    JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon
    WHERE  cc.date >= "${startTime}" AND cc.date <= "${endTime}" AND wi.ID = ? AND cc.status = 0`;
    const result: any = await runQueryGetData(selectQuery, [ID]);
    return result ? result.quantityImport : null;
  },
  getWarehouseItemFinal: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `select hi.quantity as quantityFinal, hi.type from WareHouseItem wi
    JOIN Intermediary i on i.id_WareHouseItem = wi.ID
    JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon
    where hi.time < "${endTime}" AND cc.date < "${endTime}" AND cc.status = 1 AND hi.type = "IMPORT" AND wi.ID = ${ID}
    GROUP BY hi.IDIntermediary`;

    const finalResult: any = await runQueryGetData(selectQuery, []);
    return finalResult ? finalResult.quantityFinal : null;
  },
  getLastItemType: async (ID: string | number) => {
    const selectQuery = `select type from HistoryItem
    WHERE IDIntermediary = ?
    ORDER BY ID DESC LIMIT 1`;
    const result: any = await runQueryGetData(selectQuery, [ID]);
    return result.type;
  },
};

export default historyItem;
