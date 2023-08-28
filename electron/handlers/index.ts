import { BrowserWindow } from "electron";
import auth from "./auth/auth";
import countCoupon from "./countCoupon/countCoupon";
import countDelivery from "./countDelivery/countDelivery";
import Source from "./Source/Source";
import WareHouse from "./WareHouse-Receiving/WareHouse-Receiving";
import wareHouseItem from "./wareHouseItem/wareHouseItem";
import tempCountCoupon from "./tempCountCoupon/tempCountCoupon";
import tempCountDelivery from "./tempCountDelivery/tempCountDelivery";

const handlerRequest = (mainScreen: BrowserWindow) => {
  Source(mainScreen);
  auth(mainScreen);
  WareHouse(mainScreen);
  wareHouseItem(mainScreen);
  countDelivery(mainScreen);
  countCoupon(mainScreen);
  tempCountCoupon();
  tempCountDelivery();
};

export default handlerRequest;
