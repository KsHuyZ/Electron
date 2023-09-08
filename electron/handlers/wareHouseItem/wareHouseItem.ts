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
import { startPrint } from "../../module/print";
import { formExportBill } from "../../utils/formExportBill";
import { formImportBill } from "../../utils/formImportBill";
import formReport from "../../utils/formReport";
import moment, { Moment } from "moment";
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
import { sendResponse } from "../../utils";
import tempCountDelivery from "../../database/tempCountDelivery";

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
let currentAuthor = "";
let currentNumContract;
let currentID;
let currentIDSource;
let currentReceivingID;

const wareHouseItem = (mainScreen: BrowserWindow) => {
  const {
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
    getWarehouseItemByName,
    getAllWareHouseByDateCreated,
  } = wareHouseItemDB;

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

  // ipcMain.handle(
  //   "update-warehouseitem",
  //   async (event, data: WarehouseItem & Intermediary) => {
  //     const newWareHouse = await updateWareHouseItem(data);
  //     return newWareHouse;
  //   }
  // );

  // listen delete event
  ipcMain.handle(
    "delete-warehouseitem",
    async (event, id: number, id_wareHouse: number) => {
      const isSuccess = await deleteWareHouseItem(id);
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
        await createMutipleWarehouseItem(ID, items, id_Source, idWareHouse);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }

      // startPrint(
      //   {
      //     htmlString: await formImportBill({
      //       items,
      //       nameSource,
      //       temp: true,
      //       name,
      //       note,
      //       nature,
      //       total,
      //       date,
      //       title,
      //       nameWareHouse,
      //       numContract,
      //     }),
      //   },
      //   undefined
      // );

      // isForm = "temp-import";
      // currentItems = items;
      // currentAuthor = author;
      // currentDate = date;
      // currentName = name;
      // currentIDSource = id_Source;
      // currentReceivingID = idWareHouse;
      // currentNature = nature;
      // currentTitle = title;
      // currentTotal = total;
      // currentNumContract = numContract;
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
        author: string;
        numContract: number | string;
      }
    ) => {
      const {
        items,
        name,
        note,
        nature,
        total,
        date,
        title,
        author,
        numContract,
      } = data;
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
      currentAuthor = author;
      currentNumContract = numContract;
      isForm = "export";
      return null;
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

      const isSuccess = await importWarehouse(
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
      );
      return isSuccess;
      // startPrint(
      //   {
      //     htmlString: await formImportBill(data),
      //   },
      //   undefined
      // );
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
        nameReceiving: string;
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

      const isSuccess = await tempExportWarehouse(
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
      );
      return isSuccess;
      // const isSuccess = await tempExportWareHouse(id_receiving, id_list);
      // return isSuccess;
      // startPrint(
      //   {
      //     htmlString: await formExportBill({ ...data, temp: true }),
      //   },
      //   undefined
      // );
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
        id_WareHouse,
        author,
        numContract,
      } = data;
      startPrint(
        {
          htmlString: await formExportBill(data),
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
      currentReceivingID = id_WareHouse;
      isForm = "edit-export";
      currentAuthor = author;
      currentNumContract = numContract;
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
            currentDate,
            currentAuthor,
            currentNumContract
          );

          mainScreen.webContents.send("export-warehouse", { isSuccess });
        } else if (isForm === "edit-export") {
          editCountDelivery(
            currentEditItem,
            currentNewItem,
            currentRemoveItem,
            currentItems,
            currentID,
            currentReceivingID,
            currentName,
            currentNature,
            currentTotal,
            currentDate,
            currentTitle,
            currentAuthor,
            currentNumContract
          );
          mainScreen.webContents.send("edit-export-success");
        }
      })
      .catch((error) => console.log(error));
    currentAuthor = "";
    currentDate = null;
    currentEditItem = [];
    currentID = null;
    currentIDSource = null;
    currentItems = [];
    currentName = "";
    currentNature = "";
    currentNewItem = [];
    currentNote = "";
    currentNumContract = null;
    currentReceivingID = null;
    currentRemoveItem = [];
    currentTitle = "";
    currentTotal = 0;
    isForm = "";
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
};

export default wareHouseItem;
