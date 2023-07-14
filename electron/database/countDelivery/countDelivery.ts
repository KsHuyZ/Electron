import { Moment } from "moment";
import { runQuery, runQueryGetData, runQueryReturnID } from "../../utils";

const countDelivery = {
  createCountDelivery: async (
    idWarehouse: number,
    name: string,
    nature: string,
    note: string,
    total: string | number,
    date: Moment | null
  ) => {
    const createQuery =
      "INSERT INTO CoutDelivery(id_WareHouse, name, Nature, Note,Total,date) VALUES (?,?,?,?,?,?)";
    try {
      const ID = await runQueryReturnID(createQuery, [
        idWarehouse,
        name,
        nature,
        note,
        total,
        date,
      ]);
      return ID;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  countDeliveryRow: async () => {
    const query = "select Count(ID) from CoutDelivery";
    const row: any = await runQueryGetData(query, []);
    return row["Count(ID)"];
  },
  createDeliveryItem: async (
    idCoutDelivery: number | unknown,
    idIntermediary: number | unknown
  ) => {
    const createQuery =
      "INSERT INTO Delivery_Item(id_Cout_Delivery,id_Intermediary) VALUES(?,?)";
    try {
      await runQuery(createQuery, [idCoutDelivery, idIntermediary]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

export default countDelivery;
