import { STATUS, COLOR_STATUS, FormatTypeTable } from "@/types";
import { RuleObject } from "antd/lib/form";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import queryString from "query-string";
import { DataType } from "@/page/WarehouseItem/types";

export const renderTextStatus = (idStatus: number) => {
  let response = {
    text: "",
    color: "",
  };
  switch (idStatus) {
    case STATUS.TEMPORARY_IMPORT:
      response = {
        text: "Tạm nhập",
        color: COLOR_STATUS.TEMPORARY_IMPORT,
      };
      break;
    case STATUS.TEMPORARY_EXPORT:
      response = {
        text: "Tạm xuất",
        color: COLOR_STATUS.TEMPORARY_EXPORT,
      };
      break;
    case STATUS.IMPORT:
      response = {
        text: "Nhập",
        color: COLOR_STATUS.IMPORT,
      };
      break;
    case STATUS.EXPORT:
      response = {
        text: "Xuất",
        color: COLOR_STATUS.EXPORT,
      };
      break;

    case STATUS.TEMPORARY_EXPORT_TEMPORARY_IMPORT:
      response = {
        text: "Tạm xuất (Tạm nhập)",
        color: COLOR_STATUS.TEMPORARY_EXPORT_TEMPORARY_IMPORT,
      };
      break;

    default:
      response = {
        text: "Tạm nhập",
        color: COLOR_STATUS.TEMPORARY_IMPORT,
      };
      break;
  }

  return response;
};

export const formatNumberWithCommas = (value: number): string => {
  return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " vnđ" ?? 0;
};

export const createRegexValidator = (regex: RegExp, errorMessage: string) => {
  return (rule: RuleObject, value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (value && !regex.test(value)) {
        reject(errorMessage);
      } else {
        resolve();
      }
    });
  };
};

export const formatDate = (newDate: any, suffix: boolean = false, type: string = 'date_First') => {
  // Set the locale to Vietnamese
  dayjs.locale('vi');

  let formattedDate = '';

  // Format the date based on the type
  switch (type) {
    case 'date_First':
      formattedDate = dayjs(newDate).format(`${suffix ? 'HH:MM' : ''} DD/MM/YYYY`);
      break;
    case 'after_Date':
      formattedDate = dayjs(newDate).format(`YYYY/MM/DD ${suffix ? 'HH:MM' : ''}`);
      break;
    case 'after_7day':
      const before7Days = dayjs(newDate).add(7, 'day');
      formattedDate = dayjs(before7Days).format(`YYYY/MM/DD`);
      break;
      case 'after_month':
        const month = dayjs(newDate).add(1, 'month');
        formattedDate = dayjs(month).format(`YYYY/MM/DD`);
        break;
    default:
      formattedDate = dayjs(newDate).format(`YYYY/MM/DD`);
      break;
  }

  return formattedDate;
};

export const convertPrice = (priceString: any) : number => {
  // Remove all dots from the price string
  const priceWithoutDots = priceString.replace(/\./g, "");

  // Parse the price string as an integer
  const convertedPrice = parseInt(priceWithoutDots);

  return convertedPrice;
};

export const stringifyParams = (data: any) => {
  const { params, option } = data;
  return queryString.stringify(params, {
    arrayFormat: 'comma',
    encode: false,
    skipNull: true,
    skipEmptyString: true,
    ...option,
  });
};

export const getDateExpried = (date: string) =>{
  dayjs.locale('vi')

  const currentDate = dayjs();
  const specificDate = dayjs(date);

// Chênh lệch thời gian giữa hai ngày
const timeDiff = specificDate.diff(currentDate, 'day');
let days = '';
if(timeDiff > 0){
  const daysRemaining = timeDiff > 0 ? timeDiff : 0;
  days =  `Còn ${daysRemaining} ngày nữa là đến ngày ${date}.`;

}else{
  const daysPassed = timeDiff < 0 ? Math.abs(timeDiff) : 0;
  if( daysPassed < 0){
    days = `Đã hết hạn từ ngày ${date}.`
  }else{
    days = `Đây là ngày cuối từ ngày ${date}.`
  }
}
return days;
}

export const createFormattedTable = (items: DataType[]): FormatTypeTable<DataType>[] => {
  const result: FormatTypeTable<DataType>[] = [];

  for (const current of items) {
    let found = false;

    for (const formattedItem of result) {
      if (formattedItem.id_WareHouse === current.id_WareHouse) {
        if (!formattedItem.children) {
          formattedItem.children = [];
        }

        formattedItem.children.push(current);
        found = true;
        break;
      }
    }

    if (!found) {
      result.push(current);
    }
  }

  return result;
};

export const removeItemChildrenInTable = (arrays: FormatTypeTable<DataType>[]): DataType[] => {
  const newArray = JSON.parse(JSON.stringify(arrays));
  for (let i = 0; i < newArray.length; i++) {
    const item = newArray[i];
    item.totalPrice = Number(item.price) * Number(item.quantity);
  }
  return newArray;
};