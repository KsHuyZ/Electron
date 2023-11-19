import ExcelJS from "exceljs";
import toVietnamese from "./toVietnamese";
import { InfoParamsType } from "../types";

export const formFileExcel = async (
  infoParams: InfoParamsType,
  items: any,
  filePath: string
) => {
  const workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet(`${infoParams.nameWareHouse}`);
  const columns = [
    { header: "TT", key: "index", width: 10 },
    { header: "Tên Hàng", key: "name", width: 40 },
    { header: "DVT", key: "unit", width: 10 },
    { header: "CL", key: "quality", width: 10 },
    { header: "HD", key: "date_expried", width: 10 },
    { header: "Giá lẻ", key: "price", width: 20 },
    { header: "Kế hoạch", key: "quantity_plane", width: 10 },
    { header: "thực hiện", key: "quantity", width: 10 },
    { header: "Thành tiền", key: "total_money", width: 32 },
    { header: "Ghi chú", key: "note", width: 10 },
  ];

  for (let index = 0; index < columns.length; index++) {
    worksheet.getColumn(index + 1).width = columns[index].width;
  }

  const headerRow = worksheet.getRow(7); // Row 7
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const headerCell = headerRow.getCell(1 + colIndex); // Column 1 (A) and onwards
    headerCell.value = columns[colIndex].header;
    headerCell.font = {
      bold: true,
      size: 14,
    };
    headerCell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
  }

  // Merge cells in the specified pattern
  for (let colIndex = 1; colIndex <= columns.length; colIndex++) {
    const colLetter = String.fromCharCode(65 + colIndex - 1); // Convert column index to letter
    worksheet.mergeCells(`${colLetter}7`, `${colLetter}8`);
  }

  let rowIndex = 9; // Start from row 9
  let totalSum = 0;
  let totalItem = 0;

  for (const rowData of items) {
    const dataRow = worksheet.getRow(rowIndex);
    totalItem += 1;
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const colKey = columns[colIndex].key;
      dataRow.getCell(1 + colIndex).font = {
        size: 13,
      };
      dataRow.getCell(1 + colIndex).border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      dataRow.getCell(1 + colIndex).value = rowData[colKey];

      if (colKey === "price") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0.00";
        dataRow.getCell(1 + colIndex).value = rowData["price"];
      }

      if (colKey === "total_money") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0.00";
        dataRow.getCell(1 + colIndex).value =
          rowData["price"] * rowData["quantity"];
        totalSum += rowData["price"] * rowData["quantity"];
      }
    }
    rowIndex++;
  }

  settingInfoForm(worksheet, infoParams);
  settingFooter(worksheet, totalSum, totalItem);

  return await workbook.xlsx.writeFile(filePath);
};

const settingInfoForm = (worksheet: any, infoParams: InfoParamsType) => {
  worksheet.getCell("C2").value = {
    richText: richText({ text: infoParams.nameForm, size: 17 }),
  };

  worksheet.getCell("C4").value = {
    richText: richText({ text: "Ngày đóng gói:" }),
  };

  infoParams.isForm &&
    ((worksheet.getCell("C5").value = {
      richText: richText({ text: "Tính chất:" }, { text: "Thường xuyên" }),
    }),
    (worksheet.getCell("I2").value = {
      richText: richText({ text: "SỐ LỆNH :" }, { text: "555" }),
    }),
    (worksheet.getCell("B4").value = {
      richText: richText({ text: "Đơn vị nhận:" }),
    }),
    (worksheet.getCell("B5").value = {
      richText: richText({ text: "Cấp theo:" }, { text: "Phòng chống dịch" }),
    }),
    (worksheet.getCell("B6").value = {
      richText: richText({ text: "Ngày đóng gói:" }),
    }));

  // Set custom title header
  worksheet.getCell("B1").value = {
    richText: richText({ text: "QUÂN KHU 5" }),
  };
  worksheet.getCell("B2").value = {
    richText: richText({ text: "CỤC HẬU CẦN" }),
  };

  return worksheet;
};

