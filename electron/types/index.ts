import { Moment } from "moment";

export type WarehouseItem = {
  ID: number;
  idWarehouseItem: number;
  idSource: number;
  name: string;
  price: number;
  unit: string;
  date_expried: any | string | null;
  date_created_at: Moment | null;
  date_updated_at: Moment | null;
  quantity_plane: number;
  quantity_real: number;
  note: string;
  origin: string;
};

export type Intermediary = {
  ID: number;
  IDIntermediary: number;
  id_wareHouse: number;
  id_WareHouse?: number;
  IDWarehouse?: number;
  IDWarehouseItem: number;
  quantity_real?: number;
  status: number;
  quality: number;
  quantity: number;
  date: Moment | null;
  date_temp_export: Moment | null;
  IDIntermediary1?: number;
  quantityRemain: number;
  quantityOrigin: number
};

export type DataType = {
  ID: number;
  key?: string;
  IDIntermediary: string;
  IDWarehouseItem?: string;
  name: string;
  price: number;
  unit: string;
  quality: number | null;
  note: string;
  quantity_plane: number | null;
  quantity_real: number | null;
  quantity?: number | null;
  status: number | null;
  date_expried: string;
  date_created_at: string;
  date_updated_at: string;
  id_Source?: string;
  id_WareHouse?: number;
  nameWareHouse?: string;
  id_prev_warehouse?: number;
};

export type WarehouseReceiving = {
  id?: number;
  name: string;
  description: string;
  is_receiving: number;
  phone: string;
  address: string;
};
export type Source = {
  name: string;
  phone: string;
  address: string;
};

export type ISearchWareHouseItem = {
  name: string;
  startDate: string;
  endDate: string;
  idSource: number | null;
  status: number | null;
  now_date_ex: string;
  after_date_ex: string;
  itemWareHouse: string;
};

export type IPostMultipleItem = {
  name: string;
  price: number;
  unit: string;
  date_expried: string;
  date_created_at: string;
  date_updated_at: string;
  note: string;
  quantity_plane: number;
  quantity_real: number;
  id_wareHouse: number;
  status: string;
  date: string;
  quality: number;
};

export type InfoParamsType = {
  nameForm: string;
  isForm: boolean;
  nameWareHouse: string;
};

export type IDateRangerItem = {
  start: string;
  end: string;
};
