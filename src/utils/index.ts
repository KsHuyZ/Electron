import { STATUS, COLOR_STATUS } from "@/types";
import { RuleObject } from "antd/lib/form";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import queryString from "query-string";

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
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " vnđ";
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

export const formatDate = (newDate: any , suffix: boolean = false, type: string = 'date_First') => {

    // Set the locale to Vietnamese
    dayjs.locale('vi');
    let formattedDate = '';
    // Format the date in Vietnamese format
    if(type === 'date_First') {
         formattedDate = dayjs(newDate).format(`${suffix ? 'HH:MM' : ''} DD/MM/YYYY`);
    }else if(type === 'after_Date'){
         formattedDate = dayjs(newDate).format(`YYYY/MM/DD ${suffix ? 'HH:MM' : ''}`);
        }else{
        formattedDate = dayjs(newDate).format(`YYYY/MM/DD`);
    }
    return formattedDate;

}

export const convertPrice = (priceString: string) => {
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