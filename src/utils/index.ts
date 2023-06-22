import { STATUS, COLOR_STATUS } from "@/types";
import { RuleObject } from 'antd/lib/form';
import dayjs from "dayjs";
import 'dayjs/locale/vi';

export const renderTextStatus = (idStatus: number) => {
    let response = {
        text: '',
        color: '',
    };
    switch (idStatus) {
        case STATUS.TEMPORARY_IMPORT:
            response = {
                text: 'Tạm nhập',
                color: COLOR_STATUS.TEMPORARY_IMPORT
            }
            break;
        case STATUS.TEMPORARY_EXPORT:
            response = {
                text: 'Tạm xuất',
                color: COLOR_STATUS.TEMPORARY_EXPORT
            }
            break;
        case STATUS.IMPORT:
            response = {
                text: 'Nhập',
                color: COLOR_STATUS.IMPORT
            }
            break;
        case STATUS.EXPORT:
            response = {
                text: 'Xuất',
                color: COLOR_STATUS.EXPORT
            }
            break;

        default:
            response = {
                text: 'Tạm nhập',
                color: COLOR_STATUS.TEMPORARY_IMPORT
            }
            break;
    }

    return response;
}

export const formatNumberWithCommas = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';
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

export const formatDate = (newDate: any) => {

    // Set the locale to Vietnamese
    dayjs.locale('vi');

    // Format the date in Vietnamese format
    const formattedDate = dayjs(newDate).format('DD/MM/YYYY');
    return formattedDate;

}