import "./warehouse.scss"
import type { ColumnsType } from 'antd/es/table';
import { Button, Space, Table } from 'antd';
import { UilMultiply, UilPen } from '@iconscout/react-unicons'
import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { ipcRenderer } from "electron";

type DataType = {

    ID: string;
    name: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Mã kho hàng',
        dataIndex: 'ID',
        render: (record) => {
            return `K${record < 10 ? "0":""}${record}`
        }
    },
    {
        title: 'Tên kho',
        dataIndex: 'name',
    },
    {
        title: "Hành động",
        dataIndex: "action",
        render: () => (
            <Space size="middle">
                <UilPen style={{ cursor: "pointer", color: "#00b96b" }} />
                <UilMultiply style={{ cursor: "pointer", color: "#ed5e68" }} />
            </Space>
        ),
    }
];

// const data: DataType[] = [
//     {
//         id: "K01",
//         name: "Kho 1"
//     },
//     {
//         id: "K02",
//         name: "Kho 2"
//     },
//     {
//         id: "K03",
//         name: "Kho 3"
//     },
// ]


const Warehouse = () => {

    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [allWareHouse, setAllWareHouse] = useState<DataType[]>([])
    const handleShowAddModal = () => {
        setShowAddModal(true)
    }

    const handleGetAllWarehouse = () => {
        ipcRenderer.send("warehouse-request-read")
    }


    useEffect(() => {
        handleGetAllWarehouse()
    }, [])

    useEffect(() => {
        ipcRenderer.on("all-warehouse", (event, data: DataType[]) => {
            setAllWareHouse(data)
        })
        return () => {
            ipcRenderer.removeListener("all-warehouse", (event, data: DataType[]) => {
                setAllWareHouse(data)
            })
        }
    }, [])

    return (
        <div className="form-table">
            {showAddModal && <Modal closeModal={() => setShowAddModal(false)} />}
            <div className="header">
                <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm kho hàng</Button></div>
            </div>
            <Table
                columns={columns}
                dataSource={allWareHouse}
                style={{ backgroundColor: "transparent" }}
                // pagination={true}
                bordered
            // style={{ margin: 20 }}
            />
        </div>
    )
}

export default Warehouse
