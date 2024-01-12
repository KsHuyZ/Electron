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
    const query = `SELECT SUM (totalRow) as total FROM (
      SELECT sub.totalRow FROM (
      SELECT (hi.quantity * wi.price) AS totalRow, hi.IDIntermediary FROM HistoryItem hi
      JOIN Intermediary i ON hi.IDIntermediary = i.ID
      JOIN WareHouseItem wi ON  wi.ID = i.id_WareHouseItem 
      WHERE i.id_WareHouse = ? AND (hi.type = "IMPORT" OR hi.type = "TRANSFER") AND hi.time <= ?
      ORDER BY hi.ID DESC
      ) as sub
      GROUP BY sub.IDIntermediary
      )`;
    const result: any = await runQueryGetData(query, [ID, time]);
    const response = result?.total ? result.total : 0;
    return response;
  },
  getTotalImportItem: async (
    ID: number | string,
    startTime: string,
    endTime: string
  ) => {
    const querySelectTemp = `SELECT SUM(ci.quantity * wi.price) as total FROM CoutTempCoupon cc
JOIN Coupon_Temp_Item ci ON ci.id_Temp_Cout_Coupon = cc.ID
JOIN Intermediary i ON ci.id_intermediary = i.ID
JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
WHERE cc.idWareHouse = ? AND cc.date >= ? AND cc.date <= ? AND cc.status = 0`;
    const resultTemp: any = await runQueryGetData(querySelectTemp, [
      ID,
      startTime,
      endTime,
    ]);
    const totalTemp = resultTemp.total ? resultTemp.total : 0;
    const querySelect = `SELECT SUM(ci.quantity * wi.price) as total FROM CoutCoupon cc
JOIN Coupon_Item ci ON ci.id_Cout_Coupon = cc.ID
JOIN Intermediary i ON ci.id_intermediary = i.ID
JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
WHERE cc.idWareHouse = ? AND cc.date >= ? AND cc.date <= ?`;
    const result: any = await runQueryGetData(querySelect, [
      ID,
      startTime,
      endTime,
    ]);
    const totalOffice = result.total ? result.total : 0;
    return totalTemp + totalOffice;
  },
  getTotalExportItem: async (
    ID: number | string,
    startTime: string,
    endTime: string
  ) => {
    const querySelectTemp = `SELECT SUM(ci.quantity * wi.price) as total FROM CoutTempDelivery cc
    JOIN Delivery_Temp_Item ci ON ci.id_Temp_Cout_Delivery = cc.ID
    JOIN Intermediary i ON ci.id_intermediary = i.ID
    JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
    WHERE i.prev_idwarehouse = ? AND cc.date >= ? AND cc.date <= ? AND cc.status = 0`;
    const resultTemp: any = await runQueryGetData(querySelectTemp, [
      ID,
      startTime,
      endTime,
    ]);
    const totalTemp = resultTemp.total ? resultTemp.total : 0;
    const querySelect = `SELECT SUM(ci.quantity * wi.price) as total FROM CoutDelivery cc
    JOIN Delivery_Item ci ON ci.id_Cout_Delivery = cc.ID
    JOIN Intermediary i ON ci.id_intermediary = i.ID
    JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
    WHERE i.prev_idwarehouse = ? AND cc.date >= ? AND cc.date <= ?`;
    const result: any = await runQueryGetData(querySelect, [
      ID,
      startTime,
      endTime,
    ]);
    const totalOffice = result.total ? result.total : 0;
    return totalTemp + totalOffice;
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
    WHERE w.ID = ${ID} AND hi.time >= "${startTime}" AND hi.time <= "${endTime}" AND cc.status = 1 
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
    // const selectQuery = `SELECT hi.quantity,i.ID as IDIntermediary, max(hi.ID), wi.ID, wi.name, wi.price, wi.unit, wi.date_expried, wi.origin FROM WareHouseItem wi
    // JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
    // JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    // JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    // JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon
    // WHERE hi.time <= "${endTime}" AND i.id_WareHouse = ${ID} AND hi.type = "IMPORT" AND cc.dateApproved <= "${endTime}"
    // GROUP BY hi.IDIntermediary
    // HAVING hi.quantity > 0`;
    const selectQuery = `SELECT hi.quantity,max(hi.ID), i.ID as IDIntermediary, wi.ID, wi.name, wi.price, wi.unit, wi.date_expried, wi.origin FROM Intermediary i
    JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
    WHERE id_WareHouseItem IN (SELECT wi.ID FROM WareHouseItem wi
    JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
    WHERE i.ID IN (
    SELECT i.ID FROM WareHouseItem wi
        JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
        JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
        JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
        JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon 
        GROUP BY hi.IDIntermediary
        HAVING (cc.dateApproved IS NULL OR cc.dateApproved <= "${endTime}"))) AND hi.time <= "${endTime}" AND id_WareHouse = ${ID} AND hi.quantity > 0 AND (hi.type = "IMPORT" OR hi.type = "TRANSFER")
    GROUP BY hi.IDIntermediary`;
    const result = await runQueryGetAllData(selectQuery, []);
    return result;
  },
  getWarehouseItemExportInTime: async (
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    const selectQuery = `select di.quantity as quantityExport from WareHouseItem wi
    JOIN Intermediary i on i.id_WareHouseItem = wi.ID
    JOIN Delivery_Item di ON di.id_intermediary = i.ID
    JOIN CoutDelivery cd ON cd.ID = di.id_Cout_Delivery
    WHERE cd.date <= "${endTime}" AND wi.ID = ? AND (cd.dateApproved IS NULL OR cd.dateApproved < "${startTime}")`;
    const result: any = await runQueryGetData(selectQuery, [ID]);
    return result?.quantityExport ? result.quantityExport : null;
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
    WHERE  cc.date <= "${endTime}" AND wi.ID = ? AND (cc.dateApproved IS NULL OR cc.dateApproved < "${startTime}")`;
    const result: any = await runQueryGetData(selectQuery, [ID]);
    return result ? result.quantityImport : null;
  },
  getWarehouseItemFinal: async (
    type: string,
    warehouseID: number | string,
    ID: string,
    startTime: string,
    endTime: string
  ) => {
    // const selectQuery = `select hi.quantity as quantityFinal, hi.type from WareHouseItem wi
    // JOIN Intermediary i on i.id_WareHouseItem = wi.ID
    // JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    // JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
    // JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon
    // where hi.time <= "${endTime}" AND cc.date <= "${endTime}" AND cc.status = 1 AND hi.type = "IMPORT" AND wi.ID = ${ID}
    // GROUP BY hi.IDIntermediary`;
    const selectQuery = `SELECT hi.quantity as quantityFinal, max(hi.ID) FROM Intermediary i
    JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
    JOIN WareHouseItem wi ON wi.ID = i.id_WareHouseItem
    WHERE id_WareHouseItem IN (SELECT wi.ID FROM WareHouseItem wi
    JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
    WHERE i.ID IN (
    SELECT i.ID FROM WareHouseItem wi
        JOIN Intermediary i ON i.id_WareHouseItem = wi.ID
        JOIN HistoryItem hi ON hi.IDIntermediary = i.ID
        JOIN Coupon_Item ci ON ci.id_intermediary = i.ID
        JOIN CoutCoupon cc ON cc.ID = ci.id_Cout_Coupon 
        GROUP BY hi.IDIntermediary
        HAVING cc.dateApproved <= "${startTime}")) AND hi.time <= ${
      type === "start" ? `"${startTime}"` : `"${endTime}"`
    } AND id_WareHouse = ${warehouseID} AND hi.quantity > 0 AND (hi.type = "IMPORT" OR hi.type = "TRANSFER") AND wi.ID = ${ID}
    GROUP BY hi.IDIntermediary
    `;
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
