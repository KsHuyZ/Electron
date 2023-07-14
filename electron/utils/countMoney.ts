type DataType = {
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
  warehouseName?: string;
};

export const countMoney = (allProductItem: DataType[]) => {
  let value = 0;
  allProductItem.map((product: DataType) => {
    value += product.price * product.quantity;
  });
  return value;
};
