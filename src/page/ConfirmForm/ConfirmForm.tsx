import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Input, Select, Space, Table, Button } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import "./confirm-form.scss"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import docso from '@/utils/toVietnamese';
import { ipcRenderer } from 'electron';
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { PhieuNhapKho } from "@/components/PhieuNhapKho/PhieuNhapKho.jsx"
import formNhap from '@/utils/formNhap';
// import 'print-js/dist/print.css';
// import printJS from 'print-js';
// import printer from "electron-printer";
// const printers = await printer.getPrinters() 
// import { Printer, print, getPrinters, PrintersResponse } from 'electron-printer';



interface ComponentToPrintProps {
    // Props của ComponentToPrint (nếu có)
}

type DataType = {
    id: string;
    idWarehouse: string;
    idNguonHang: string;
    name: string;
    price: number;
    quantity_plane: number;
    quantity_real: number;
    unit: string;
    quality: number;
    date_expiry: string;
    date_create_at: string;
    date_update_at: string;
    note: string;
    status: string;
}

const MockData = [
    {
        "id": "1",
        "idWarehouse": "A001",
        "name": "Áo khoác",
        "price": 50.0,
        "unit": "cái",
        "quality": 1,
        "idNguonHang": "NH001",
        "date_expiry": "2023-12-31",
        "date_create_at": "2023-06-01",
        "date_update_at": "2023-06-10",
        "note": "Mẫu mới",
        "quantity_plane": 100,
        "quantity_real": 95,
        "status": "Tạm nhập"
    },
    {
        "id": "2",
        "idWarehouse": "A001",
        "name": "Quần jeans",
        "price": 35.0,
        "unit": "cái",
        "quality": 1,
        "idNguonHang": "NH002",
        "date_expiry": "2023-12-31",
        "date_create_at": "2023-05-15",
        "date_update_at": "2023-06-05",
        "note": "Size M",
        "quantity_plane": 50,
        "quantity_real": 45,
        "status": "Tạm nhập"
    },
    {
        "id": "3",
        "idWarehouse": "A002",
        "name": "Giày thể thao",
        "price": 80.0,
        "unit": "đôi",
        "quality": 1,
        "idNguonHang": "NH003",
        "date_expiry": "2023-12-31",
        "date_create_at": "2023-06-05",
        "date_update_at": "2023-06-15",
        "note": "",
        "quantity_plane": 80,
        "quantity_real": 80,
        "status": "Tạm nhập"
    }
]

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Tên mặt hàng',
        dataIndex: 'name',
    },
    {
        title: 'Giá lẻ',
        dataIndex: 'price',
        render: (record) => (
            <span>  {new Intl.NumberFormat().format(record)}</span>
        )
    },
    {
        title: "Số lượng",
        children: [
            {
                title: "Dự tính",
                dataIndex: "quantity_plane",
                render: (record) => (
                    <span>  {new Intl.NumberFormat().format(record)}</span>
                )
            },
            {
                title: "Thực tế",
                dataIndex: "quantity_real",
                render: (record) => (
                    <span>{new Intl.NumberFormat().format(record)}</span>
                )
            }
        ]
    },
    {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
    },
    {
        title: 'Hạn dùng',
        dataIndex: 'date_expiry',
    },
    {
        title: 'Chất lượng',
        dataIndex: 'quality',
    },
    {
        title: "Thành tiền",
        dataIndex: "tomoney",
        render: (_, record) => (
            new Intl.NumberFormat().format(record.quantity_real * record.price)
        )
    }
];
const countMoney = (allProductItem: DataType[]) => {
    let value = 0
    allProductItem.map((product: DataType) => {
        value += product.price * product.quantity_real
    })
    return value
}

const ConfirmForm = ({ allProductItem, close }: any) => {
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 3,
        },
    })
    const allMoney = countMoney(MockData)
    const [formValue, setFormValue] = useState({
        quanKhu: "QUÂN KHU 5",
        cuc: "CỤC HẬU CẦN",
        nhapTheoKH: "",
        nature: 1,
        itemSource: null
    })
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5
    })
    const componentRef = useRef<HTMLDivElement | null>(null);

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue>,
        sorter: SorterResult<DataType>,
    ) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });

        // `dataSource` is useless since `pageSize` changed
        // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
        //   setData([]);
        // }
    };

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setFormValue(prev => ({ ...prev, [name]: value }))
    }

    // const printers = electron.remo 

    // const handleExportPdf = () => {
    //     ipcRenderer.send('print-to-pdf', formNhap)
    //     ipcRenderer.once('pdf-data-url', (event, pdfDataUrl) => {
    //         printJS({ printable: pdfDataUrl, type: 'pdf', showModal: true });

    //     });
    //     ipcRenderer.send("export-pdf", MockData)
    // }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const { cuc, itemSource, nature, nhapTheoKH, quanKhu } = formValue

    return (
        <div className='form-table'>
            <h2>Xác nhận nhập kho</h2>
            <div className="form" style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="left">
                    <div className="row">
                        <div className="title">Tên quân khu</div>
                        <Input size="large" placeholder="Tên quân khu" name='quanKhu' value={quanKhu} onChange={(e) => handleChangeInput(e)} />
                    </div>
                    <div className="row">
                        <div className="title">Tên cục</div>
                        <Input size="large" placeholder="Tên quân cục" name='cuc' value={cuc} onChange={(e) => handleChangeInput(e)} />
                    </div>
                </div>
                <div className="right">
                    <div className="row">
                        <div className="title">Tính chất</div>
                        <Select
                            showSearch
                            placeholder="Chọn một tùy chọn"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option!.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            labelInValue
                            value={nature}
                            style={{ width: "100%" }}
                            onChange={(value) => setFormValue(prev => ({ ...prev, nature: value }))}
                            size='large'
                            options={[
                                {
                                    value: 1,
                                    label: 'Thường xuyên',
                                },
                                {
                                    value: 2,
                                    label: 'Nhập theo KH',
                                },
                            ]}
                        />
                    </div>
                    <div className="row">
                        <div className="title">Nhập theo KH</div>
                        <Input size="large" placeholder="Nhập theo KH" name='nhapTheoKH' value={nhapTheoKH} onChange={(e) => handleChangeInput(e)} />
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={MockData}
                style={{ marginTop: 10 }}
                pagination={pagination}
                bordered
                onChange={handleTableChange}
            />
            <div className="footer">
                <div className="results">
                    <div className="count-item">Tổng cộng {MockData.length} khoản</div>
                    <div className="tomoney">Thành tiền: {new Intl.NumberFormat().format(allMoney)}đ ({docso(allMoney)} đồng )</div>
                </div>
                <div className="btns">
                    <div className="return">
                        <Button type="text" onClick={close}>Quay lại</Button>
                    </div>
                    <div className="accepted">
                        <Button type="primary" onClick={handleExportPdf}>Xác nhận</Button>
                    </div>

                </div>
            </div>
            {/* <ReactToPrint
                trigger={() => <button>Print</button>}
                content={() => componentRef.current as HTMLDivElement}
            />
            <div style={{ display: 'none' }}>
                <PhieuNhapKho ref={componentRef} />
            </div> */}



        </div >

    )
}

export default ConfirmForm
