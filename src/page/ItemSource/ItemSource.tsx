import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import ModalItemSource from './components/ModalItemSource';
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
import { Data, ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';

type DataType = {
  ID: number;
  name: string;
  address: string;
  phone: string;
}



interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

interface ModalItemSourceProps {
  data: DataType | null | undefined,
  deleteFunc: (id: number | undefined) => void
  closeModal: () => void
}


const ModalDelete = (props: ModalItemSourceProps) => {
  const { data, deleteFunc, closeModal } = props

  return (
    <div className='backdrop'>
      <div className="modal">
        <div className="header">
          <div className="close-btn">
            <UilMultiply onClick={closeModal} />
          </div>
        </div>
        <div className="main-body">
          <div className="row">
            <p>Bạn có chắc chắn muốn xóa nguồn hàng <span>{data?.name}</span> ?</p>
          </div>
        </div>
        <div className="action">
          <div className="cancel">
            <Button type="primary" ghost onClick={closeModal}>Thoát</Button>
          </div>
          <div className="create">
            <Button type="primary" danger ghost onClick={() => deleteFunc(data?.ID)} style={{ backgroundColor: "transparent" }}>Xác nhận</Button>
          </div>
        </div>
      </div>
    </div>
  )
}



const ItemSource = () => {

  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [allItemSource, setAllItemSource] = useState<DataType[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentItemSource, setCurrentItemSource] = useState<DataType | null | undefined>()
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [showModalDelete, setShowModalDelete] = useState(false)

  const columns: ColumnsType<DataType> = [
    {
      title: 'Mã nguồn hàng',
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
      dataIndex: 'phone',
    },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_, data) => (
        <Space size="middle">
          <UilPen style={{ cursor: "pointer", color: "#00b96b" }} onClick={() => handleSelectRow(data)} />
          <UilMultiply style={{ cursor: "pointer", color: "#ed5e68" }} onClick={() => handleSelectRowDelete(data)} />
        </Space>
      ),
    }
  ];

  const handleSelectRow = (data: DataType) => {
    setShowAddModal(true)
    setCurrentItemSource(data)
  }

  const handleSelectRowDelete = (data: DataType) => {
    setShowModalDelete(true)
    setCurrentItemSource(data)
  }

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
    pagination: TablePaginationConfig
  ) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      ...pagination
    }));

    const { current, pageSize } = pagination
    handleGetAllItemSource(pageSize, current)
    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setData([]);
    // }
  };

  const handleShowAddModal = () => {
    setShowAddModal(true)
  }

  const handleGetAllItemSource = (pageSize: number | undefined, current: number | undefined) => {
    setLoading(true)
    ipcRenderer.send("itemsource-request-read", { pageSize, currentPage: current })
  }

  const allItemSourceCallBack = (event: Electron.IpcRendererEvent, data: { rows: DataType[], total: number }) => {
    const { rows, total } = data
    setAllItemSource(rows)
    setPagination(prevPagination => ({
      ...prevPagination,
      total // Sửa giá trị total thành tổng số dòng dữ liệu
    }));
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

  const updateItemSourceCallBack = (event: Electron.IpcRendererEvent, data: DataType) => {
    const { ID } = data
    setAllItemSource(prev => {
      let prevItemSource = [...prev]
      const index = prevItemSource.findIndex(item => item.ID === ID)
      if (index > -1) {
        prevItemSource[index] = data
      }
      return prevItemSource
    })
    setLoading(false)
    setShowAddModal(false)
    notifySuccess("Cập nhật thành công!")
  }

  const deleteItemSourceCallBack = (event: Electron.IpcRendererEvent, id: number) => {
    setAllItemSource(prev => {
      let prevAllItemSource = [...prev]
      const index = prevAllItemSource.findIndex(item => item.ID === id)
      if (index > -1) {
        prevAllItemSource.splice(index, 1)
      }
      return prevAllItemSource
    })
    notifySuccess("Xóa nguồn hàng thành công!")
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setCurrentItemSource(null)
  }

  const handleCloseModalDelete = () => {
    setShowModalDelete(false)
    setCurrentItemSource(null)
  }

  const handleDeleteItemSource = (id: number | undefined | null) => {
    ipcRenderer.send("delete-itemsource", id)
    setShowModalDelete(false)
  }

  useEffect(() => {
    const { pageSize, current } = pagination
    handleGetAllItemSource(pageSize, current)
  }, [])

  useEffect(() => {
    ipcRenderer.on("all-itemsource", allItemSourceCallBack)
    ipcRenderer.on("append-itemsource", appendItemSourceCallBack)
    ipcRenderer.on("update-success", updateItemSourceCallBack)
    ipcRenderer.on("delete-success", deleteItemSourceCallBack)
    return () => {
      ipcRenderer.removeListener("all-itemsource", allItemSourceCallBack)
      ipcRenderer.removeListener("append-itemsource", appendItemSourceCallBack)
      ipcRenderer.removeListener("update-success", updateItemSourceCallBack)
      ipcRenderer.removeListener("delete-success", deleteItemSourceCallBack)
    }
  }, [])

  return (
    <div className="form-table">
      {showAddModal && <ModalItemSource closeModal={handleCloseModal} setLoading={() => setLoading(true)} data={currentItemSource} />}
      {showModalDelete && <ModalDelete data={currentItemSource} deleteFunc={handleDeleteItemSource} closeModal={handleCloseModalDelete} />}
      <div className="header">
        <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm nguồn hàng</Button></div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allItemSource.map(item => ({ ...item, key: item.ID }))}
        style={{ backgroundColor: "transparent" }}
        // pagination={true}
        loading={loading}
        pagination={pagination}
        bordered
        onChange={handleTableChange}
      // style={{ margin: 20 }}
      />
    </div>
  )
}

export default ItemSource
