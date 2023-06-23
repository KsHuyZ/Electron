import React from 'react'

export const PhieuNhapKho = React.forwardRef((props, ref) => {
    return (

        <div ref={ref}>
            <div
                className="header"
                style={{
                    margin: "auto",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    width: "90%"
                }}
            >
                <div className="header-top" style={{ display: "flex" }}>
                    <h3 className="left" style={{ flex: 1, textAlign: "center" }}>
                        QUÂN KHU 5 CỤC HẬU CẦN
                    </h3>
                    <div className="center" style={{ flex: 8 }}>
                        <h1 style={{ textAlign: "center" }}>PHIẾU NHẬP KHO</h1>
                        <div className="inputnguonkhach" style={{ textAlign: "center" }}>
                            <div className="nguonnhap">
                                <p>Nguồn nhập: CONG TY TNHH &amp; SX THIET BI Y TE HOANG NGUYEN</p>
                            </div>
                            <div className="khachhang">
                                <p>Nhập theo khách hàng: Mua sam Thoa Thuan khung 2022</p>
                            </div>
                            <p>Hợp đồng số:</p>
                        </div>
                    </div>
                    <div className="right-head">
                        <p className="right" style={{ flex: 1, textAlign: "right" }}>
                            Số lệnh: 098
                        </p>
                        <p className="right" style={{ flex: 1, textAlign: "right" }}>
                            Ngày:
                            <span id="printDate" />
                        </p>
                    </div>
                </div>
                <p className="tinhchat" style={{ textAlign: "right" }}>
                    Tính chất: Nhập theo KH
                </p>
            </div>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    margin: "auto",
                    marginTop: 20,
                    border: "1px solid black",
                    padding: 8,
                    textAlign: "left"
                }}
            >
                <tbody>
                    <tr>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Số TT
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Tên hàng
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            ĐVT
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            CL
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Hạn Dùng Năm SX
                        </th>
                        <th
                            colSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Số lượng
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Giá lẻ
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Thành tiền
                        </th>
                        <th
                            rowSpan={2}
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Ghi chú
                        </th>
                    </tr>
                    <tr>
                        <th
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Kế hoạch thực hiện
                        </th>
                        <th
                            style={{
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "center",
                                backgroundColor: "#f2f2f2"
                            }}
                        >
                            Thực hiện
                        </th>
                    </tr>
                    <tr>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            001
                        </td>
                        <td
                            style={{
                                maxWidth: 300,
                                border: "1px solid black",
                                padding: 8,
                                textAlign: "left"
                            }}
                        >
                            Máy tính xách tay
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            5
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            10,000,000 VND
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            50,000,000 VND
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            50,000,000 VND
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            50,000,000 VND
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            50,000,000 VND
                        </td>
                        <td
                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                        >
                            50,000,000 VND
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="money" style={{ width: "30%" }}>
                <div
                    className="money-fix"
                    style={{
                        display: "flex",
                        marginLeft: "10%",
                        justifyContent: "space-between"
                    }}
                >
                    <p>
                        <b>Tổng cộng: 4 khoản</b>
                    </p>
                    <p>
                        <b>Thành tiền: 461.000.000</b>
                    </p>
                </div>
                <p className="thanhtien" style={{ marginLeft: "10%" }}>
                    <b>(Bốn trăm sáu mươi mốt triệu đồng)</b>
                </p>
            </div>
            <p style={{ marginLeft: "3%" }}>Ghi chú: (HD 284 ngay 22/12/2022)</p>
            <div
                className="date"
                style={{ display: "flex", width: "90%", margin: "0 auto 0" }}
            >
                <p className="date1" style={{ flex: "50%", textAlign: "left" }}>
                    Giao nhận ngày...tháng...năm...
                </p>
                <p className="date2" style={{ flex: "50%", textAlign: "right" }}>
                    Ngày 31 tháng 12 năm 2022
                </p>
            </div>
            <div className="single" style={{ display: "flex", width: "100%" }}>
                <h4 style={{ flex: "20%", textAlign: "center" }}>NGƯỜI GIAO</h4>
                <h4 style={{ flex: "20%", textAlign: "center" }}>NGƯỜI NHẬN</h4>
                <h4 style={{ flex: "20%", textAlign: "center" }}>PT DƯỢC CHÍNH</h4>
                <h4 style={{ flex: "20%", textAlign: "center" }}>TRƯỞNG PHÒNG QUÂN Y</h4>
                <h4 style={{ flex: "20%", textAlign: "center" }}>THỦ TRƯỞNG ĐƠN VỊ</h4>
            </div>
        </div>


    )
})

