import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import ModalItemSource from '../../components/ModalItemSource/ModalItemSource';
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import Column from 'antd/es/table/Column';
import ModalProductItem from '@/components/ModalProductItem/ModalProductItem';

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
  },
  {
    title: "Số lượng",
    children: [
      {
        title: "Dự tính",
        dataIndex: "numplan"
      },
      {
        title: "Thực tế",
        dataIndex: "numreal"
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
          {confirm ? "Đã nhập hàng" : "Đang tạm nhập"}
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
  console.log(id);
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allProductItem, setAllProductItem] = useState([])
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'ID',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  useEffect(() => {
    ipcRenderer.send("hihi", { msg: "Fucl" })
  }, [])

  return (
    <div className="form-table">
      {showAddModal && <ModalProductItem closeModal={() => setShowAddModal(false)} setLoading={() => setLoading(true)} id={id} />}
      <div className="header">
        <div className="add-data">
          <Button type="primary" onClick={handleShowAddModal}>Thêm hàng vào kho</Button>
        </div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allProductItem}
        style={{ backgroundColor: "transparent" }}
        // pagination={true}
        loading={loading}
        pagination={tableParams.pagination}
        bordered
      // onChange={handleTableChange}
      // style={{ margin: 20 }}
      />

    </div>
  )
}

export default Product
