type DataType = {
    ID: string;
    name: string;
    price: string;
    unit: string;
    quality: number | null;
    note: string;
    quantity_plane: number | null;
    quantity_real: number | null;
    status: number | null;
    date_expried: string;
    date_created_at: string;
    date_updated_at: string;
    id_nguonHang?:string;
  } 

type WarehouseItem = {
    id_nguonHang: string;
    name: string;
    price: string;
    unit: string;
    quality: string;
    date_expried: any;
    quantity_plane: number;
    quantity_real: number;
    note: string;
  };

type FormWareHouseItem = WarehouseItem & {
  id_wareHouse: number;
  status : number;
  date_created_at: any;
  date_updated_at:any;
}

export type {
    DataType,
    WarehouseItem,
    FormWareHouseItem
}