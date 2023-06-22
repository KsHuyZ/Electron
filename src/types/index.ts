export type ModalProps = {
  closeModal: () => void;
  setLoading: () => void;
};

export type ResponseIpc<T> = 
  {
    rows: T;
    total?: number;
  }
;

export type Pagination = {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
};

export type TableData<T> = Pagination & ResponseIpc<T>;

export type ItemSource= {
  ID: number;
  name: string;
  address: string;
  phone: string;
}


export type OptionSelect = {
  label: string,
  value: any
};

export const STATUS = {
  TEMPORARY_IMPORT: 1,
  TEMPORARY_EXPORT: 2,
  IMPORT: 3,
  EXPORT: 4,
}

export const COLOR_STATUS = {
  TEMPORARY_IMPORT: '#ffa940',
  TEMPORARY_EXPORT: '#00695c',
  IMPORT: '#ffec3d',
  EXPORT: '#9254de',
}

export const QUALITY = {
  QUALITY_1 : '1',
  QUALITY_2 : '2',
  QUALITY_3 : '3',
  QUALITY_4 : '4',
};

export const priceRegex = /^[^a-zA-Z\W]*\.?\d*$/;