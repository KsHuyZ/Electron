import { STATUS, COLOR_STATUS, FormatTypeTable, OptionSelect } from "@/types";
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
  if( timeDiff < 0){
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

interface DataObject {
  [key: string]: any;
}

export function chooseRowsAboveThreshold(
  data: DataObject[],
  targetKeys: string[],
  threshold: number
): DataObject[] {
  const keyCountMap: { [key: string]: number } = {};

  // Count the occurrences of the target keys in the array of objects
  data.forEach((item) => {
    targetKeys.forEach((key) => {
      if (item.hasOwnProperty(key)) {
        keyCountMap[key] = (keyCountMap[key] || 0) + 1;
      }
    });
  });

  // Filter and choose the rows that meet the threshold condition
  const chosenRows: DataObject[] = data.filter((item) => {
    let count = 0;
    targetKeys.forEach((key) => {
      if (item.hasOwnProperty(key)) {
        count++;
      }
    });
    return count > threshold;
  });

  return chosenRows;
}

const keys = ['key', 'unit', 'quality', 'date_expried', 'price', 'quantity_plane','quantity_real', 'total', 'note', 'name'];

const convertKey = (oldKey: string) => {
  const index = parseInt(oldKey.replace('__EMPTY_', ''));
  if (oldKey === '__EMPTY') {
    return keys[0];
  }
  if (!isNaN(index) && index >= 1 && index <= keys.length) {
    return keys[index];
  }
  return keys[keys.length - 1];
};
  
export const convertItemKey = (arrayList : any) =>{
  return arrayList && arrayList?.map((obj: any) => {
    const newObj: any = {};
    
    for (const oldKey in obj) {
      const newKey = convertKey(oldKey);
      newObj[newKey] = obj[oldKey];
    }
    return newObj;
  })
};

export function formatDateUploadFile(dateString: any) {
  const parts = dateString.split('/'); // Split the input date string by the slash '/'
  
  // Ensure the parts have valid values
  if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
    return 'Invalid date format';
  }

  const [month, day] = parts;
  const year = new Date().getFullYear(); // Get the current year

  // Construct the new date string in the "YYYY/MM/DD" format
  const newDateString = `${year}/${month}/${day}`;

  return newDateString;
}

export const convertDataHasReceiving = (listData: DataType[], listNameWareHouse: OptionSelect[]) => {
  const warehouseMapping: { [key: string]: string } = {};
  let newArray: DataType[] = JSON.parse(JSON.stringify(listData));
  listNameWareHouse.forEach((warehouse) => {
    warehouseMapping[warehouse.value] = warehouse.label;
  });

  return newArray.map((element) => {
    if (element.prev_idwarehouse) {
      element.nameWareHouse = warehouseMapping[element.prev_idwarehouse] || null;
    }
    return element;
  });
}
