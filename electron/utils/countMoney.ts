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

export const countMoney = (allProductItem: DataType[], isTemp?: boolean) => {
  return allProductItem.reduce((total: number, product: DataType) => {
    return (
      total +
      product.price * (!isTemp ? product.quantity : product.quantity_real)
    );
  }, 0);
};
