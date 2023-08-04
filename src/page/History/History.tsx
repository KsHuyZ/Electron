import { TableData } from '@/types'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { DataType } from '../WarehouseItem/types'
import { Button, Col, Form, Input, Modal, Row, Space, Table, TablePaginationConfig } from 'antd'
import { ColumnsType } from 'antd/es/table'
import docso from '@/utils/toVietnamese'
import { UilPen } from '@iconscout/react-unicons'
import ModalCreateEntry from './components/ModalCreateEntry'
import toastify from '@/lib/toastify'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'

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
    Nature: string;
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
    const [isShowModal, setIsShowModal] = useState(false)
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
    const [form] = Form.useForm()

    const [tableData, setTableData] = useState<TableData<CountDeliveryType[]>>(defaultTable)

    const location = useLocation()

    const { notifyError, notifySuccess } = toastify

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
        canUpdate ? {
            title: "Cập nhật",
            render: (_, value) => (
                <Space size="middle">
                    <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleShowModalUpdate(value)} />
                </Space>
            )
        } : {}
    ]

    const handleClean = () => {
        form.resetFields()
        setIsShowModal(false)
    }

    const handleShowModalUpdate = (value: CountDeliveryType) => {
        setCurrentSelect(value)
        setShowUpdateModal(true)
    }

    const onFinish = async () => {
        const password = form.getFieldValue('password')
        if (password !== "admin") return form.setFields([{
            name: 'password',
            errors: ['Sai mật khẩu']
        }])
        setCanUpdate(true)
        handleClean()
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

    const handleShowForm = () => {
        if (canUpdate) return setCanUpdate(false)
        setIsShowModal(true)
    }

    useEffect(() => {
        ipcRenderer.on("edit-import", onUpdateSuccessCallback)
        ipcRenderer.on("edit-export-success",onUpdateSuccessCallback)
        return () => {
            ipcRenderer.removeListener("edit-import", onUpdateSuccessCallback)
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
            <Row style={{ margin: '0 0 10px 0 ' }}>
                <Col span={24}>
                    <Space>
                        <Button className="default" type="primary" onClick={handleShowForm} icon={canUpdate ? <LockOutlined /> : <UnlockOutlined />}>{!canUpdate ? "Chỉnh sửa" : "Khóa chỉnh sửa"}</Button>
                    </Space>
                </Col>
            </Row>
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
            <Modal
                title={`Nhập đúng mật khẩu để được phép chỉnh sửa`}
                centered
                open={isShowModal}
                onCancel={handleClean}
                onOk={form.submit}
            >
                <Form form={form} onFinish={onFinish}>
                    <Form.Item label="Mật khẩu" name={'password'} rules={[
                        {
                            required: true,
                            message: "Hãy nhập mật khẩu để sửa phiếu",
                        },
                    ]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
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
