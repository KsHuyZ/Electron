import { Button, Table } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    UilArrowLeft,
} from "@iconscout/react-unicons";

type DeliveryItemType = {
    IDWarehouseItem: string;
    nameWarehouse: string;
    name: string;
    price: number;
    quality: number;
    quantity: number;
}

const columns: ColumnsType<DeliveryItemType> = [
    {
        title: "Mã mặt hàng",
        dataIndex: "IDWarehouseItem",
    },
    {
        title: "Thuộc kho",
        dataIndex: "nameWarehouse"
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

const DeliveryItem = () => {

    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isExport = location.pathname.startsWith("/history/export")

    const handleGetData = async () => {
        if (isExport) {
            setLoading(true)
            const result = await ipcRenderer.invoke(`get-delivery-item`, id)
            setLoading(false)
            return setTableData(result)
        }
        
    }

    useEffect(() => {
        handleGetData()
    }, [])

    return (
        <>
            <Button type='text' icon={<UilArrowLeft size={35} />} style={{ backgroundColor: "unset" }} onClick={() => navigate(-1)} />
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

export default DeliveryItem
