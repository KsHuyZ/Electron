import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Input, Select, Space, Table, Button } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import "./confirm-form.scss"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import docso from '@/utils/toVietnamese';
import { ipcRenderer } from 'electron';


interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Tên mặt hàng',
        dataIndex: 'name',
    },
    {
        title: 'Giá lẻ',
        dataIndex: 'price',
        render: (record) => (
            <span>  {new Intl.NumberFormat().format(record)}</span>
        )
    },
    {
        title: "Số lượng",
        children: [
            {
                title: "Dự tính",
                dataIndex: "numplan",
                render: (record) => (
                    <span>  {new Intl.NumberFormat().format(record)}</span>
                )
            },
            {
                title: "Thực tế",
                dataIndex: "numreal",
                render: (record) => (
                    <span>{new Intl.NumberFormat().format(record)}</span>
                )
            }
        ]
    },
    {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
    },
    {
        title: 'Hạn dùng',
        dataIndex: 'expiry',
    },
    {
        title: 'Chất lượng',
        dataIndex: 'quality',
    },
    {
        title: "Thành tiền",
        dataIndex: "tomoney",
        render: (_, record) => (
            new Intl.NumberFormat().format(record.quantity_real * record.price)
        )
    }
];
const countMoney = (allProductItem: any) => {
    let value = 0
    allProductItem.map((product: any) => {
        value += product.price * product.numreal
    })
    return value

}

type DataType = {
    ID: string;
    name: string;
    price: number;
    unit: string;
    quality: number;
    note: string;
    quantity_plane: number;
    quantity_real: number;
    status: number;
    date_expried: string;
    date_created_at: string;
    date_updated_at: string;
    id_nguonHang?: string;
}


interface ConfirmFormProps {
    allProductItem: DataType[],
    close: () => void
}

const ConfirmForm = ({ allProductItem, close }: ConfirmFormProps) => {
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 3,
        },
    })
    const [allMoney, setAllMoney] = useState(countMoney(allProductItem))


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




    return (
        <div className='form-table'>
            <h2>Xác nhận nhập kho</h2>
            <div className="form" style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="left">
                    <div className="row">
                        <div className="title">Tên quân khu</div>
                        <Input size="large" placeholder="Tên quân khu" name='name' value={"QUÂN KHU 5"} />
                    </div>
                    <div className="row">
                        <div className="title">Tên cục</div>
                        <Input size="large" placeholder="Tên quân cục" name='name' value={"CỤC HẬU CẦN"} />
                    </div>
                </div>
                <div className="right">
                    <div className="row">
                        <div className="title">Nguồn nhập</div>
                        <Select
                            labelInValue
                            value={1}
                            style={{ width: "100%" }}
                            // onChange={(value) => handleChangeInput(value.value, "quality")}
                            size='large'
                            options={[
                                {
                                    value: 1,
                                    label: 'Rất tốt',
                                },
                                {
                                    value: 2,
                                    label: 'Tốt',
                                },
                                {
                                    value: 3,
                                    label: 'Bình thường',
                                },
                                {
                                    value: 4,
                                    label: 'Không tốt',
                                },
                                {
                                    value: 5,
                                    label: 'Không thể sử dụng',
                                },
                            ]}
                        />
                    </div>
                    <div className="row">
                        <div className="title">Nhập theo KH</div>
                        <Input size="large" placeholder="Nhập theo KH" name='name' value={"CỤC HẬU CẦN"} />
                    </div>
                    <div className="row">
                        <div className="title">Tính chất</div>
                        <Select
                            labelInValue
                            value={1}
                            style={{ width: "100%" }}
                            // onChange={(value) => handleChangeInput(value.value, "quality")}
                            size='large'
                            options={[
                                {
                                    value: 1,
                                    label: 'Rất tốt',
                                },
                                {
                                    value: 2,
                                    label: 'Tốt',
                                },
                                {
                                    value: 3,
                                    label: 'Bình thường',
                                },
                                {
                                    value: 4,
                                    label: 'Không tốt',
                                },
                                {
                                    value: 5,
                                    label: 'Không thể sử dụng',
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={allProductItem.map(item => ({ ...item, key: item.ID }))}
                style={{ marginTop: 10 }}
                // pagination={true}
                bordered
            // onChange={handleTableChange}
            // style={{ margin: 20 }}
            />
            <div className="footer">
                <div className="results">
                    <div className="count-item">Tổng cộng {allProductItem.length} khoản</div>
                    <div className="tomoney">Thành tiền: {new Intl.NumberFormat().format(allMoney)} ({docso(allMoney)} đồng)</div>
                </div>
                <div className="btns">
                    <div className="return">
                        <Button type="text" onClick={close}>Quay lại</Button>
                    </div>
                    <div className="accepted">
                        <Button type="primary">Xác nhận</Button>
                    </div>
                </div>
            </div>
        </div >

    )
}

export default ConfirmForm
