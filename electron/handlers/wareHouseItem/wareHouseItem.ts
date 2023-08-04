import {
  BrowserWindow,
  IpcMainEvent,
  WebContentsPrintOptions,
  ipcMain,
} from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { DataType, Intermediary, WarehouseItem } from "../../types";
import { startPrint } from "../../module/print";
import { formExportBill } from "../../utils/formExportBill";
import { formImportBill } from "../../utils/formImportBill";
import formReport from "../../utils/formReport";
import moment, { Moment } from "moment";
import printPreview from "../../module/print/printPreview";
import countCouponDB from "../../database/countCoupon/countCoupon";
import { print } from "pdf-to-printer";
const { editCountCoupon } = countCouponDB;
const { editCountDelivery } = countDelivery;
import fs from "fs";
import countDelivery from "../../database/countDelivery/countDelivery";

let currentName = "";
let currentNote = "";
let currentNature = "";
let currentTotal = 0;
let currentDate: any = moment.now();
let currentItems = [];
let isForm = "";
let currentTitle = "";
let currentNewItem = [];
let currentRemoveItem = [];
let currentEditItem = [];
let currentID;
let currentIDSource;
let currentReceivingID;

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItembyWareHouseId,
    deleteWareHouseItem,
    updateWareHouseItem,
    deleteWareHouseItemInWarehouse,
    changeWareHouse,
    getAllWarehouseItem,
    tempExportWareHouse,
    exportWarehouse,
    importWarehouse,
    getAllWarehouseItembyReceivingId,
    createWareHouseItemMultiple,
    getAllWarehouseItemandWHName,
  } = wareHouseItemDB;
  //  listen create warehouse item request
  ipcMain.handle(
    "create-product-item",
    async (event: IpcMainEvent, data: string) => {
      const newData = JSON.parse(data);
      const isCreated = await createWareHouseItem(newData);
      return isCreated;
    }
  );

  ipcMain.handle(
    "create-multiple-product-item",
    async (
      event: IpcMainEvent,
      data: string,
      idSource: number,
      paramsOther: {
        id_wareHouse: number;
        status: string;
        date: string;
        date_created_at: string;
        date_updated_at: string;
      }
    ) => {
      const newData = JSON.parse(data);
      const isCreated = await createWareHouseItemMultiple(
        newData,
        idSource,
        paramsOther
      );
      return isCreated;
    }
  );

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
    "update-warehouseitem",
    async (event, data: WarehouseItem & Intermediary) => {
      const newWareHouse = await updateWareHouseItem(data);
      return newWareHouse;
    }
  );

  // listen delete event
  ipcMain.handle(
    "delete-warehouseitem",
    async (event, id: number, id_wareHouse: number) => {
      const isSuccess = await deleteWareHouseItem(id, id_wareHouse);
      return isSuccess;
    }
  );
  //Change warehouse
  ipcMain.handle(
    "change-warehouse",
    async (event, id_newWareHouse: number, id_list: Intermediary[]) => {
      const isSuccess = await changeWareHouse(id_newWareHouse, id_list);
      return isSuccess;
    }
  );

  ipcMain.handle(
    "print-form-export",
    async (
      event,
      data: {
        items: DataType[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
      }
    ) => {
      const { items, name, note, nature, total, date, title } = data;
      startPrint(
        {
          htmlString: await formExportBill(data),
        },
        undefined
      );
      currentName = name;
      currentNote = note;
      currentTotal = total;
      currentNature = nature;
      currentDate = date;
      currentItems = items;
      currentTitle = title;
      isForm = "export";
      return null;
    }
  );
  ipcMain.handle(
    "print-form-import",
    async (
      event,
      data: {
        items: DataType[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        idSource: string | number;
      }
    ) => {
      const { items, name, note, nature, total, date, title, idSource } = data;
      startPrint(
        {
          htmlString: await formImportBill(data),
        },
        undefined
      );
      currentName = name;
      currentNote = note;
      currentTotal = total;
      currentNature = nature;
      currentDate = date;
      currentItems = items;
      isForm = "import";
      currentTitle = title;
      currentIDSource = idSource;
      return true;
    }
  );

  ipcMain.handle(
    "temp-export-warehouse",
    async (event, id_receiving: number, id_list: Intermediary[]) => {
      const isSuccess = await tempExportWareHouse(id_receiving, id_list);
      return isSuccess;
    }
  );

  ipcMain.handle(
    "print-import-edit",
    async (
      event,
      data: {
        ID: number;
        itemEditList: DataType[];
        newItemList: DataType[];
        removeItemList: DataType[];
        items: DataType[];
        name: string;
        note: string;
        nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        idSource: number;
      }
    ) => {
      const {
        ID,
        itemEditList,
        newItemList,
        removeItemList,
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        idSource,
      } = data;
      startPrint(
        {
          htmlString: await formImportBill(data),
        },
        undefined
      );
      currentName = name;
      currentEditItem = itemEditList;
      currentNewItem = newItemList;
      currentDate = date;
      currentItems = items;
      currentNature = nature;
      currentNote = note;
      currentRemoveItem = removeItemList;
      currentTitle = title;
      currentTotal = total;
      currentID = ID;
      currentIDSource = idSource;
      isForm = "edit-import";
    }
  );
  ipcMain.handle(
    "print-export-edit",
    async (
      event,
      data: {
        ID: number;
        itemEditList: DataType[];
        newItemList: DataType[];
        removeItemList: DataType[];
        items: DataType[];
        name: string;
        note: string;
        Nature: string;
        total: number;
        date: any;
        title: string;
        nameSource: string;
        id_WareHouse: number;
      }
    ) => {
      const {
        ID,
        itemEditList,
        newItemList,
        removeItemList,
        items,
        name,
        note,
        Nature,
        total,
        date,
        title,
        id_WareHouse,
        nameSource,
      } = data;
      startPrint(
        {
          htmlString: await formExportBill({ ...data, nature: Nature }),
        },
        undefined
      );
      console.log("du lieu ahihi");
      console.log(data);
      currentName = name;
      currentEditItem = itemEditList;
      currentNewItem = newItemList;
      currentDate = date;
      currentItems = items;
      currentNature = Nature;
      currentNote = note;
      currentRemoveItem = removeItemList;
      currentTitle = title;
      currentTotal = total;
      currentID = ID;
      currentReceivingID = id_WareHouse; // undefined
      isForm = "edit-export";
    }
  );

  ipcMain.handle("print", async (event, options: WebContentsPrintOptions) => {
    const url = await printPreview.saveFilePdf();
    await print(url, options)
      .then(async () => {
        if (isForm === "export") {
          const isSuccess = await exportWarehouse(
            currentItems,
            currentName,
            currentNote,
            currentNature,
            currentTotal,
            currentTitle,
            currentDate
          );
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("export-warehouse", { isSuccess });
          }
        } else if (isForm === "import") {
          const isSuccess = await importWarehouse(
            currentItems,
            currentName,
            currentNote,
            currentNature,
            currentTotal,
            currentTitle,
            currentDate,
            currentIDSource
          );
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (isSuccess && mainWindow) {
            mainWindow.webContents.send("import-warehouse", { isSuccess });
          }
        } else if (isForm === "edit-import") {
          await editCountCoupon(
            currentEditItem,
            currentNewItem,
            currentRemoveItem,
            currentID,
            currentIDSource,
            currentName,
            currentNature,
            currentTotal,
            currentDate,
            currentTitle
          );
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("edit-import-success");
          }
        } else if (isForm === "edit-export") {
          editCountDelivery(
            currentEditItem,
            currentNewItem,
            currentRemoveItem,
            currentID,
            currentReceivingID,
            currentName,
            currentNature,
            currentTotal,
            currentDate,
            currentTitle
          );
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("edit-export-success");
          }
        }
      })
      .catch((error) => console.log(error));
    fs.unlinkSync(url);
  });

  ipcMain.on("export-report-warehouseitem", async (event, id: number) => {
    const items: any = await getAllWarehouseItemandWHName(id);
    startPrint(
      {
        htmlString: formReport({ items, warehouse: items[0].warehouseName }),
      },
      undefined
    );
  });
};

export default wareHouseItem;
