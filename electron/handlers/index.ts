import auth from "./auth/auth";
import Source from "./Source/Source";
import WareHouse from "./WareHouse-Receiving/WareHouse-Receiving";
import wareHouseItem from "./wareHouseItem/wareHouseItem";

const handlerRequest = () => {
  Source();
  auth();
  WareHouse();
  wareHouseItem();
};

export default handlerRequest;
