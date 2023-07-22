import { BrowserWindow, IpcMainEvent, ipcMain } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { DataType, Intermediary, WarehouseItem } from "../../types";
import { startPrint } from "../../module/print";
import { formExportBill } from "../../utils/formExportBill";
import { formImportBill } from "../../utils/formImportBill";
import moment, { Moment } from "moment";
import printPreview from "../../module/print/printPreview";

let currentName = "";
let currentNote = "";
let currentNature = "";
let currentTotal = 0;
let currentDate = moment.now();
let currentItems = [];
let isForm = "";
let currentTitle = "";

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
      const { items, name, note, nature, total, date, title, nameSource } =
        data;
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
      }
    ) => {
      const { items, name, note, nature, total, date, title, nameSource } =
        data;
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
      return null;
    }
  );

  ipcMain.handle(
    "temp-export-warehouse",
    async (event, id_receiving: number, id_list: Intermediary[]) => {
      const isSuccess = await tempExportWareHouse(id_receiving, id_list);
      return isSuccess;
    }
  );

  ipcMain.on("save-pdf", async () => {
    const isComplete = await printPreview.saveFilePdf();
    if (isComplete) {
      if (isForm === "export") {
        const isSuccess = await exportWarehouse(
          currentItems,
          currentName,
          currentNote,
          currentNature,
          currentTotal,
          currentDate
        );
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("export-warehouse", { isSuccess });
        }
      } else {
        const isSuccess = await importWarehouse(
          currentItems,
          currentName,
          currentNote,
          currentNature,
          currentTotal,
          currentDate,
        );
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("import-warehouse", { isSuccess });
        }
      }
    }
  });
};

export default wareHouseItem;
