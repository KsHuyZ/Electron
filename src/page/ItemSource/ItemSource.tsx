import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import ModalItemSource from './components/ModalItemSource';
import { FilterValue, SorterResult, TableRowSelection } from 'antd/es/table/interface';
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';
import { Link } from 'react-router-dom';

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
      render: (_,record) =>{
        return <Link to={`/item-source/${record.ID}`}>{record.name}</Link>
      }
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

  const { notifySuccess, notifyError } = toastify

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
    handleGetAllItemSource()
  };

  const handleShowAddModal = () => {
    setShowAddModal(true)
  }

  const handleGetAllItemSource = async () => {
    const { pageSize, current } = pagination
    setLoading(true)
    const result = await ipcRenderer.invoke("source-request-read", { pageSize, currentPage: current })
    if (result) {
      const { rows, total } = result
      setAllItemSource(rows)
      setPagination(prevPagination => ({
        ...prevPagination,
        total
      }));
    }
    setLoading(false)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setCurrentItemSource(null)
  }

  const handleCloseModalDelete = () => {
    setShowModalDelete(false)
    setCurrentItemSource(null)
  }

  const handleDeleteItemSource = async (id: number | undefined | null) => {
    const isSuccess = await ipcRenderer.invoke("delete-itemsource", id)
    if (isSuccess) {
      notifySuccess("Xóa nguồn hàng thành công")
      setShowModalDelete(false)
     return handleGetAllItemSource()
    }
    notifyError("Xóa nguồn hàng thất bại")
  }

  useEffect(() => {
    handleGetAllItemSource()
  }, [])

  return (
    <div className="form-table">
      {showAddModal && <ModalItemSource closeModal={handleCloseModal} setLoading={setLoading} data={currentItemSource} reload={handleGetAllItemSource} setAllItemSource={setAllItemSource} />}
      {showModalDelete && <ModalDelete data={currentItemSource} deleteFunc={handleDeleteItemSource} closeModal={handleCloseModalDelete} />}
      <div className="header">
        <div className="add-data"> <Button type="primary" onClick={handleShowAddModal}>Thêm nguồn hàng</Button></div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allItemSource.map(item => ({ ...item, key: item.ID }))}
        style={{ backgroundColor: "transparent" }}
        loading={loading}
        pagination={pagination}
        bordered
        onChange={handleTableChange}
      />
    </div>
  )
}

export default ItemSource
