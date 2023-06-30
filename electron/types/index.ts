import { Moment } from "moment";

export type WarehouseItem = {
  id_wareHouse: number;
  id_nguonHang: number;
  name: string;
  price: number;
  unit: string;
  quality: number;
  date_expried: Moment | null;
  date_created_at: Moment | null;
  date_updated_at: Moment | null;
  quantity_plane: number;
  quantity_real: number;
  status: number;
  note: string;
};
export type WarehouseReceiving = {
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
