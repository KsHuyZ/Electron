import React from 'react'

export const PhieuNhapKho = React.forwardRef((props, ref) => {


    const data = [
        {
            id: 1,
            name: 'Product 1',
            quantity: 100,
            quality_plane: 'High',
            quantity_real: 95,
            unit: 'pcs',
            date_exp: '2023-12-31',
            price: 10.5,
            warehouse: 'Warehouse A'
        },
        {
            id: 1,
            name: 'Product 1',
            quantity: 100,
            quality_plane: 'High',
            quantity_real: 95,
            unit: 'pcs',
            date_exp: '2023-12-31',
            price: 10.5,
            warehouse: 'Warehouse A'
        },
        {
            id: 1,
            name: 'Product 1',
            quantity: 100,
            quality_plane: 'High',
            quantity_real: 95,
            unit: 'pcs',
            date_exp: '2023-12-31',
            price: 10.5,
            warehouse: 'Warehouse A'
        },
        {
            id: 1,
            name: 'Product 1',
            quantity: 100,
            quality_plane: 'High',
            quantity_real: 95,
            unit: 'pcs',
            date_exp: '2023-12-31',
            price: 10.5,
            warehouse: 'Warehouse A'
        },
        {
            id: 2,
            name: 'Product 2',
            quantity: 50,
            quality_plane: 'Medium',
            quantity_real: 48,
            unit: 'pcs',
            date_exp: '2023-11-30',
            price: 7.2,
            warehouse: 'Warehouse B'
        },
        {
            id: 2,
            name: 'Product 2',
            quantity: 50,
            quality_plane: 'Medium',
            quantity_real: 48,
            unit: 'pcs',
            date_exp: '2023-11-30',
            price: 7.2,
            warehouse: 'Warehouse B'
        },
        {
            id: 2,
            name: 'Product 2',
            quantity: 50,
            quality_plane: 'Medium',
            quantity_real: 48,
            unit: 'pcs',
            date_exp: '2023-11-30',
            price: 7.2,
            warehouse: 'Warehouse B'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        {
            id: 3,
            name: 'Product 3',
            quantity: 200,
            quality_plane: 'Low',
            quantity_real: 180,
            unit: 'pcs',
            date_exp: '2023-09-15',
            price: 5.0,
            warehouse: 'Warehouse C'
        },
        // Thêm các đối tượng (objects) khác vào đây nếu cần
    ];

    const groupByWarehouse = data.reduce((acc: any, item) => {
        const { warehouse, ...rest } = item;
        if (!acc[warehouse]) {
            acc[warehouse] = [rest];
        } else {
            acc[warehouse].push(rest);
        }
        return acc;
    }, {});

    function formatDateToDDMMYYYY(date: Date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        < div ref={ref} style={{ margin: 8, display: 'block', width: "99%" }
        }>
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
                    <h3 className="left" style={{ textAlign: "center" }}>
                        <div>QUÂN KHU 5</div>
                        <div> CỤC HẬU CẦN</div>
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
                            Ngày: {formatDateToDDMMYYYY(new Date)}
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
                    {


                        Object.entries(groupByWarehouse).map(([warehouse, products]: any) => (
                            <>
                                <th>
                                    <td style={{ padding: 8, textAlign: "left" }}>{warehouse}</td>
                                </th>
                                {products.map((item: any, index: number) => (
                                    <tr>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            style={{
                                                maxWidth: 300,
                                                border: "1px solid black",
                                                padding: 8,
                                                textAlign: "left"
                                            }}
                                        >
                                            {item.name}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.unit}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.quality_plane}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.date_exp}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.quantity}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.quantity_real}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {item.price}
                                        </td>
                                        <td
                                            style={{ border: "1px solid black", padding: 8, textAlign: "left" }}
                                        >
                                            {Intl.NumberFormat().format(item.price * item.quantity_real)}
                                        </td>

                                    </tr>
                                ))}
                            </>
                        ))

                    }

                </tbody>
            </table>
            <div className="money" style={{ width: "40%" }}>
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

        </div >
    )
})