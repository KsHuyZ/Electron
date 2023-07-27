import { TableData } from '@/types'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { DataType } from '../WarehouseItem/types'
import { Table, TablePaginationConfig } from 'antd'
import { ColumnsType } from 'antd/es/table'
import docso from '@/utils/toVietnamese'

const dataTab = [
    {
        tabName: 'import',
        name: 'Lịch sử nhập kho',
        url: `/history/import`,
    },
    {
        tabName: 'export',
        name: 'Lịch sử xuất kho',
        url: `/history/export`,
    }
]

type CountDeliveryType = {
    ID: number;
    Nature: string;
    Note: string;
    TotalPrice: number;
    date: string;
    nameReceiving: string;
}

const History = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const current = searchParams.get("current");
    const pageSize = searchParams.get("pageSize");
    const defaultTable: TableData<CountDeliveryType[]> = {
        pagination: {
            current: 1,
            pageSize: 5,
            total: 0,
        },
        loading: false,
        rows: [],
    };


    const [tableData, setTableData] = useState<TableData<CountDeliveryType[]>>(defaultTable)

    const location = useLocation()

    const isExport = location.pathname.startsWith("/history/export")
    const columns: ColumnsType<CountDeliveryType> = [
        {
            title: "Số phiếu",
            dataIndex: "ID",
            render(value) {
                return <Link to={`/history/${isExport ? "export" : "import"}/${value}`}>{value}</Link>
            },
        },
        {
            title: isExport ? "Đơn vị nhận" : "Nhập vào Kho",
            dataIndex: isExport ? "nameReceiving" : "nameSource"
        },
        {
            title: "Tính chất",
            dataIndex: "Nature"
        },
        {
            title: "Ngày xuất",
            dataIndex: "date"
        },
        {
            title: "Tổng tiền (Bằng số)",
            dataIndex: "Totalprice",
            render: (record) => (
                `${new Intl.NumberFormat().format(record)} VNĐ`
            )
        },
        {
            title: "Tổng tiền (Bằng chữ)",
            dataIndex: "Totalprice",
            render: (value) => (
                `${docso(value)} Đồng`
            )
        },

        {
            title: "Ghi chú",
            dataIndex: "Note"
        },
    ]

    const handleGetData = async () => {
        const result = await ipcRenderer.invoke(`get-history-${isExport ? "export" : "import"}`, { current: current ? current : 1, pageSize: pageSize ? pageSize : 5 })
        console.log(result)
        return setTableData(result)
    }

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const { current, pageSize } = pagination
        setSearchParams(prev => ({ ...prev, current, pageSize }))
    };

    useEffect(() => {
        handleGetData()
    }, [current, pageSize, isExport])

    return (
        <>
            <div className="content-wrapper" style={{ margin: "30px 0" }}>
                <section className="content-header">
                    <ul className="nav-tabs">
                        {
                            dataTab.map((item, index) => (
                                <NavLink key={item.tabName} className={(navClass) => `${navClass.isActive ? 'nav-tabs__item actives' : 'nav-tabs__item'}`} to={item.url} data-toggle="tab">
                                    {item.name}
                                </NavLink>
                            ))
                        }
                    </ul>
                </section>
            </div>
            <Table
                dataSource={tableData.rows}
                pagination={
                    {
                        ...tableData.pagination,
                        showSizeChanger: true
                    }
                }
                bordered
                loading={tableData.loading}
                onChange={handleTableChange}
                columns={columns}
            />
        </>

    )
}

export default History
