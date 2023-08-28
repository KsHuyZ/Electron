import { UilMultiply, UilPen } from '@iconscout/react-unicons';
import { Table, Space, Button, Row, Col } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useEffect, useState } from 'react'
import ModalItemSource from './components/ModalItemSource';
import { ipcRenderer } from 'electron';
import toastify from '@/lib/toastify';
import { Link } from 'react-router-dom';

type DataType = {
  ID: number;
  name: string;
  address: string;
  phone: string;
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
      render: (_, record) => {
        return <Link to={`/item-source/${record.ID}/${record.name}`}>{record.name}</Link>
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
        </Space>
      ),
    }
  ];

  const handleSelectRow = (data: DataType) => {
    setShowAddModal(true)
    setCurrentItemSource(data)
  }

  const { notifySuccess, notifyError } = toastify

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

    <>
      <ModalItemSource isShow={showAddModal} closeModal={handleCloseModal} setLoading={setLoading} data={currentItemSource} reload={handleGetAllItemSource} setAllItemSource={setAllItemSource} />
      <Row style={{ margin: '10px 0' }}>
        <Col span={24}>
          <Space>
            <Button type="primary" onClick={handleShowAddModal}>Thêm nguồn hàng</Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={allItemSource.map(item => ({ ...item, key: item.ID }))}
        style={{ backgroundColor: "transparent" }}
        loading={loading}
        pagination={pagination}
        bordered
        onChange={handleTableChange}
      />
    </>
  )
}

export default ItemSource
