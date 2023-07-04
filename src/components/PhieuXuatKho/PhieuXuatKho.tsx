import React from 'react'
import "./phieuxuat.scss"
const PhieuXuatKho = React.forwardRef((props, ref) => {
    return (
        <div ref={ref} style={{ margin: 8 }} className='phieu-xuat'>
            <div className="header">
                <div className="header-top">
                    <div className="left-top">
                        <h3 className="name">
                            QUÂN KHU 5 <br /> CỤC HẬU CẦN
                        </h3>
                    </div>
                    <div className="center-top">
                        <h1>PHIẾU XUẤT KHO</h1>
                    </div>
                    <div className="right-top">
                        <p className="right">Số lệnh: 519</p>
                    </div>
                </div>
                <div className="header-down">
                    <div className="confirmation-box">
                        <span className="confirmation-label">Xác nhận thanh toán</span>
                    </div>
                    <div className="center-down">
                        <div className="dvn">
                            <p>Đơn vị nhận: BO THAM MUU </p>
                        </div>
                        <div className="capTheo">
                            <p>Cấp theo: Cong dan nhap ngu 2023</p>
                        </div>
                        <div className="nguoiNhan">
                            <p>Người nhận: </p>
                        </div>
                        <div className="ngayDongGoi">
                            <p>Ngày đóng gói:</p>
                        </div>
                    </div>
                    <div className="right-down">
                        <p className="date-ex">Có giá trị đến ......./......./......</p>
                        <p className="tinhchat">Tính chất: Nhập theo KH</p>
                        <p className="intro">
                            Giấy gt....................do..................cấp
                        </p>
                        <p className="vanchuyen">
                            Hàng do...............................vận chuyển
                        </p>
                        <div className="page">Trang 1</div>
                    </div>
                </div>
            </div>
            {/* Table */}
            <table>
                <tbody>
                    <tr>
                        <th rowSpan={2}>Số TT</th>
                        <th rowSpan={2} style={{ maxWidth: 100 }}>
                            Tên hàng
                        </th>
                        <th rowSpan={2}>ĐVT</th>
                        <th rowSpan={2}>CL</th>
                        <th rowSpan={2}>Hạn Dùng Năm SX</th>
                        <th colSpan={2}>Số lượng</th>
                        <th rowSpan={2}>Giá lẻ</th>
                        <th rowSpan={2}>Thành tiền</th>
                        <th rowSpan={2}>Ghi chú</th>
                    </tr>
                    <tr>
                        <th>Kế hoạch thực hiện</th>
                        <th>Thực hiện</th>
                    </tr>
                    <tr>
                        <td>001</td>
                        <td style={{ maxWidth: 300 }}>Máy tính xách tay</td>
                        <td>5</td>
                        <td>10,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                    </tr>
                    <tr>
                        <td>001</td>
                        <td style={{ maxWidth: 300 }}>Máy tính xách tay</td>
                        <td>5</td>
                        <td>10,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                    </tr>
                    <tr>
                        <td>001</td>
                        <td style={{ maxWidth: 300 }}>Máy tính xách tay</td>
                        <td>5</td>
                        <td>10,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                    </tr>
                    <tr>
                        <td>001</td>
                        <td style={{ maxWidth: 300 }}>Máy tính xách tay</td>
                        <td>5</td>
                        <td>10,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                        <td>50,000,000 VND</td>
                    </tr>
                </tbody>
            </table>
            {/* footer */}
            <div className="money">
                <div className="money-fix">
                    <p>
                        <b>Tổng cộng: 4 khoản</b>
                    </p>
                    <p>
                        <b>Thành tiền: 461.000.000</b>
                    </p>
                </div>
                <p className="thanhtien">
                    <b>(Bốn trăm sáu mươi mốt triệu đồng)</b>
                </p>
            </div>
            <p style={{ marginLeft: "3%" }}>Ghi chú: (HD 284 ngay 22/12/2022)</p>
            <div className="date">
                <p className="date1">Giao nhận ngày...tháng...năm...</p>
                <p className="date2">Ngày 31 tháng 12 năm 2022</p>
            </div>
            <div className="single">
                <h4>NGƯỜI GIAO</h4>
                <h4>NGƯỜI NHẬN</h4>
                <h4>PT DƯỢC CHÍNH</h4>
                <h4>TRƯỞNG PHÒNG QUÂN Y</h4>
                <h4>THỦ TRƯỞNG ĐƠN VỊ</h4>
            </div>
        </div >
    )
})

export default PhieuXuatKho
