import "./warehouse.scss"
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Button, Space, Table, message } from 'antd';
import { UilPen } from '@iconscout/react-unicons'
import { createRef, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import { Link } from "react-router-dom";

import ModalWareHouse from "./components/ModalWareHouse";
import { PhieuNhapKho } from "@/components/PhieuNhapKho/PhieuNhapKho";
import { useReactToPrint } from "react-to-print";
import PhieuXuatKho from "@/components/PhieuXuatKho/PhieuXuatKho";


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

    const recieptRef = useRef() as React.MutableRefObject<HTMLInputElement>;
    const exportRef = useRef() as React.MutableRefObject<HTMLInputElement>;
    const columns: ColumnsType<DataType> = [
        {
            title: 'Mã kho hàng',
            dataIndex: 'ID',
            key: 'ID',
            render: (record) => {
                return <Link to={`/home/${record}`}>K{record < 10 ? "0" : ""}{record}</Link>
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
        await handleGetAllWarehouse(tableParams.pagination?.pageSize!, tableParams.pagination?.current!)
    }

    // const handlePrint = async function (target: any) {
    //     return await new Promise(async () => {
    //         console.log("forwarding print request to the main process...");

    //         const data = target.contentWindow.document.documentElement.outerHTML;
    //         //console.log(data);
    //         const blob = new Blob([data], { type: "text/html" });
    //         const url = URL.createObjectURL(blob);

    //         await ipcRenderer.invoke("previewComponent", (url))
    //         //console.log('Main: ', data);
    //     });
    // };

    const handleBillPrint = useReactToPrint({
        content: () => recieptRef.current,
        documentTitle: "Phiếu nhập kho",
        // print: printHandle,
    });
    const handleExportPrint = useReactToPrint({
        content: () => exportRef.current,
        documentTitle: "Phiếu xuất kho kho",
        // print: printHandle,
    });



    return (
        <div className="form-table">
            {
                showAddModal && <ModalWareHouse dataEdit={formEdit} clean={() => cleanFormEdit()} closeModal={() => handleCloseModal()} setLoading={() => handleOpenModal()} />
            }
            <div className="header">
                <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm kho hàng</Button>  <Button type="primary" onClick={handleBillPrint}>Test phiếu nhập</Button> <Button type="primary" onClick={handleExportPrint}>Test phiếu xuất</Button></div>

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
            <div className="" style={{ display: 'none' }}>
                <PhieuNhapKho ref={recieptRef} />
            </div>
            <div className="" style={{ display: 'none' }} >
                <PhieuXuatKho ref={exportRef} />
            </div>
        </div>
    )
}

export default Warehouse
