import auth from "./auth/auth";
import donViNhan from "./donViNhan/donViNhan";
import nguonHang from "./nguonHang/nguonHang";
import wareHouse from "./wareHouse/wareHouse";
import wareHouseItem from "./wareHouseItem/wareHouseItem";

const handlerRequest = () => {
  nguonHang();
  auth();
  wareHouse();
  wareHouseItem();
  donViNhan();
};

export default handlerRequest;
