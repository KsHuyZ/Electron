import countCoupon from "../database/countCoupon/countCoupon";
import { DataType } from "../types";
import { countMoney } from "./countMoney";
import toVietnamese from "./toVietnamese";
import { dateStringReverse } from ".";

export const formImportBill = async (data: {
  items: DataType[];
  name: string;
  note: string;
  nature: string;
  total: number;
  date: any;
  title: string;
  ID?: number;
  temp?: boolean;
  nameSource: string;
}) => {
  const { countCouponRow } = countCoupon;
  const totalMoney = countMoney(data.items);
  const count = await countCouponRow();

  const groupByWarehouse = data.items.reduce((acc: any, item: any) => {
    const { nameWareHouse, ...rest } = item;
    if (!acc[nameWareHouse]) {
      acc[nameWareHouse] = [rest];
    } else {
      acc[nameWareHouse].push(rest);
    }
    return acc;
  }, {});

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu nhập kho</title>
</head>

<body>
<style>
    .header {
    margin: auto;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 90%;
    }
</style>
<div style="margin: auto; display: block; width: 1123px; height: 794px;" id="phieu-nhap-kho">
   
    <div style="margin: auto; align-items: center; justify-content: space-between; margin-bottom: 20px; width: 90%;" class="header">
        <div style="display: flex;" class="header-top">
            <h3 style="text-align: center;" class="left">
                <div>${data.name.toUpperCase() ?? ""}</div>
            </h3>
            <div style="flex: 8;" class="center">
                <h1 style="text-align: center;">PHIẾU${
                  data.temp ? " Tạm" : ""
                } NHẬP KHO</h1>
                <div style="text-align: center;" class="inputnguonkhach">
                    <div class="nguonnhap">
                        <p>Nguồn nhập: ${
                          data.nameSource.toUpperCase() ?? ""
                        }</p>
                    </div>
                    <div class="khachhang">
                    <p>${data.nature ?? ""}: ${data.title}</p>
                    </div>
                    <p>Hợp đồng số:</p>
                </div>
            </div>
            <div class="right-head">
                <p style="flex: 1; text-align: right;" class="right">Số lệnh: ${
                  data.ID ? data.ID : Number(count) + 1
                }</p>
                <p style="flex: 1; text-align: right;" class="right">Ngày: <span id="printDate">${
                  dateStringReverse(data.date, false) ?? ""
                }</span></p>
            </div>
        </div>
        <p style="text-align: right;" class="tinhchat">Tính chất: ${
          data.nature
        }</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: auto; margin-top: 20px; border: 1px solid black; padding: 8px; text-align: left; border-collapse: collapse;" class="data-table">
        <tbody>
            <tr>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Số TT</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Tên hàng</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">ĐVT</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">CL</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Hạn Dùng Năm SX</th>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Số lượng</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Giá lẻ</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Thành tiền</th>
                <th rowspan="2" style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Ghi chú</th>
            </tr>
            <tr>
                <th style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Kế hoạch thực hiện</th>
                <th style="border: 1px solid black; padding: 8px; text-align: center; background-color: #f2f2f2;">Thực hiện</th>
            </tr>

            ${Object.entries(groupByWarehouse).map(
              ([nameWareHouse, products]: any) =>
                `
              
              <th>
                  <td style={{ padding: 8, textAlign: "left" }}>${nameWareHouse}</td>
              </th>
              ${products.map(
                (item: any, index: number) =>
                  `
                <tr>
                <td style="max-width:300; border:1px solid black; padding: 8px; text-align:center;">${
                  index + 1
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.name
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.unit
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.quality
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.date_expried
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.quantity_plane
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${
                  item.quantity
                }</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${new Intl.NumberFormat().format(
                  item.price
                )}</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;">${new Intl.NumberFormat().format(
                  item.totalPrice
                )}</td>
                <td style="border:1px solid black; padding: 8px; text-align:center;"></td>
            </tr>
                `
              )}
              
              `
            )}
            
        
    
        </tbody>
    </table>
    <!-- Footer -->
    <div style="width: 40%;" class="money">
        <div style="display: flex; margin-left: 10%; justify-content: space-between;" class="money-fix">
            <p><b>Tổng cộng: ${data.items.length ?? 0} khoản</b></p>
            <p><b>Thành tiền: ${new Intl.NumberFormat().format(
              totalMoney
            )} đ</b></p>
        </div>
        <p style="margin-left: 10%;" class="thanhtien"><b>(${toVietnamese(
          totalMoney
        )} Việt Nam Đồng)</b></p>
    </div>
    <p style="margin-left: 3%;">Ghi chú: ${data.note ?? ""}</p>
    <div style="display: flex; width: 90%; margin: 0 auto 0;" class="date">
        <p style="flex: 50%; text-align: left;" class="date1">Giao nhận ngày...tháng...năm...</p>
        <p style="flex: 50%; text-align: right;" class="date2">Ngày ${dateStringReverse(
          data.date,
          true,
          2
        )} tháng  ${dateStringReverse(
    data.date,
    true,
    1
  )} năm  ${dateStringReverse(data.date, true, 0)}</p>
    </div>
    <div style="display: flex; width: 100%;" class="single">
        <h4 style="flex: 20%; text-align: center;">NGƯỜI GIAO</h4>
        <h4 style="flex: 20%; text-align: center;">NGƯỜI NHẬN</h4>
        <h4 style="flex: 20%; text-align: center;">PT DƯỢC CHÍNH</h4>
        <h4 style="flex: 20%; text-align: center;">TRƯỞNG PHÒNG QUÂN Y</h4>
        <h4 style="flex: 20%; text-align: center;">THỦ TRƯỞNG ĐƠN VỊ</h4>
    </div>
</div>
</body>

</html>`;
};
