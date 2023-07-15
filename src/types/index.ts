export type ModalProps = {
  closeModal: () => void;
  setLoading: () => void;
};

export type ResponseIpc<T> = {
  rows: T;
  total?: number;
};

export type Pagination = {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
};

export type TableData<T> = Pagination & ResponseIpc<T>;

export type ItemSource = {
  ID: number;
  name: string;
  address: string;
  phone: string;
};

export type OptionSelect = {
  label: string;
  value: any;
};

export type WareHouse = {
  ID: string;
  name: string;
};

export const STATUS = {
  TEMPORARY_IMPORT: 1,
  TEMPORARY_EXPORT: 2,
  IMPORT: 3,
  EXPORT: 4,
  TEMPORARY_EXPORT_TEMPORARY_IMPORT: 5,
};

export const COLOR_STATUS = {
  TEMPORARY_IMPORT: "#ffa940",
  TEMPORARY_EXPORT: "#00695c",
  IMPORT: "#ffec3d",
  EXPORT: "#9254de",
  TEMPORARY_EXPORT_TEMPORARY_IMPORT: "#468B97",
};

export const QUALITY = {
  QUALITY_1: "1",
  QUALITY_2: "2",
  QUALITY_3: "3",
  QUALITY_4: "4",
};

export const priceRegex = /^[^a-zA-Z\W]*\.?\d*$/;

export type TabMenu = {
  tabName: string;
  name: string;
  hash : string[],
  navLink : string,
  url : string,
  component: any

}

export type FormatTypeTable<T> = T & {
  children?: FormatTypeTable<T>[];
};

export const nameOf =
  <T>() =>
  (name: keyof T): any =>
    name;