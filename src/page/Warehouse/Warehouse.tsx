import "./warehouse.scss"
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Button, Space, Table } from 'antd';
import { UilMultiply, UilPen } from '@iconscout/react-unicons'
import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import { ipcRenderer } from "electron";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { Link } from "react-router-dom";
import toastify from "@/lib/toastify";

type DataType = {
    ID: string;
    name: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Mã kho hàng',
        dataIndex: 'ID',
        render: (record) => {
            return `K${record < 10 ? "0" : ""}${record}`
        }
    },
    {
        title: 'Tên kho',
        dataIndex: 'name',
    },
    {
        title: "Hành động",
        dataIndex: "action",
        render: (record) => (
            <Space size="middle">
                <UilPen style={{ cursor: "pointer", color: "#00b96b" }} />
                <UilMultiply style={{ cursor: "pointer", color: "#ed5e68" }} />
                <Link to={`/home/${record}`}>Xem các mặt hàng trong kho</Link>
            </Space>
        ),
    }
];

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

const Warehouse = () => {

    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [allWareHouse, setAllWareHouse] = useState<DataType[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 5,
        },
    })

    const { notifySuccess } = toastify

    const handleShowAddModal = () => {
        setShowAddModal(true)
    }

    const handleGetAllWarehouse = () => {
        setLoading(true)
        ipcRenderer.send("warehouse-request-read")
    }

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue>,
        sorter: SorterResult<DataType>,
    ) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });

        // `dataSource` is useless since `pageSize` changed
        // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
        //   setData([]);
        // }
    };

    useEffect(() => {
        handleGetAllWarehouse()
    }, [])

    const allWareHouseCallBack = (event: Electron.IpcRendererEvent, data: DataType[]) => {
        setAllWareHouse(data)
        setLoading(false)
    }

    const appendWarehouseCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {
        setAllWareHouse((prev: DataType[]) => {
            let copyData = prev.slice()
            copyData.push(data)
            return copyData
        })
        setShowAddModal(false)
        setLoading(false)
        notifySuccess("Thêm kho hàng thành công")
    }

    useEffect(() => {
        ipcRenderer.on("all-warehouse", allWareHouseCallBack)
        ipcRenderer.on("append-warehouse", appendWarehouseCallBack)
        return () => {
            ipcRenderer.removeListener("all-warehouse", allWareHouseCallBack)
            ipcRenderer.removeListener("append-warehouse", appendWarehouseCallBack)
        }
    }, [])

    return (
        <div className="form-table">
            {showAddModal && <Modal closeModal={() => setShowAddModal(false)} setLoading={() => setLoading(true)} />}
            <div className="header">
                <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm kho hàng</Button></div>
            </div>
            <Table
                columns={columns}
                dataSource={allWareHouse}
                style={{ backgroundColor: "transparent" }}
                // pagination={true}
                loading={loading}
                pagination={tableParams.pagination}
                bordered
                onChange={handleTableChange}
            // style={{ margin: 20 }}
            />
        </div>
    )
}

export default Warehouse
