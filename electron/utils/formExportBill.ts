import { dateStringReverse } from ".";
import countDelivery from "../database/countDelivery/countDelivery";
import { DataType } from "../types";
import { countMoney } from "./countMoney";
import toVietnamese from "./toVietnamese";

export const formExportBill = async (data: {
  items: DataType[];
  name: string;
  note: string;
  nature?: string;
  ID?: number;
  total: number;
  date: any;
  title: string;
  temp?: boolean;
  nameSource: string;
}) => {
  const { items, name, note, nature, total, date, title, nameSource, ID } =
    data;
  const { countDeliveryRow } = countDelivery;
  const totalMoney = countMoney(items);
  const count = await countDeliveryRow();

  const groupByWarehouse = data.items.reduce((acc: any, item: any) => {
    const { nameWareHouse, ...rest } = item;
    if (!acc[nameWareHouse]) {
      acc[nameWareHouse] = [rest];
    } else {
      acc[nameWareHouse].push(rest);
    }
    return acc;
  }, {});

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu xuất kho</title>
</head>

<body>
<style>
.header {
    margin: auto;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 90%;
    height: 250px;
  }
  /* Header - top */
  .header .header-top {
    display: flex;
  }
  .header .header-top .center-top {
    flex: 8;
    text-align: center;
  }
  .header .header-top .right-top {
    flex: 1;
    text-align: right;
  }
  .header .header-top .left-top {
    flex: 2;
    text-align: center;
  }
  /* Header- down */
  .header-down {
    display: flex;
  }
  
  .header .header-down .confirmation-box {
    flex: 2;
    height: 100px;
    border: 1px dashed black;
    padding-top: 0;
    line-height: 15px;
    position: relative;
  }
  
  .header .header-down .confirmation-label {
    position: absolute;
    top: -7%;
    font-size: 15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 0 10px;
    white-space: nowrap;
  }
  .header-down .center-down {
    flex: 6;
    transform: translateX(25%);
  }
  .header-down .right-down {
    flex: 3;
  }
  .header-down .right-down .page {
    text-align: right;
  }
  
  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: auto;
    margin-top: 20px;
  }
  
  table,
  th,
  td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  table th {
    background-color: #f2f2f2;
    text-align: center;
  }
  /* Footer */
  .money {
    width: 40%;
  }
  .money .money-fix {
    display: flex;
    margin-left: 10%;
    justify-content: space-between;
  }
  .money .thanhtien {
    margin-left: 10%;
  }
  .date {
    display: flex;
    width: 90%;
    margin: 0 auto 0;
  }
  .date .date1 {
    flex: 50%;
    text-align: left;
  }
  .date .date2 {
    flex: 50%;
    text-align: right;
  }
  .single {
    display: flex;
    width: 100%;
  }
  .single h4 {
    flex: 20%;
    text-align: center;
  }
</style>
  <!-- Header -->
  <div class="header">
    <div class="header-top">
      <div class="left-top">
        <h3 class="name">${data.name.toUpperCase() ?? ""}</h3>
      </div>
      <div class="center-top">
        <h1>PHIẾU ${data.temp ? "TẠM" : ""} XUẤT KHO</h1>
      </div>
      <div class="right-top">
        <p class="right">Số lệnh: ${ID ? ID : Number(count) + 1}</p>
      </div>
    </div>
    <div class="header-down">
      <div class="confirmation-box">
        <span class="confirmation-label">Xác nhận thanh toán</span>
      </div>
      <div class="center-down">
        <div class="dvn">
          <p>Đơn vị nhận: ${nameSource} </p>
        </div>
        <div class="capTheo">
          <p>Cấp theo: ${title}</p>
        </div>
        <div class="nguoiNhan">
          <p>Người nhận: </p>
        </div>
        <div class="ngayDongGoi">
          <p>Ngày đóng gói: </p>
        </div>
      </div>
      <div class="right-down">
        <p class="date-ex">Có giá trị đến ......./......./......</p>
        <p class="tinhchat">Tính chất: Nhập theo KH</p>
        <p class="intro">Giấy gt....................do.........................cấp</p>
        <p class="vanchuyen">Hàng do...................................vận chuyển</p>
      
      </div>
    </div>
  </div>
  <!-- Table -->
  <table>
    <tr>
      <th rowspan="2">Số TT</th>
      <th rowspan="2" style="max-width: 100px;">Tên hàng</th>
      <th rowspan="2">ĐVT</th>
      <th rowspan="2">CL</th>
      <th rowspan="2">Hạn Dùng Năm SX</th>
      <th colspan="2">Số lượng</th>
      <th rowspan="2">Giá lẻ</th>
      <th rowspan="2">Thành tiền</th>
      <th rowspan="2">Ghi chú</th>
    </tr>
    <tr>
      <th>Kế hoạch thực hiện</th>
      <th>Thực hiện</th>
    </tr>

    ${Object.entries(groupByWarehouse).map(
      ([nameWareHouse, products]: any) =>
        ` <tr>
      <td style={{ padding: 8, textAlign: "left" }} colspan="9">${nameWareHouse}</td>
    </tr>
    ${products.map(
      (item: any, index: number) =>
        `<tr>
        <td>${index + 1}</td>
        <td style="max-width: 300px;">${item.name}</td>
        <td>${item.unit}</td>
        <td>${item.quality}</td>
        <td>${item.date_expried}</td>
        <td>${item.quantity_plane}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td>${new Intl.NumberFormat().format(item.price * item.quantity)}</td>
      </tr>`
    )}`
    )}


  </table>
  <div class="money">
    <div class="money-fix">
      <p><b>Tổng cộng: ${items.length} khoản</b></p>
      <p><b>Thành tiền: ${new Intl.NumberFormat().format(
        totalMoney
      )} VNĐ</b></p>
    </div>
    <p class="thanhtien"><b>(${toVietnamese(totalMoney)} Việt Nam Đồng)</b></p>
  </div>
  <p style="margin-left: 3%;">Ghi chú: ${data.note ?? ""}</p>
  <div class="date">
    <p class="date1">Giao nhận ngày...tháng...năm... </p>
    <p class="date2">Ngày ${dateStringReverse(
      data.date,
      true,
      2
    )} tháng  ${dateStringReverse(data.date, true, 1)} năm  ${dateStringReverse(
    data.date,
    true,
    0
  )}</p>
  </div>
  <div class="single">
    <h4>NGƯỜI GIAO</h4>
    <h4>NGƯỜI NHẬN</h4>
    <h4>PT DƯỢC CHÍNH</h4>
    <h4>TRƯỞNG PHÒNG QUÂN Y</h4>
    <h4>THỦ TRƯỞNG ĐƠN VỊ</h4>
  </div>
</body>

</html>`;
};
