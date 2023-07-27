import { DataType } from "../types";

const formReport = ({
  items,
  warehouse,
}: {
  items: DataType[];
  warehouse: string;
}) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const time = `${hour}:${minute}:${second}`;
  const today = `${day}/${month}/${year}`;
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <style>
        .header-top {
            display: flex;
        }
    
        .header-top .center-top {
            flex: 8;
            text-align: center;
        }
    
        .right-top {
            flex: 1;
            text-align: right;
        }
    
        .header-top .left-top {
            flex: 2;
            text-align: center;
        }
    
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
    </style>
    
    <body>
        <div class="header-top">
            <div class="left-top">
                <h3 class="name" style="text-transform: uppercase;">Quân khu 5 Cục hậu cần</h3>
                <div>Kho: <span style="text-transform: uppercase;font-weight: bold;">${warehouse}</span>
                </div>
            </div>
            <div class="center-top">
                <h1 style="text-transform: uppercase;">Báo cáo tồn số lượng</h1>
                <p>Tính đến ${time} ngày ${today}</p>
            </div>
            <div class="right-top">
    
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Số TT</th>
                    <th>Tên hàng</th>
                    <th>Quy cách</th>
                    <th>Nước SX</th>
                    <th>Chất lượng</th>
                    <th>ĐVT</th>
                    <th>NHSX</th>
                    <th>NHSD</th>
                    <th>Giá lẻ</th>
                    <th>Tồn đầu</th>
                    <th>Chờ nhập</th>
                    <th>Chờ xuất</th>
                    <th>Tồn cuối</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(
                  (
                    {
                      name,
                      quantity,
                      quantity_plane,
                      quality,
                      unit,
                      date_expried,
                      status,
                      price,
                    },
                    index
                  ) =>
                    `<tr>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td></td>
                    <td>Việt Nam</td>
                    <td>${quality}</td>
                    <td>${unit}</td>
                    <td></td>
                    <td>${date_expried}</td>
                    <td>${price}</td>
                    <td>${quantity_plane}</td>
                    <td>${status === 1 ? quantity : ""}</td>
                    <td>${status === 5 ? quantity : ""}</td>
                    <td>${quantity}</td>
                </tr>`
                )}
            </tbody>
        </table>
    
    </body>
    
    </html>`;
};

export default formReport;
