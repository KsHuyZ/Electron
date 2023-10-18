import { DataType } from "../types";

export const countMoney = (allProductItem: DataType[], isTemp?: boolean) => {
  return allProductItem.reduce((total: number, product: DataType) => {
    return total + product.price * product.quantity;
  }, 0);
};