const settingFooter = (worksheet: any, totalSum, totalItem) => {
  const totalRow = worksheet.addRow([]);
  totalRow.getCell("H").value = `${new Intl.NumberFormat().format(totalSum)}`;
  totalRow.font = {
    bold: true,
    size: 14,
  };
  totalRow.getCell("B").value = `Tổng cộng: ${totalItem} khoản`;

  const rowMoneyText = worksheet.addRow([]);
  rowMoneyText.font = {
    bold: true,
    size: 14,
  };
  rowMoneyText.getCell("B").value = {
    richText: richText(
      { text: "Thành tiền :" },
      { text: `(${toVietnamese(totalSum)})`, keyFont: "italic" }
    ),
  };

  const rowDate = worksheet.addRow([]);
  rowDate.font = {
    size: 12,
    italic: true,
  };

  rowDate.getCell("A").value = `   Giao nhận ngày       tháng     năm 2023   `;
  rowDate.getCell("H").value = `    ngày       tháng     năm 2023      `;
  worksheet.mergeCells(`A${rowDate.number}:B${rowDate.number}`);
  worksheet.mergeCells(
    `H${rowDate.number}:I${rowDate.number}:J${rowDate.number}`
  );

  const signPerson = worksheet.addRow([]);
  signPerson.font = {
    size: 16,
    bold: true,
  };
  signPerson.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.mergeCells(`A${signPerson.number}:J${signPerson.number}`);
  signPerson.getCell(
    "A"
  ).value = `NGƯỜI GIAO           NGƯỜI NHẬN             TRỢ LÝ DƯỢC             PHÒNG QUÂN Y           THỦ TRƯỞNG ĐƠN VỊ`;
  return worksheet;
};

type objProperty = {
  size?: number;
  text: string;
  keyFont?: string;
};

const richText = (obj1: objProperty, obj2?: objProperty) => {
  const defaultSize = 13;

  const part1 = {
    font: { bold: true, size: obj1.size || defaultSize },
    text: obj1.text,
  };

  const part2 = obj2
    ? {
        font: { [obj2.keyFont]: true, size: obj2.size || defaultSize },
        text: obj2.text,
      }
    : undefined;

  return part2 ? [part1, part2] : [part1];
};

const convertDate = (date: string) => {
  try {
    const parts = date.split("/");
    const newFormat = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return newFormat;
  } catch (error) {
    return null;
  }
};

