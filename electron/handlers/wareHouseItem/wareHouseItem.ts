import {
  BrowserWindow,
  IpcMainEvent,
  WebContentsPrintOptions,
  ipcMain,
  dialog,
} from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import {
  DataType,
  Intermediary,
  WarehouseItem,
  InfoParamsType,
  IDateRangerItem,
} from "../../types";
import {
  formInventoryRecords,
  formReport,
  formReportInventory,
} from "../../utils/formFileExcel";
import printPreview from "../../module/print/printPreview";
import countCouponDB from "../../database/countCoupon/countCoupon";
import { print } from "pdf-to-printer";
import tempCountCouponDB from "../../database/tempCountCoupon/tempCountCoupon";

const { editCountCoupon } = countCouponDB;
const { editCountDelivery } = countDelivery;
const { createMutipleWarehouseItem, createTempCountCoupon } = tempCountCouponDB;
const { tempExportWarehouse } = tempCountDelivery;

import fs from "fs";
import countDelivery from "../../database/countDelivery/countDelivery";
import { formFileExcel } from "../../utils/formFileExcel";
import tempCountDelivery from "../../database/tempCountDelivery";
import { handleTransaction } from "../../utils";
import WareHouseDB from "../../database/WareHouse-Receiving/wareHouse-Receiving";
import historyItem from "../../database/historyItem/historyItem";

const {
  getTotalHistoryItemBefore,
  getTotalExportItem,
  getTotalImportItem,
  getInventoryRecords,
  getWarehouseItemIsAprove,
  getWarehouseItemFinal,
  getWarehouseItemExportInTime,
} = historyItem;
let isForm = "";

