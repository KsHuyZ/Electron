import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import ModalItemSource from '../../components/ModalItemSource/ModalItemSource';
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';

type DataType = {
  ID: string;
  name: string;
  address: string;
  phonenumber: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Mã kho hàng',
    dataIndex: 'ID',
    render: (record) => {
      return `NH${record < 10 ? "0" : ""}${record}`
    }
  },
  {
    title: 'Tên nguồn hàng',
    dataIndex: 'name',
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phonenumber',
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

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}


const ItemSource = () => {

  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [allItemSource, setAllItemSource] = useState<DataType[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  })

  const { notifySuccess } = toastify

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
        key: 'even',
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

  const handleGetAllItemSource = () => {
    setLoading(true)
    ipcRenderer.send("itemsource-request-read")
  }

  const allItemSourceCallBack = (event: Electron.IpcRendererEvent, data: DataType[]) => {
    setAllItemSource(data)
    setLoading(false)
  }

  const appendItemSourceCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {
    setAllItemSource((prev: DataType[]) => {
      let copyData = prev.slice()
      copyData.push(data)
      return copyData
    })
    setShowAddModal(false)
    setLoading(false)
    notifySuccess("Thêm nguồn thành công")
  }

  useEffect(() => {
    handleGetAllItemSource()
  }, [])

  useEffect(() => {
    ipcRenderer.on("all-itemsource", allItemSourceCallBack)
    ipcRenderer.on("append-itemsource", appendItemSourceCallBack)
    return () => {
      ipcRenderer.removeListener("all-itemsource", allItemSourceCallBack)
      ipcRenderer.removeListener("append-itemsource", appendItemSourceCallBack)
    }
  }, [])

  return (
    <div className="form-table">
      {showAddModal && <ModalItemSource closeModal={() => setShowAddModal(false)} setLoading={() => setLoading(true)} />}
      <div className="header">
        <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm nguồn hàng</Button></div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allItemSource}
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

export default ItemSource
