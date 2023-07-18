import { Moment } from "moment";
import { runQuery, runQueryGetData, runQueryReturnID } from "../../utils";

const countCoupon = {
  createCountCoupon: async (
    id_Source: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null,
    title: string
  ) => {
    const createQuery =
      "INSERT INTO CoutCoupon(id_Source, name, Nature, Note,Total,date,title) VALUES (?,?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        id_Source,
        name,
        nature,
        note,
        total,
        date,
        title
      ]);
      return ID;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  countCouponRow: async () => {
    const query = "select Count(ID) from CoutCoupon";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createCouponItem: async (
    idCoutCoupon: number | unknown,
    idIntermediary: number | unknown
  ) => {
    const createQuery =
      "INSERT INTO Coupon_Item(id_Cout_Coupon,id_Intermediary) VALUES(?,?)";
    try {
      await runQuery(createQuery, [idCoutCoupon, idIntermediary]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

export default countCoupon;
