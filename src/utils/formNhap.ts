const formNhap = ` <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phiếu nhập kho</title>
</head>

<body onload="printCurrentDate()" style="font-family: Arial, sans-serif">
  <!-- Header -->
  <div class="header" style="
        margin: auto;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        width: 90%;
      ">
    <div class="header-top" style="display: flex">
      <h3 class="left" style="flex: 1; text-align: center">
        QUÂN KHU 5 CỤC HẬU CẦN
      </h3>
      <div class="center" style="flex: 8">
        <h1 style="text-align: center">PHIẾU NHẬP KHO</h1>
        <div class="inputnguonkhach" style="text-align: center">
          <div class="nguonnhap">
            <p>Nguồn nhập: CONG TY TNHH & SX THIET BI Y TE HOANG NGUYEN</p>
          </div>
          <div class="khachhang">
            <p>Nhập theo khách hàng: Mua sam Thoa Thuan khung 2022</p>
          </div>
          <p>Hợp đồng số:</p>
        </div>
      </div>
      <div class="right-head">
        <p class="right" style="flex: 1; text-align: right">Số lệnh: 098</p>
        <p class="right" style="flex: 1; text-align: right">
          Ngày:
          <span id="printDate"></span>
        </p>
      </div>
    </div>
    <p class="tinhchat" style="text-align: right">Tính chất: Nhập theo KH</p>
  </div>

  <table style="
        width: 100%;
        border-collapse: collapse;
        margin: auto;
        margin-top: 20px;
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      ">
    <tr>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Số TT
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          "style="max-width: 100px">
        Tên hàng
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        ĐVT
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        CL
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Hạn Dùng Năm SX
      </th>
      <th colspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Số lượng
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Giá lẻ
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Thành tiền
      </th>
      <th rowspan="2" style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Ghi chú
      </th>
    </tr>
    <tr>
      <th style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Kế hoạch thực hiện
      </th>
      <th style="
            border: 1px solid black;
            padding: 8px;
            text-align: left;
            background-color: #f2f2f2;
            text-align: center;
          ">
        Thực hiện
      </th>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        001
      </td>
      <td style="
            max-width: 300px;
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          ">
        Máy tính xách tay
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        5
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        10,000,000 VND
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        50,000,000 VND
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        50,000,000 VND
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        50,000,000 VND
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        50,000,000 VND
      </td>
      <td style="border: 1px solid black; padding: 8px; text-align: left">
        50,000,000 VND
      </td>
    </tr>
  </table>

  <div class="money" style="width: 30%">
    <div class="money-fix" style="display: flex; margin-left: 10%; justify-content: space-between">
      <p><b>Tổng cộng: 4 khoản</b></p>
      <p><b>Thành tiền: 461.000.000</b></p>
    </div>
    <p class="thanhtien" style="margin-left: 10%">
      <b>(Bốn trăm sáu mươi mốt triệu đồng)</b>
    </p>
  </div>
  <p style="margin-left: 3%">Ghi chú: (HD 284 ngay 22/12/2022)</p>
  <div class="date" style="display: flex; width: 90%; margin: 0 auto 0">
    <p class="date1" style="flex: 50%; text-align: left">
      Giao nhận ngày...tháng...năm...
    </p>
    <p class="date2" style="flex: 50%; text-align: right">
      Ngày 31 tháng 12 năm 2022
    </p>
  </div>
  <div class="single" style="display: flex; width: 100%">
    <h4 style="flex: 20%; text-align: center">NGƯỜI GIAO</h4>
    <h4 style="flex: 20%; text-align: center">NGƯỜI NHẬN</h4>
    <h4 style="flex: 20%; text-align: center">PT DƯỢC CHÍNH</h4>
    <h4 style="flex: 20%; text-align: center">TRƯỞNG PHÒNG QUÂN Y</h4>
    <h4 style="flex: 20%; text-align: center">THỦ TRƯỞNG ĐƠN VỊ</h4>
  </div>
</body>

</html>`;

export default formNhap;