export const formReport = async (
  items: any,
  filePath: string,
  startTime: string,
  endTime: string
) => {
  const workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet(`BÁO CÁO XUẤT NHẬP`);
  worksheet.getCell("B1").value = {
    richText: richText({ text: "QUÂN KHU 5" }),
  };
  worksheet.getCell("B2").value = {
    richText: richText({ text: "CỤC HẬU CẦN" }),
  };
  const columns = [
    { header: "TT", key: "index", width: 10 },
    { header: "Nội dung", key: "name", width: 40 },
    { header: "Tồn đầu kỳ", key: "start", width: 40 },
    { header: "Nhập trong kỳ", key: "imports", width: 40 },
    { header: "Xuất trong kỳ", key: "exports", width: 40 },
    { header: "Tồn cuối kỳ", key: "end", width: 40 },
  ];
  for (let index = 0; index < columns.length; index++) {
    worksheet.getColumn(index + 1).width = columns[index].width;
  }
  const headerRow = worksheet.getRow(7); // Row 7
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const headerCell = headerRow.getCell(1 + colIndex); // Column 1 (A) and onwards
    headerCell.value = columns[colIndex].header;
    headerCell.font = {
      bold: true,
      size: 14,
    };
    headerCell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  // Merge cells in the specified pattern
  for (let colIndex = 1; colIndex <= columns.length; colIndex++) {
    const colLetter = String.fromCharCode(65 + colIndex - 1); // Convert column index to letter
    worksheet.mergeCells(`${colLetter}7`, `${colLetter}8`);
  }

  let rowIndex = 9; // Start from row 9
  let totalStart = 0;
  let totalImport = 0;
  let totalExport = 0;
  let totalEnd = 0;
  let totalItem = 0;

  for (const rowData of items) {
    const dataRow = worksheet.getRow(rowIndex);
    totalItem += 1;
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const colKey = columns[colIndex].key;
      dataRow.getCell(1 + colIndex).font = {
        size: 13,
      };
      dataRow.getCell(1 + colIndex).border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      dataRow.getCell(1 + colIndex).value = rowData[colKey];

      if (colKey === "start") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["start"];
        totalStart += rowData["start"];
      }
      if (colKey === "imports") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["imports"];
        totalImport += rowData["imports"];
      }
      if (colKey === "exports") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["exports"];
        totalExport += rowData["exports"];
      }
      if (colKey === "end") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["end"];
        totalEnd += rowData["end"];
      }
    }
    rowIndex++;
  }
  const dataRow = worksheet.getRow(rowIndex++);
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const colKey = columns[colIndex].key;
    dataRow.getCell(1 + colIndex).font = {
      size: 13,
    };
    dataRow.getCell(1 + colIndex).border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
    if (colIndex === 0) {
      dataRow.getCell(1 + colIndex).value = "Tổng cộng";
      dataRow.font = {
        bold: true,
        size: 14,
      };
    }

    if (colKey === "start") {
      dataRow.getCell(1 + colIndex).numFmt = "#,##0";
      dataRow.getCell(1 + colIndex).value = totalStart;
    }
    if (colKey === "imports") {
      dataRow.getCell(1 + colIndex).numFmt = "#,##0";
      dataRow.getCell(1 + colIndex).value = totalImport;
    }
    if (colKey === "exports") {
      dataRow.getCell(1 + colIndex).numFmt = "#,##0";
      dataRow.getCell(1 + colIndex).value = totalExport;
    }
    if (colKey === "end") {
      dataRow.getCell(1 + colIndex).numFmt = "#,##0";
      dataRow.getCell(1 + colIndex).value = totalEnd;
    }
  }
  worksheet.getCell("C2").value = {
    richText: richText({ text: "BÁO CÁO XUẤT NHẬP", size: 17 }),
  };
  worksheet.getCell("C5").value = {
    richText: richText({ text: "Phụ lục:" }),
  };
  worksheet.getCell("C6").value = {
    richText: richText({
      text: `(Số liệu từ ${convertDate(startTime)} đến ngày ${convertDate(
        endTime
      )})`,
    }),
  };
  return await workbook.xlsx.writeFile(filePath);
};

export const formReportInventory = async (
  items: any,
  filePath: string,
  startTime: string,
  endTime: string
) => {
  const workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet(`BÁO CÁO HÀNG TỒN`);
  worksheet.getCell("B1").value = {
    richText: richText({ text: "QUÂN KHU 5" }),
  };
  worksheet.getCell("B2").value = {
    richText: richText({ text: "CỤC HẬU CẦN" }),
  };
  const columns = [
    { header: "TT", key: "index", width: 10 },
    { header: "Tên hàng", key: "name", width: 40 },
    { header: "Nước SX", key: "origin", width: 40 },
    { header: "ĐVT", key: "unit", width: 40 },
    { header: "NHSX", key: "", width: 40 },
    { header: "NHSD", key: "", width: 40 },
    { header: "Giá lẻ", key: "price", width: 40 },
    { header: "Tồn đầu", key: "quantity", width: 40 },
    { header: "Chờ nhập", key: "import", width: 40 },
    { header: "Chờ xuất", key: "quantityExport", width: 40 },
    { header: "Tồn cuối", key: "quantityFinal", width: 40 },
  ];

  for (let index = 0; index < columns.length; index++) {
    worksheet.getColumn(index + 1).width = columns[index].width;
  }
  const headerRow = worksheet.getRow(7); // Row 7
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const headerCell = headerRow.getCell(1 + colIndex); // Column 1 (A) and onwards
    headerCell.value = columns[colIndex].header;
    headerCell.font = {
      bold: true,
      size: 14,
    };
    headerCell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  for (let colIndex = 1; colIndex <= columns.length; colIndex++) {
    const colLetter = String.fromCharCode(65 + colIndex - 1); // Convert column index to letter
    worksheet.mergeCells(`${colLetter}7`, `${colLetter}8`);
  }

  let rowIndex = 9; // Start from row 9
  let totalItem = 0;

  for (const rowData of items) {
    const dataRow = worksheet.getRow(rowIndex);
    totalItem += 1;
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const colKey = columns[colIndex].key;
      dataRow.getCell(1 + colIndex).font = {
        size: 13,
      };
      dataRow.getCell(1 + colIndex).border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      dataRow.getCell(1 + colIndex).value = rowData[colKey];
      if (colKey === "price") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["price"];
      }
    }
    rowIndex++;
  }

  worksheet.getCell("C2").value = {
    richText: richText({ text: "BÁO CÁO TỒN SỐ LƯỢNG", size: 17 }),
  };
  worksheet.getCell("C5").value = {
    richText: richText({
      text: `(Số liệu từ ${convertDate(startTime)} đến ngày ${convertDate(
        endTime
      )})`,
    }),
  };
  return await workbook.xlsx.writeFile(filePath);
};

