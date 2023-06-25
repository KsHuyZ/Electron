export const ERROR = {
    ERROR_1 : 'Vui lòng không để trống {0}',
    ERROR_2 : '{0} phải là số'

};

export const ERROR_SERVER = {
    ERROR_1: 'Lỗi server!!'
}

export const SUCCESS = {
    SUCCESS_1 : 'Tạo sản phẩm thành công'
}

export const getMessage = (message: string, key: string) =>{
    return message.replace(`{${0}}`, key);
}