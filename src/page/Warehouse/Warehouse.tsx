import "./warehouse.scss"
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Button, Space, Table, message } from 'antd';
import { UilPen } from '@iconscout/react-unicons'
import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { Link } from "react-router-dom";

import ModalWareHouse from "./components/ModalWareHouse";

type DataType = {
    ID: string;
    name: string;
}

type ResponseCallBackWareHouse = {
    rows: DataType[],
    total: number
}

interface TableParams {
    pagination?: TablePaginationConfig;
}

const Warehouse = () => {

    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [allWareHouse, setAllWareHouse] = useState<DataType[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0
        },
    });
    const [formEdit, setFormEdit] = useState<{ idEdit: string, name: string }>();

    const columns: ColumnsType<DataType> = [
        {
            title: 'Mã kho hàng',
            dataIndex: 'ID',
            key: 'ID',
            render: (record) => {
                return <Link to={`/home/${record.ID}`}>K{record < 10 ? "0" : ""}{record}</Link>
            }
        },
        {
            title: 'Tên kho',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: "Hành động",
            dataIndex: "action",
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleOpenEditModal(record.ID, record.name)} />
                </Space>
            ),
        }
    ];

    const handleShowAddModal = () => {
        setShowAddModal(true)
    }

    const handleGetAllWarehouse = (pageSize: number, currentPage: number) => {
        setLoading(true);
        ipcRenderer.send("warehouse-request-read", { pageSize, currentPage })
    }

    const handleTableChange = (pagination: TablePaginationConfig) => {
        setTableParams((prevParams) => ({
            ...prevParams,
            pagination,
        }));
        handleGetAllWarehouse(pagination.pageSize!, pagination.current!);
    };

    useEffect(() => {
        handleGetAllWarehouse(tableParams.pagination?.pageSize!, tableParams.pagination?.current!)
    }, [])

    const allWareHouseCallBack = (event: Electron.IpcRendererEvent, data: ResponseCallBackWareHouse) => {
        setLoading(false)
        setTableParams((prev) => ({
            ...prev,
            total: data.total
        }))
        setAllWareHouse(data.rows)
    }

    const appendWarehouseCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {
        setAllWareHouse((prev: DataType[]) => [...prev, data]);
        setShowAddModal(false)
        setLoading(false)
        message.success("Thêm kho hàng thành công")
    }

    const updateWarehouseCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {
        const { ID } = data
        setAllWareHouse(prev => {
            let prevItemSource = [...prev]
            const index = prevItemSource.findIndex(item => item.ID === ID)
            if (index > -1) {
                prevItemSource[index] = data
            }
            return prevItemSource
        })
        setShowAddModal(false)
        setLoading(false)
        message.success("Thêm kho hàng thành công")
    }

    useEffect(() => {
        ipcRenderer.on("all-warehouse", allWareHouseCallBack)
        ipcRenderer.on("append-warehouse", appendWarehouseCallBack)
        ipcRenderer.on("update-success", updateWarehouseCallBack)
        setLoading(false);
        return () => {
            ipcRenderer.removeListener("all-warehouse", allWareHouseCallBack)
            ipcRenderer.removeListener("append-warehouse", appendWarehouseCallBack)
            ipcRenderer.removeListener("update-success", updateWarehouseCallBack)
        }
    }, []);

    const handleOpenEditModal = (id: string, name: string) => {
        setShowAddModal(true);
        setFormEdit({
            idEdit: id,
            name
        })
    };

    const cleanFormEdit = () => {
        setFormEdit({
            idEdit: '',
            name: ''
        })
    }

    const handleOpenModal = () => {
        setLoading(true)
        cleanFormEdit()
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        cleanFormEdit()
    }

    return (
        <div className="form-table">
            {
                showAddModal && <ModalWareHouse dataEdit={formEdit} clean={() => cleanFormEdit()} closeModal={() => handleCloseModal()} setLoading={() => handleOpenModal()} />
            }
            <div className="header">
                <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm kho hàng</Button></div>
            </div>
            <Table
                columns={columns}
                dataSource={allWareHouse.map((item) => ({ ...item, key: item.ID }))}
                style={{ backgroundColor: "transparent" }}
                loading={loading}
                pagination={tableParams.pagination}
                bordered
                onChange={handleTableChange}
            />
        </div>
    )
}

export default Warehouse
