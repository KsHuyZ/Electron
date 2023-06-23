import { ipcMain, dialog } from "electron";
import wareHouseItemDB from "../../database/wareHouseItem/wareHouseItem";
import { WarehouseItem } from "../../types";
import convertHtmlToPdf from "../../utils/exportPDF";


type DataType = {
  id: string;
  idWareHouse: string;
  idNguonHang: string;
  name: string;
  price: number;
  quantity_plane: number;
  quantity_real: number;
  unit: string;
  quality: number;
  date_expiry: string;
  date_create_at: string;
  date_update_at: string;
  note: string;
  status: number;
};

const wareHouseItem = () => {
  const {
    createWareHouseItem,
    getAllWarehouseItem,
    deleteWareHouseItem,
    updateWareHouseItem,
  } = wareHouseItemDB;

  //  listen create warehouse item request
  ipcMain.on("create-product-item", (event, data: string) => {
    const newData = JSON.parse(data);
    createWareHouseItem(newData);
  });

  // listen get all warehouse item request

  ipcMain.on("warehouseitem-request-read", (event, data: string) => {
    getAllWarehouseItem(data);
  });

  ipcMain.on(
    "update-warehouseitem",
    (event, data: WarehouseItem, id: number) => {
      updateWareHouseItem(data, id);
    }
  );

  // listen delete event
  ipcMain.on("delete-warehouseitem", (event, id: number) => {
    deleteWareHouseItem(id);
  });

  ipcMain.on("export-pdf", async (event, data: { item: DataType[] }) => {
    convertHtmlToPdf()
      .then(() => {
        console.log(`PDF saved!`);
      })
      .catch((error) => {
        console.error("Error converting HTML to PDF:", error);
      });
  });

  ipcMain.on("print-to-pdf", async (event, content) => {
    const { dialog } = require("electron");
    const pdfMake = require("pdfmake/build/pdfmake.js");
    const pdfFonts = require("pdfmake/build/vfs_fonts.js");
    const htmlToPdfMake = require("html-to-pdfmake");

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      content: htmlToPdfMake(content),
    };
    console.log("doc", docDefinition);
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const pdfDataUrl = await pdfDocGenerator.getBase64((dataUrl) => dataUrl);

    const options = {
      filters: [
        {
          name: "PDFs",
          extensions: ["pdf"],
        },
      ],
    };

    const filePath = dialog.showSaveDialogSync(options);

    if (filePath) {
      const fs = require("fs");
      const buffer = Buffer.from(pdfDataUrl, "base64");
      fs.writeFileSync(filePath, buffer);
    }
  });

  ipcMain.on("pdf-data-url", async (event, content) => {
    const pdfMake = require("pdfmake/build/pdfmake.js");
    const pdfFonts = require("pdfmake/build/vfs_fonts.js");
    const htmlToPdfMake = require("html-to-pdfmake");

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      content: htmlToPdfMake(content),
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const pdfDataUrl = await pdfDocGenerator.getBase64((dataUrl) => dataUrl);

    event.sender.send("pdf-data-url", pdfDataUrl);
  });
};
export default wareHouseItem;
