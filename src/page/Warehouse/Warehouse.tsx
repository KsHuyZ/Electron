import "./warehouse.scss"
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Button, Space, Table, message } from 'antd';
import { UilPen } from '@iconscout/react-unicons'
import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { Link } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

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
    const [canUpdate, setCanUpdate] = useState(false)

    const columns: ColumnsType<DataType> = [
        {
            title: 'Mã kho hàng',
            dataIndex: 'ID',
            key: 'ID',
            render: (record, value: DataType) => {
                return <Link to={`/home/${record}/${value.name}`}>K{record < 10 ? "0" : ""}{record}</Link>
            }
        },
        {
            title: 'Tên kho',
            dataIndex: 'name',
            key: 'name',
            render: (record, value: DataType) => {
                return <Link to={`/home/${value.ID}/${record}`}>{record}</Link>
            }
        },
        {
            title: "Hành động",
            dataIndex: "action",
            width: 150,
            render: (_, record) => (
                canUpdate ? <Space size="middle">
                <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleOpenEditModal(record.ID, record.name)} />
            </Space> : <></>
            ),
        }
    ];

    const handleShowAddModal = () => {
        setShowAddModal(true)
    }

    const handleGetAllWarehouse = async (pageSize: number, currentPage: number) => {
        setLoading(true);
        const result: ResponseCallBackWareHouse = await ipcRenderer.invoke("warehouse-request-read", { pageSize, currentPage });
        if (result) {
            setLoading(false);
            console.log(result);
            setTableParams((prev) => ({
                pagination: {
                    ...prev.pagination,
                    total: result.total
                }
            }))
            setAllWareHouse(result.rows)

        }

    }

    const handleTableChange = (pagination: TablePaginationConfig) => {
        setTableParams((prevParams) => ({
            ...prevParams,
            pagination,
        }));
        handleGetAllWarehouse(pagination.pageSize!, pagination.current!);
    };

    useEffect(() => {
        new Promise(async () => {
            await handleGetAllWarehouse(tableParams.pagination?.pageSize!, tableParams.pagination?.current!)
        })
    }, [])

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

    const handleCloseModal = async () => {
        setShowAddModal(false)
        cleanFormEdit();
    }


    return (
        <div className="form-table">
            {
                showAddModal && <ModalWareHouse dataEdit={formEdit} clean={() => cleanFormEdit()} closeModal={() => handleCloseModal()} setLoading={() => handleOpenModal()} fetching={async () => await handleGetAllWarehouse(tableParams.pagination?.pageSize!, tableParams.pagination?.current!)} />
            }
            {
                canUpdate && (
                    <div className="header">
                        <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm kho hàng</Button></div>
                    </div>
                )
            }
            <AuthModal
                canUpdate={canUpdate}
                setCanUpdate={(status) => setCanUpdate(status)}
            />
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
