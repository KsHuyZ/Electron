import { TableData } from '@/types'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import AuthModal from "@/components/AuthModal";
import { Button, Col, Form, Input, Modal, Row, Space, Table, TablePaginationConfig } from 'antd'
import { ColumnsType } from 'antd/es/table'
import docso from '@/utils/toVietnamese'
import { UilPen } from '@iconscout/react-unicons'
import ModalCreateEntry from './components/ModalCreateEntry'
import toastify from '@/lib/toastify'

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

export type CountDeliveryType = {
    ID: number;
    nature: string;
    Note: string;
    name: string;
    title: string;
    TotalPrice: number;
    date: string;
    nameReceiving: string;
    nameSource: string;
    id_Source: number | string;
    id_WareHouse: number | string;
}

const History = () => {
    const [canUpdate, setCanUpdate] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentSelect, setCurrentSelect] = useState<CountDeliveryType>()
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

    const {notifySuccess } = toastify

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
            dataIndex: "nature"
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
        {
            title: "Cập nhật",
            render: (_, value) => (
                canUpdate ? <Space size="middle">
                    <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleShowModalUpdate(value)} />
                </Space> : <></>
            )
        }
    ]

    const handleShowModalUpdate = (value: CountDeliveryType) => {
        setCurrentSelect(value)
        setShowUpdateModal(true)
    }

    const handleGetData = async () => {
        const result = await ipcRenderer.invoke(`get-history-${isExport ? "export" : "import"}`, { current: current ? current : 1, pageSize: pageSize ? pageSize : 5 })
        return setTableData(result)
    }

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const { current, pageSize } = pagination
        setSearchParams(prev => ({ ...prev, current, pageSize }))
    };

    const onUpdateSuccessCallback = (event: Electron.IpcRendererEvent) => {
        handleGetData()
        setShowUpdateModal(false)
        notifySuccess("Sửa phiếu thành công")
    }

    useEffect(() => {
        ipcRenderer.on("edit-import-success", onUpdateSuccessCallback)
        ipcRenderer.on("edit-export-success",onUpdateSuccessCallback)
        return () => {
            ipcRenderer.removeListener("edit-import-success", onUpdateSuccessCallback)
            ipcRenderer.removeListener("edit-export-success", onUpdateSuccessCallback)
        }
    }, [])

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
            <AuthModal
                canUpdate={canUpdate}
                setCanUpdate={(status) => setCanUpdate(status)}
            />
            <Table
                dataSource={tableData.rows.map((item, index) => ({ ...item, key: index }))}
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
            <ModalCreateEntry
                isShowModal={showUpdateModal}
                onCloseModal={() => {
                    setCurrentSelect(undefined)
                    setShowUpdateModal(false)
                }}
                select={currentSelect}
                isExport={isExport}

            />
        </>
    )
}

export default History
