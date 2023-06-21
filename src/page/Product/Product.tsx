import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import ModalItemSource from '../ItemSource/components/ModalItemSource';
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import Column from 'antd/es/table/Column';
import ModalProductItem from '@/components/ModalProductItem/ModalProductItem';
import ConfirmForm from '../ConfirmForm/ConfirmForm';

type DataType = {
  ID: string;
  name: string;
  price: number;
  numplan: number;
  numreal: number;
  unit: string;
  quality: number;
  confirm: boolean;
  expiry: Date;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Mã mặt hàng',
    dataIndex: 'ID',
    render: (record) => {
      return `MH${record < 10 ? "0" : ""}${record}`
    }
  },
  {
    title: 'Tên mặt hàng',
    dataIndex: 'name',
  },
  {
    title: 'Giá',
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
    title: "Trạng thái",
    dataIndex: "confirm",
    render: (confirm: boolean) => (
      <span>
        <Tag color={confirm ? "green" : "volcano"}>
          {confirm ? "Đã nhập hàng" : "Tạm nhập"}
        </Tag>
      </span>
    )
  },
  {
    title: "Hành động",
    dataIndex: "action",
    render: () => (
      <Space size="middle">
        <UilPen style={{ cursor: "pointer", color: "#00b96b" }} />
        <UilMultiply style={{ cursor: "pointer", color: "#ed5e68" }} />
        <Link to={"/login"}>Xem các mặt hàng đã nhập từ nguồn này</Link>
      </Space>
    ),
  }
];

const Product = () => {
  const { id } = useParams()

  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allProductItem, setAllProductItem] = useState<DataType[]>([])
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRow, setSelectedRow] = useState<DataType[]>([])
  const [showConfirmForm, setShowConfirmForm] = useState<boolean>(false)

  const { notifySuccess } = toastify

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

  const handleShowAddModal = () => {
    setShowAddModal(true)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    const newSelectedRows = allProductItem.filter(item => newSelectedRowKeys.includes(item.ID));
    setSelectedRow(newSelectedRows)
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    // selections: [
    //   Table.SELECTION_ALL,
    //   Table.SELECTION_INVERT,
    //   Table.SELECTION_NONE,
    //   {
    //     key: 'odd',
    //     text: 'Select Odd Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    //   {
    //     key: 'ID',
    //     text: 'Select Even Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return true;
    //         }
    //         return false;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    // ],
  };

  const appendWarehouseItemCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {

    setAllProductItem((prev: DataType[]) => {
      let copyData = prev.slice()
      copyData.push(data)
      return copyData
    })
    setShowAddModal(false)
    setLoading(false)
    notifySuccess("Thêm kho hàng thành công")
  }
  const getAllWarehouseItemCallBack = (event: Electron.IpcRendererEvent, data: DataType[]) => {
    setAllProductItem(data)
    setLoading(false)
  }

  const handleGetAllWareHouseItem = () => {
    setLoading(true)
    ipcRenderer.send("warehouseitem-request-read", id)
  }

  useEffect(() => {
    handleGetAllWareHouseItem()
  }, [])

  useEffect(() => {
    ipcRenderer.on("append-warehouseitem", appendWarehouseItemCallBack)
    ipcRenderer.on("all-warehouseitem", getAllWarehouseItemCallBack)
    return () => {
      ipcRenderer.removeListener("append-warehouseitem", appendWarehouseItemCallBack)
      ipcRenderer.removeListener("all-warehouseitem", getAllWarehouseItemCallBack)
    }
  }, [])

  return (
    !showConfirmForm ? (<div className="form-table">
      {showAddModal && <ModalProductItem closeModal={() => setShowAddModal(false)} setLoading={() => setLoading(true)} id={id} />}
      <div className="header" style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        <div className="add-data">
          <Button type="primary" onClick={handleShowAddModal}>Thêm hàng vào kho</Button>
        </div>
        <div className="import-accept">
          <Button type="primary" onClick={() => setShowConfirmForm(true)}>Làm phiếu nhập hàng </Button>
        </div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allProductItem}
        rowKey={(record) => record.ID}
        // pagination={true}
        loading={loading}
        pagination={tableParams.pagination}
        bordered
        onChange={handleTableChange}
      // style={{ margin: 20 }}
      />
    </div>) : (<ConfirmForm allProductItem={selectedRow} close={() => setShowConfirmForm(false)} />)
  )
}

export default Product
