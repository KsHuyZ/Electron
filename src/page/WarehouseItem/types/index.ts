type DataType = {
  key?: string;
  IDIntermediary: string;
  IDWarehouseItem?: string;
  name: string;
  nameWareHouse?:string;
  price: string;
  unit: string;
  quality: number | null;
  note: string;
  quantity_plane: number | null;
  quantity_real: number | null;
  quantity?: number | null;
  status: number | null;
  date_expried: string;
  date?: string;
  date_created_at: string;
  date_updated_at: string;
  id_Source?: string;
  id_WareHouse?: number;
  warehouseName?: string;
  prev_idwarehouse?: number;
  totalPrice?: number;
  newQuantity?:number;
};

type WarehouseItem = {
  idSource: string;
  name: string;
  price: string | number | null;
  unit: string;
  quality: string;
  date_expried: any;
  quantity_plane: number;
  quantity_real: number;
  note: string;
};

type FormWareHouseItem = WarehouseItem & {
  id_wareHouse: number;
  status: number;
  date_created_at: any;
  date_updated_at: any;
  date: any;
};

type ISearchWareHouseItem = {
  name: string;
  startDate: string;
  endDate: string;
  idSource: number | null;
  status: number | null;
  now_date_ex?: string;
  after_date_ex?: string;
};

export enum STATUS_MODAL {
  TRANSFER = "transfer",
  RECEIPT = "receipt",
  DELIVERY = "delivery",
  CLOSE = "close",
}

export type {
  DataType,
  WarehouseItem,
  FormWareHouseItem,
  ISearchWareHouseItem,
};
