import { Moment } from "moment";

export type WarehouseItem = {
  idWarehouseItem: number;
  idSource: number;
  name: string;
  price: number;
  unit: string;
  date_expried: Moment | null;
  date_created_at: Moment | null;
  date_updated_at: Moment | null;
  quantity_plane: number;
  quantity_real: number;
  note: string;
};


export type Intermediary = {
  idIntermediary: number;
  id_wareHouse: number;
  id_wareHouse_item: number;
  status: number;
  quality: number;
  quantity: number;
  date: Moment | null;
  date_temp_export: Moment | null;

}

export type WarehouseReceiving = {
  id?: number;
  name: string;
  description: string;
  is_receiving: number;
  phone: string;
  address:string;
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
  now_date_ex : string;
  after_date_ex: string;
}
