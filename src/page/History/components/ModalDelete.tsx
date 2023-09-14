import { DataType } from '@/page/WarehouseItem/types'
import { formatNumberWithCommas } from '@/utils';
import { Modal, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useState } from 'react'

interface ModalDeleteProps {
    listItemDelete: DataType[],
    isShow: boolean,
    closeModal: () => void,
    onSubmit: (ids: (string | number)[]) => void
}

const columns: ColumnsType<DataType> = [
    {
        title: "Tên mặt hàng",
        dataIndex: "name",
        width: 200,
    },
    {
        title: "Đơn vị tính",
        dataIndex: "unit",
        width: 200,
    },
    {
        title: "Thời gian hết hạn",
        dataIndex: "date_expried",
        render: (record) => <span>{record}</span>,
        width: 200,
    },
    {
        title: "Dự tính",
        dataIndex: "quantity_plane",
        width: 200,
        render: (record) => (
            <span> {new Intl.NumberFormat().format(record)}</span>
        ),
    },
    {
        title: "Thực tế",
        dataIndex: "quantity",
        width: 200,
        render: (record) => (
            <span>{new Intl.NumberFormat().format(record)}</span>
        ),
    },
    {
        title: "Giá lẻ",
        dataIndex: "price",
        width: 200,
        render: (record) => (
            <span style={{ fontWeight: "bold" }}>
                {formatNumberWithCommas(record)}
            </span>
        ),
    },
    {
        title: "Thành tiền",
        dataIndex: "totalPrice",
        width: 200,
        render: (record) => (
            <span style={{ fontWeight: "bold" }}>
                {formatNumberWithCommas(record)}
            </span>
        ),
    },
];

const ModalDelete = ({ listItemDelete, isShow, closeModal, onSubmit }: ModalDeleteProps) => {

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRow?: DataType[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        columnWidth: 150,
        preserveSelectedRowKeys: true,
        onChange: onSelectChange,
    };

    const handleClean = () => {
        closeModal()
        setSelectedRowKeys([])
    }

    const handleSubmit = () => {
        onSubmit(selectedRowKeys)
        handleClean()
    }
    return (
        <Modal
            title={`Danh sách mặt hàng bạn đã xóa`}
            centered
            open={isShow}
            onCancel={handleClean}
            width={"90%"}
            onOk={() => handleSubmit()}
        >
            <Table
                columns={columns}
                dataSource={listItemDelete}
                bordered
                rowSelection={rowSelection}
                pagination={false}
                scroll={{ y: 500 }}
                style={{ maxWidth: "1200px" }}
                rowKey={(item: DataType) => item.IDIntermediary}
            />
        </Modal>
    )
}

export default ModalDelete
