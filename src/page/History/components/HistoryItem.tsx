import { Button, Col, Form, Input, Modal, Row, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    UilArrowLeft, UilMultiply, UilPen,
} from "@iconscout/react-unicons";

type HistoryType = {
    IDWarehouseItem: string;
    nameWarehouse?: string;
    name: string;
    price: number;
    quality: number;
    quantity: number;
}


const History = () => {

    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isExport = location.pathname.startsWith("/history/export")

    const columns: ColumnsType<HistoryType> = [
        {
            title: "Mã mặt hàng",
            dataIndex: "IDWarehouseItem",
            render: (record) => {
                return `MH${record < 10 ? "0" : ""}${record}`
            }
        },
        {
            title: "Thuộc kho",
            dataIndex: "nameWareHouse"
        },
        {
            title: "Tên mặt hàng",
            dataIndex: "name"
        },
        {
            title: "Giá",
            dataIndex: "price",
            render(value, record, index) {
                return new Intl.NumberFormat().format(value) + " VNĐ"
            },
        },
        {
            title: "Chất lượng",
            dataIndex: "quality"
        },
        {
            title: "Số lượng",
            dataIndex: "quantity"
        },
        {
            title: "Thành tiền",
            render(value, record, index) {
                return new Intl.NumberFormat().format(record.price * record.quantity) + " VNĐ"
            },
        }
    ]

    const handleGetData = async () => {
        setLoading(true)
        const result = await ipcRenderer.invoke(`get-${isExport ? 'delivery' : 'coupon'}-item`, id)
        setLoading(false)
        return setTableData(result)
    }

    useEffect(() => {
        handleGetData()
    }, [])

    return (
        <>
            <Row>
                <Col span={24}>
                    <Space>
                        <Button type='text' icon={<UilArrowLeft size={35} />} style={{ backgroundColor: "unset" }} onClick={() => navigate(-1)} />
                    </Space>
                </Col>
            </Row>
            <Table
                dataSource={tableData}
                bordered
                loading={loading}
                pagination={false}
                columns={columns}
                scroll={{ y: 500 }}
            />

        </>
    )
}

export default History