const wareHouseItem = (mainScreen: BrowserWindow) => {
  const {
    getAllWarehouseItembyWareHouseId,
    changeWareHouse,
    getAllWarehouseItem,
    exportWarehouse,
    importWarehouse,
    getAllWarehouseItembyReceivingId,
    getAllWarehouseItemandWHName,
    getWarehouseItemByName,
    getAllWareHouseByDateCreated,
  } = wareHouseItemDB;

  const { getAllWareHouseNoPagination } = WareHouseDB;

  // listen get all warehouse item request

  ipcMain.handle(
    "warehouseitem-request-read",
    async (
      event,
      data: {
        pageSize: number;
        currentPage: number;
        idWareHouse?: number;
        idRecipient?: number;
        paramsSearch?: any;
      } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage, paramsSearch, idRecipient, idWareHouse } =
        data;
      if (idWareHouse) {
        return await getAllWarehouseItembyWareHouseId(
          idWareHouse,
          pageSize,
          currentPage,
          paramsSearch
        );
      }
      return await getAllWarehouseItembyReceivingId(
        idRecipient,
        pageSize,
        currentPage,
        paramsSearch
      );
    }
  );

  ipcMain.handle("get-all-warehouse-item", async (event, data) => {
    const { pageSize, currentPage, paramsSearch } = data;

    const response = await getAllWarehouseItem(
      pageSize,
      currentPage,
      paramsSearch
    );
    return response;
  });

  ipcMain.handle(
    "change-warehouse",
    async (event, id_newWareHouse: number, id_list: Intermediary[]) => {
      const result = handleTransaction(
        async () => await changeWareHouse(id_newWareHouse, id_list)
      );
      return result;
    }
  );

  //  listen create warehouse item request
  ipcMain.handle(
    "create-product-item",
    async (event: IpcMainEvent, data: any) => {
      const {
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        author,
        id_Source,
        numContract,
        idWareHouse,
      } = data;
      try {
        const ID = await createTempCountCoupon(
          name,
          id_Source,
          idWareHouse,
          nature,
          note,
          total,
          date,
          title,
          author,
          numContract
        );
        await createMutipleWarehouseItem(
          ID,
          items,
          id_Source,
          idWareHouse,
          date
        );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  );

  ipcMain.handle(
    "print-form-export",
    async (
      event,
      data: {
        ID: number;
        items: Intermediary[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        author: string;
        numContract: number | string;
        id_WareHouse: number;
      }
    ) => {
      const {
        ID,
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        author,
        numContract,
        id_WareHouse,
      } = data;
      const result = await handleTransaction(
        async () =>
          await exportWarehouse(
            ID,
            items,
            id_WareHouse,
            name,
            note,
            nature,
            total,
            title,
            date,
            author,
            numContract
          )
      );
      return result;
    }
  );
  ipcMain.handle(
    "print-form-import",
    async (
      event,
      data: {
        ID: number;
        items: Intermediary[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        idSource: string | number;
        author: string;
        numContract: number;
        idWareHouse: number;
      }
    ) => {
      const {
        ID,
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        idSource,
        author,
        numContract,
        idWareHouse,
      } = data;

      const isSuccess = await handleTransaction(
        async () =>
          await importWarehouse(
            items,
            name,
            note,
            nature,
            total,
            title,
            date,
            idSource,
            author,
            numContract,
            ID,
            idWareHouse
          )
      );
      return isSuccess;
    }
  );

  ipcMain.handle(
    "temp-export-warehouse",
    async (
      event,
      data: {
        name: string;
        items: Intermediary[];
        note: string;
        nature: string;
        date: any;
        total: number;
        nameSource: string;
        title: string;
        author: string;
        numContract: number;
        idReceiving: number;
      }
    ) => {
      const {
        name,
        note,
        total,
        nature,
        date,
        items,
        title,
        author,
        numContract,
        idReceiving,
      } = data;

      const result = handleTransaction(
        async () =>
          await tempExportWarehouse(
            items,
            idReceiving,
            name,
            note,
            nature,
            total,
            title,
            date,
            author,
            numContract
          )
      );
      return result;
    }
  );

  ipcMain.handle(
    "import-edit",
    async (
      event,
      data: {
        ID: number;
        removeItemList: DataType[];
        newItemList: DataType[];
        items: (WarehouseItem & Intermediary)[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        idSource: number;
        author: string;
        numContract: number;
        idWareHouse: number;
      }
    ) => {
      const {
        ID,
        removeItemList,
        newItemList,
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        idSource,
        author,
        numContract,
        idWareHouse,
      } = data;
      try {
        const isSuccess = await editCountCoupon(
          removeItemList,
          newItemList,
          items,
          ID,
          idSource,
          name,
          nature,
          total,
          date,
          title,
          author,
          numContract,
          note,
          idWareHouse
        );
        return isSuccess;
      } catch (error) {
        console.log(error);
        return false;
      }

      // startPrint(
      //   {
      //     htmlString: await formImportBill(data),
      //   },
      //   undefined
      // );
    }
  );

  ipcMain.handle(
    "export-edit",
    async (
      event,
      data: {
        ID: number;
        removeItemList: DataType[];
        items: Intermediary[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        author: string;
        numContract: number | string;
        id_WareHouse: number;
      }
    ) => {
      const {
        ID,
        removeItemList,
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        id_WareHouse,
        author,
        numContract,
      } = data;
      const result = await handleTransaction(
        async () =>
          await editCountDelivery(
            removeItemList,
            items,
            ID,
            id_WareHouse,
            name,
            nature,
            total,
            date,
            title,
            author,
            numContract
          )
      );
      return result;
    }
  );

  ipcMain.handle("print", async (event, options: WebContentsPrintOptions) => {
    const url = await printPreview.saveFilePdf();
    await print(url, options)
      .then(async () => {
        console.log("Print success!");
      })
      .catch((error) => console.log(error));
    fs.unlinkSync(url);
  });

  ipcMain.handle("export-report-warehouseitem", async (event, payload: any) => {
    const { nameWareHouse, data, filePath } = payload;
    const items: any = await getAllWarehouseItemandWHName(data);

    const infoParams: InfoParamsType = {
      nameForm: "BÁO CÁO SỐ LƯỢNG HÀNG TỒN",
      isForm: false,
      nameWareHouse: `Danh sách hàng tồn Kho ${nameWareHouse}`,
    };

    try {
      formFileExcel(infoParams, items, filePath);
      return { status: "success" };
    } catch (error) {
      return { status: "error" };
    }
  });

  ipcMain.handle("export-report-new-item", async (event, payload: any) => {
    const { date, idWareHouse, filePath } = payload;
    const items: any = await getAllWareHouseByDateCreated(idWareHouse, date);

    const infoParams: InfoParamsType = {
      nameForm: "BÁO CÁO MẶT HÀNG MỚI",
      isForm: false,
      nameWareHouse: "Danh sách mặt hàng mới",
    };

    try {
      formFileExcel(infoParams, items, filePath);

      return { status: "success" };
    } catch (error) {
      return { status: "error" };
    }
  });

  ipcMain.handle("export-request-xlsx", async (event, payload: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: `[${payload}]-${new Date().getFullYear()}.xlsx`,
      filters: [
        { name: "Excel Files", extensions: ["xlsx"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    return result;
  });

  ipcMain.handle("get-warehouse-by-name", async (event, name: string) => {
    return await getWarehouseItemByName(name);
  });
  ipcMain.handle(
    "export-report-import-export",
    async (
      event,
      {
        filePath,
        startTime,
        endTime,
      }: { filePath: string; startTime: string; endTime: string }
    ) => {
      const warehouses: any = await getAllWareHouseNoPagination();

      const promise = warehouses.rows.map(async (warehouse, i) => {
        const start = await getTotalHistoryItemBefore(warehouse.ID, startTime);
        const imports = await getTotalImportItem(
          warehouse.ID,
          startTime,
          endTime
        );
        const exports = await getTotalExportItem(
          warehouse.ID,
          startTime,
          endTime
        );
        const end = await getTotalHistoryItemBefore(warehouse.ID, endTime);
        return {
          index: ++i,
          name: warehouse.name,
          start,
          imports,
          exports,
          end,
        };
      });
      try {
        const result = await Promise.all(promise);
        formReport(result, filePath, startTime, endTime);
        return { status: "success" };
      } catch (error) {
        return { status: "error" };
      }
    }
  );
  ipcMain.handle(
    "get-inventory-records",
    async (
      event,
      {
        nameWareHouse,
        ID,
        startTime,
        endTime,
        filePath,
      }: {
        nameWareHouse: string;
        startTime: string;
        endTime: string;
        ID: string;
        filePath: string;
      }
    ) => {
      const items = await getInventoryRecords(ID, startTime, endTime);
      formInventoryRecords(items, startTime, endTime, nameWareHouse, filePath);
      return { status: "success" };
    }
  );
  ipcMain.handle(
    "form-remain-inventory",
    async (
      event,
      {
        ID,
        startTime,
        endTime,
        filePath,
      }: { ID: string; startTime: string; endTime: string; filePath: string }
    ) => {
      try {
        const warehouseitems: any = await getWarehouseItemIsAprove(
          ID,
          startTime
        );
        const promise = warehouseitems.map(async (item, index) => {
          const resultFinal: any = await getWarehouseItemFinal(
            item.ID,
            startTime,
            endTime
          );
          const resultExport: any = await getWarehouseItemExportInTime(
            item.ID,
            startTime,
            endTime
          );
          return {
            ...item,
            index: ++index,
            quantityExport: resultExport.quantityExport,
            quantityFinal: resultFinal,
          };
        });
        const items = await Promise.all(promise);
        formReportInventory(items, filePath, startTime, endTime);
        return { status: "success" };
      } catch (error) {
        return { status: "error" };
      }
    }
  );
};

export default wareHouseItem;
