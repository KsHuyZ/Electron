import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
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

interface ModalRecipientProps {
    data: DataType | null | undefined,
    deleteFunc: (id: number | undefined) => void
    closeModal: () => void
}

const ModalDelete = (props: ModalRecipientProps) => {
    const { data, deleteFunc, closeModal } = props

    return (
        <div className='backdrop'>
            <div className="modal">
                <div className="header">
                    <div className="close-btn">
                        <UilMultiply onClick={closeModal} />
                    </div>
                </div>
                <div className="main-body">
                    <div className="row">
                        <p>Bạn có chắc chắn muốn xóa đơn vị nhận <span>{data?.name}</span> ?</p>
                    </div>
                </div>
                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={closeModal}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" danger ghost onClick={() => deleteFunc(data?.ID)} style={{ backgroundColor: "transparent" }}>Xác nhận</Button>
                    </div>
                </div>
            </div>
        </div>
    )
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
    const [showModalDelete, setShowModalDelete] = useState(false)

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
                    {/* <UilMultiply style={{ cursor: "pointer", color: "#ed5e68" }} onClick={() => handleSelectRowDelete(data)} /> */}
                </Space>
            ),
        }
    ];

    const handleSelectRow = (data: DataType) => {
        setShowAddModal(true)
        setCurrentRecipient(data)
    }
    const { notifySuccess } = toastify

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

    const deleteRecipientCallBack = (event: Electron.IpcRendererEvent, id: number) => {
        setAllRecipient(prev => {
            let prevAllRecipient = [...prev]
            const index = prevAllRecipient.findIndex(item => item.ID === id)
            if (index > -1) {
                prevAllRecipient.splice(index, 1)
            }
            return prevAllRecipient
        })
        notifySuccess("Xóa đơn vị nhận thành công!")
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setCurrentRecipient(null)
    }

    const handleCloseModalDelete = () => {
        setShowModalDelete(false)
        setCurrentRecipient(null)
    }


    const handleDeleteRecipient = async (id: number | undefined | null) => {
        await ipcRenderer.invoke("delete-recipient", id)
        setShowModalDelete(false)
    }

    useEffect(() => {
        handleGetAllRecipient()
    }, [])

    useEffect(() => {
        ipcRenderer.on("delete-success", deleteRecipientCallBack)
        return () => {
            ipcRenderer.removeListener("delete-success", deleteRecipientCallBack)
        }
    }, [])

    return (
        <div className="form-table">
            {showAddModal && <ModalRecipient closeModal={handleCloseModal} data={currentRecipient} reload={handleGetAllRecipient} setAllRecipient={setAllRecipient} />}
            {showModalDelete && <ModalDelete data={currentRecipient} deleteFunc={handleDeleteRecipient} closeModal={handleCloseModalDelete} />}
            <div className="header">
                <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm đơn vị nhận</Button></div>
            </div>
            <Table
                columns={columns}
                dataSource={allRecipient.map(item => ({ ...item, key: item.ID }))}
                style={{ backgroundColor: "transparent" }}
                // pagination={true}
                loading={loading}
                pagination={pagination}
                bordered
                onChange={handleTableChange}
            // style={{ margin: 20 }}
            />
        </div>
    )
}

export default Recipient
