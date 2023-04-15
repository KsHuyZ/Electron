import React, { FC } from 'react';
import { Table, Divider, Row, Col, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import "./table-data.scss"
type DataType = {
    key: React.Key;
    name: string;
    unit: string;
    quality: number;
    hd: string;
    numplan: number;
    numreal: number;
    tomoney: number;
    note: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Tên hàng',
        dataIndex: 'name',
    },
    {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
    },
    {
        title: 'Cấp chất lượng',
        dataIndex: 'quality',
    },
    {
        title: 'Hạn dùng',
        dataIndex: 'hd',
    },
    {
        title: 'Số lượng kế hoạch',
        dataIndex: "numplan"
    },
    {
        title: "Số lượng thực tế",
        dataIndex: "numreal"
    },
    {
        title: 'Thành tiền',
        dataIndex: 'tomoney',
    },
    {
        title: 'Ghi chú',
        dataIndex: 'note',
    },
];

const data: DataType[] = [
    {
        key: '1',
        name: 'Giá kê hàng Z5-0722TBYT130 Armephaco 1221 VN',
        unit: "Cái",
        quality: 1,
        hd: "???",
        numplan: 19,
        numreal: 20,
        tomoney: 2000000,
        note: "sdgsvdghsgdcgs"
    },
    {
        key: '2',
        name: 'Giá kê hàng Z5-0722TBYT130 Armephaco 1221 VN',
        unit: "Cái",
        quality: 1,
        hd: "???",
        numplan: 19,
        numreal: 20,
        tomoney: 2000000,
        note: "sdgsvdghsgdcgs"
    },
    {
        key: '3',
        name: 'Giá kê hàng Z5-0722TBYT130 Armephaco 1221 VN',
        unit: "Chiếc",
        quality: 1,
        hd: "???",
        numplan: 19,
        numreal: 20,
        tomoney: 2000000,
        note: "sdgsvdghsgdcgs"
    },
];

const TableData: FC = () => {
    return (
        <div className="form-table">
            <div className="header">
                <div className="add-data"> <Button type="primary" >Thêm hàng</Button></div>
            </div>
            <Table columns={columns} dataSource={data} size="large" />
        </div>
    )
}
export default TableData