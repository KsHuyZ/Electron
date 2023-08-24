import { TableData } from '@/types'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import AuthModal from "@/components/AuthModal";
import { Button, Col, Form, Input, Modal, Row, Space, Table, TablePaginationConfig, Tag, message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import docso from '@/utils/toVietnamese'
import { UilExclamationCircle, UilPen } from '@iconscout/react-unicons'
import ModalCreateEntry from './components/ModalCreateEntry'
import toastify from '@/lib/toastify'

const dataTab = [
    {
        tabName: 'temp-import',
        name: 'Lịch sự tạm nhập kho',
        url: '/history/temp-import'
    },
    {
        tabName: 'import',
        name: 'Lịch sử nhập kho',
        url: `/history/import`,
    },
    {
        tabName: 'temp-export',
        name: 'Lịch sử tạm xuất kho',
        url: `/history/temp-export`,
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
    status: number | string
}

const { confirm } = Modal;

const History = () => {
    const [canUpdate, setCanUpdate] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentSelect, setCurrentSelect] = useState<CountDeliveryType>()
    const current = searchParams.get("current");
    const pageSize = searchParams.get("pageSize");

    const defaultTable: TableData<CountDeliveryType[]> = {
        pagination: {
            current: current ? Number(current) : 1,
            pageSize: pageSize ? Number(pageSize) : 5,
            total: 0,
        },
        loading: false,
        rows: [],
    };
    const [tableData, setTableData] = useState<TableData<CountDeliveryType[]>>({
        pagination: {
            current: current ? Number(current) : 1,
            pageSize: pageSize ? Number(pageSize) : 5,
            total: 0,
        },
        loading: false,
        rows: [],
    })

    const location = useLocation()

    const handleApprove = (data: CountDeliveryType) => {
        confirm({
            closable: true,
            title: `Bạn có đang duyệt phiếu ${data.ID} ?. Sau khi duyệt phiếu thì không thể chỉnh sửa`,
            icon: <UilExclamationCircle />,
            okText: 'Đồng ý',
            okType: 'danger',
            cancelText: 'Từ chối',
            onOk() {
                handleApproveAccept(data.ID)
            },
            onCancel() {

            }
        });
    };

    const { notifySuccess } = toastify

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
            title: "Trạng thái",
            dataIndex: "status",
            render: (value: number) => (
                <Tag color={`${value === 0 ? "#f50" : "#87d068"}`}>
                    {value === 0 ? "Chưa duyệt" : "Đã duyệt"}
                </Tag>
            )
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
            title: "Người làm phiếu",
            dataIndex: "author"
        },
        {
            title: "Ghi chú",
            dataIndex: "Note"
        },
        {
            title: "Cập nhật",
            render: (_, value) => (
                canUpdate && value.status === 0 ? <Space size="middle">
                    <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleShowModalUpdate(value)} />
                    <Button type='text' onClick={() => handleApprove(value)}>Duyệt phiếu</Button>
                </Space> : <></>
            )
        }
    ]

    const handleApproveAccept = async (id: number | string) => {
        try {
            const response = await ipcRenderer.invoke(`approve-${isExport ? "export" : "import"}`, id)
            if (response) {
                await handleGetData()
                message.success("Duyệt phiếu thành công")
            }
        } catch (error) {
            message.error("Duyệt phiếu thất bại")
        }
    }

    const handleShowModalUpdate = (value: CountDeliveryType) => {
        setCurrentSelect(value)
        setShowUpdateModal(true)
    }

    const handleGetData = async () => {
        const result = await ipcRenderer.invoke(`get-history-${isExport ? "export" : "import"}`, { current: tableData.pagination.current, pageSize: tableData.pagination.pageSize })
        return setTableData({ ...result, pagination: { current: tableData.pagination.current, pageSize: tableData.pagination.pageSize }, loading: false })
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
        ipcRenderer.on("edit-export-success", onUpdateSuccessCallback)
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
