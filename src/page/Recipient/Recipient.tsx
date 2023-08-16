import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button, Row, Col } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';
import ModalRecipient from './components/ModalRecipient';
import { Link } from 'react-router-dom';

type DataType = {
    ID: number;
    name: string;
    address: string;
    phone: string;
}

const Recipient = () => {

    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [allRecipient, setAllRecipient] = useState<DataType[]>([])
    const [currentRecipient, setCurrentRecipient] = useState<DataType | null | undefined>()
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const columns: ColumnsType<DataType> = [
        {
            title: 'Mã đơn vị nhận',
            dataIndex: 'ID',
            render: (record) => {
                return `ĐV${record < 10 ? "0" : ""}${record}`
            }
        },
        {
            title: 'Tên đơn vị nhận',
            dataIndex: 'name',
            render: (_, record) => {
                return <Link to={`/recipient/${record.ID}/${record.name}`}>{record.name}</Link>
            }
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
        },
        {
            title: "Hành động",
            dataIndex: "action",
            render: (_, data) => (
                <Space size="middle">
                    <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleSelectRow(data)} />
                </Space>
            ),
        }
    ];

    const handleSelectRow = (data: DataType) => {
        setShowAddModal(true)
        setCurrentRecipient(data)
    }

    const handleTableChange = (
        pagination: TablePaginationConfig
    ) => {
        setPagination((prevPagination) => ({
            ...prevPagination,
            ...pagination
        }));
        handleGetAllRecipient()
    };

    const handleShowAddModal = () => {
        setShowAddModal(true)
    }

    const handleGetAllRecipient = async () => {
        const { pageSize, current } = pagination
        setLoading(true)
        const result = await ipcRenderer.invoke("receiving-request-read", { pageSize, currentPage: current })
        const { rows, total } = result
        setAllRecipient(rows)
        setPagination(prevPagination => ({
            ...prevPagination,
            total // Sửa giá trị total thành tổng số dòng dữ liệu
        }));
        setLoading(false)
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setCurrentRecipient(null)
    }

    useEffect(() => {
        handleGetAllRecipient()
    }, [])

    return (
        <>
            <ModalRecipient isShow={showAddModal} closeModal={handleCloseModal} data={currentRecipient} reload={handleGetAllRecipient} setAllRecipient={setAllRecipient} />
            <Row style={{ margin: '10px 0' }}>
                <Col span={24}>
                    <Space>
                        <Button type="primary" onClick={handleShowAddModal}>Thêm đơn vị nhận</Button>
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={allRecipient.map(item => ({ ...item, key: item.ID }))}
                loading={loading}
                pagination={pagination}
                bordered
                onChange={handleTableChange}
            />
        </>
    )
}

export default Recipient