export const formInventoryRecords = async (
  items: any,
  startTime: string,
  endTime: string,
  nameWareHouse: string,
  filePath: string
) => {
  console.log(items);
  let rowIndex = 9; // Start from row 9
  let totalItem = 0;
  const workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet(`BIÊN BẢN KIỂM KÊ`);

  const columns = [
    { header: "TT", key: "i", width: 10 },
    { header: `Tên quy cách (Theo danh mục)`, key: "name", width: 40 },
    { header: "ĐVT", key: "unit", width: 40 },
    { header: "CL", key: "quality", width: 40 },
    { header: "Hạn dùng", key: "date_expired", width: 40 },
    { header: "SL-SS Kho", key: "quantity", width: 40 },
    { header: "SL-TK Kho", key: "", width: 40 },
    { header: "Số lượng thừa Kho", key: "", width: 40 },
    { header: "Số lượng thiếu Kho", key: "", width: 40 },
    { header: "Ghi chú", key: "", width: 40 },
  ];
  for (let index = 0; index < columns.length; index++) {
    worksheet.getColumn(index + 1).width = columns[index].width;
  }
  const headerRow = worksheet.getRow(7); // Row 7
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const headerCell = headerRow.getCell(1 + colIndex); // Column 1 (A) and onwards
    headerCell.value = columns[colIndex].header;
    headerCell.font = {
      bold: true,
      size: 14,
    };
    headerCell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
  }
  for (let colIndex = 1; colIndex <= columns.length; colIndex++) {
    const colLetter = String.fromCharCode(65 + colIndex - 1); // Convert column index to letter
    worksheet.mergeCells(`${colLetter}7`, `${colLetter}8`);
  }

  worksheet.getCell("B1").value = {
    richText: richText({ text: "QUÂN KHU 5" }),
  };
  worksheet.getCell("B2").value = {
    richText: richText({ text: "CỤC HẬU CẦN" }),
  };
  worksheet.getCell("B3").value = {
    richText: richText({ text: `KHO ${nameWareHouse}` }),
  };
  worksheet.getCell("E3").value = {
    richText: richText({ text: "BIÊN BẢN KIỂM KÊ", size: 17 }),
  };
  worksheet.getCell("E5").value = {
    richText: richText({
      text: `(Số liệu từ ${convertDate(startTime)} đến ngày ${convertDate(
        endTime
      )})`,
    }),
  };
  for (const rowData of items) {
    const dataRow = worksheet.getRow(rowIndex);
    totalItem += 1;
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const colKey = columns[colIndex].key;
      dataRow.getCell(1 + colIndex).font = {
        size: 13,
      };
      dataRow.getCell(1 + colIndex).border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      dataRow.getCell(1 + colIndex).value = rowData[colKey];
      if (colKey === "price") {
        dataRow.getCell(1 + colIndex).numFmt = "#,##0";
        dataRow.getCell(1 + colIndex).value = rowData["price"];
      }
      if (colKey === "date_expired") {
        dataRow.getCell(1 + colIndex).value = convertDate(
          rowData["date_expired"]
        );
      }
    }
    rowIndex++;
  }
  return await workbook.xlsx.writeFile(filePath);
};
