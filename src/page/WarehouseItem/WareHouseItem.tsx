import { Row, Col, Table, Select, Button, Space, Tag, Modal, message } from "antd";
import "./styles/wareHouseItem.scss";
import { UilPlus } from '@iconscout/react-unicons'
import type { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from "react";
import { UilMultiply, UilPen,UilExclamationCircle } from '@iconscout/react-unicons';
import { fakeData } from "./constants/test";
import { renderTextStatus, formatNumberWithCommas } from "@/utils";
import { DataType,FormWareHouseItem } from "./types";
import TableWareHouse from "./components/TableWareHouse";
import { ipcRenderer } from "electron";
import AddWareHouseItem from "./components/AddWareHouseItem";
import { ItemSource,ResponseIpc,TableData } from "@/types";
import { useParams } from "react-router-dom";
import { TablePaginationConfig } from "antd/es/table";

const {confirm} = Modal;

const defaultRows: DataType[] = [
  {
    ID: '',
    name: '',
    price: '',
    unit: '',
    quality: null,
    note: '',
    quantity_plane: null,
    quantity_real: null,
    status: null,
    date_expried: '',
    date_created_at: '',
    date_updated_at: '',
  }
];

const defaultTable: TableData<DataType[]> = {
  pagination: {
    current: 1,
    pageSize: 4,
    total: 0,
  },
  loading: false,
  rows: defaultRows,
};

const WareHouseItem = () =>{
    const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
    const [listData, setListData] = useState<TableData<DataType[]>>(defaultTable);
    const [dataRowSelected, setDataRowSelected] = useState<any>();
    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const {idWareHouse} = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [itemEdit, setItemEdit] = useState<DataType>();

    const columns: ColumnsType<DataType> = [
      {
        title: 'Mã mặt hàng',
        dataIndex: 'ID',
        width: 150,
        render: (record) => {
          return `MH${record < 10 ? "0" : ""}${record}`
        }
      },
      {
        title: 'Tên mặt hàng',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: 'Giá',
        dataIndex: 'price',
        width: 200,
        render : (record) =>(
          <span style={{fontWeight: 'bold'}}>{formatNumberWithCommas(record)}</span>
        )
      },
      {
          title: "Số lượng",
          children: [
            {
              title: "Dự tính",
              dataIndex: "quantity_plane",
              width: 200,
              render: (record) => (
                <span>  {new Intl.NumberFormat().format(record)}</span>
              )
            },
            {
              title: "Thực tế",
              dataIndex: "quantity_real",
              width: 200,
              render: (record) => (
                <span>{new Intl.NumberFormat().format(record)}</span>
              )
            }
          ]
        },
        {
          title: 'Đơn vị tính',
          dataIndex: 'unit',
          width: 200,
        },
        { 
          title: "Trạng thái",
          dataIndex: "status",
          fixed: 'right',
          width: 150,
          render: (confirm: number) => {
            const { text , color} = renderTextStatus(confirm)
            return (
              <span>
              <Tag color={color}>
                {text}
              </Tag>
            </span>
            )
          }
        },
        {
          title: "Hành động",
          dataIndex: "action",
          fixed: "right",
          width: 150,
          render: (_,record: DataType) => (
            <Space size="middle">
              <UilPen style={{ cursor: "pointer" }} onClick={() =>{
                setIsEdit(true);
                setItemEdit(record)
                setIsShowModal(true)
              }}/>
              <UilMultiply style={{ cursor: "pointer" }} onClick={() => handleRemoveItem(record)}/>
            </Space>
          ),
        }
    ];


    useEffect(() =>{
      getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
    },[ipcRenderer])

    useEffect(() => {
      ipcRenderer.on("append-warehouse-item", allWareHouseCallItemBack)
      ipcRenderer.on("append-warehouse-item-success", notifyAddCallBack)
      ipcRenderer.on("delete-success", deleteWareHouseCallBack)
      ipcRenderer.on("update-success", updateWareHouseCallBack)
      return () => {
          ipcRenderer.removeListener("append-warehouse-item", allWareHouseCallItemBack)
          ipcRenderer.removeListener("append-warehouse-item-success", notifyAddCallBack)
          ipcRenderer.removeListener("delete-success", deleteWareHouseCallBack)
          ipcRenderer.removeListener("update-success", updateWareHouseCallBack)
      }
  }, [ipcRenderer]);

  const getListItem =(pageSize: number, currentPage: number, total: number) =>{
    setListData({
      ...listData,
      pagination:{
        current: currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    })
    ipcRenderer.send("warehouseitem-request-read", { pageSize: pageSize, currentPage: currentPage, id: idWareHouse });
  }

  const allWareHouseCallItemBack = (event: Electron.IpcRendererEvent, data: ResponseIpc<DataType>) => {
    
    setListData((prev) =>(
      {
        ...prev,
        rows : data.rows as any,
        pagination : {
          ...prev.pagination,
          total : data.total as any
        },
        loading: false
      }
    ))
      
    
  }

  const updateWareHouseCallBack = (event: Electron.IpcRendererEvent, data: any) =>{

    getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
    message.success('Cập nhật sản phẩm thành công');
  }


  const deleteWareHouseCallBack = (event: Electron.IpcRendererEvent, id: any) =>{
    setListData(prev => {
  const updatedRows = prev.rows.filter(item => item.ID !== id);
  const updatedListData = { ...prev, rows: updatedRows };
  return updatedListData;
});
    message.success('Xóa sản phẩm thành công');
    getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
  }

  const notifyAddCallBack = (event: Electron.IpcRendererEvent, data: any) =>{
    getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
    message.success('Tạo sản phẩm thành công');
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {

    setListData({
      ...listData,
      loading: true
    })

    getListItem(pagination.pageSize!, pagination.current!, pagination.total!)
};

    const handleDataRowSelected = (data: any) =>{
      console.log(data);
      
    }
  
    const removeItem = (idItem: number) =>{
      ipcRenderer.send("delete-warehouseitem", idItem);
    }

    const Footer = () => {
      return (
        <>
         
        </>
      )
    }

    const handleRemoveItem = (data: DataType) =>{
      console.log(data);
      confirm({
        closable: true,
        title: `Bạn chắc chắn sẽ xóa MH${data.ID} ?`,
        icon: <UilExclamationCircle />,
        okText: 'Đồng ý',
        okType: 'danger',
        cancelText: 'Từ chối',
        onOk() {
          removeItem(Number(data.ID))
        },
        onCancel(){

        }
      });
    }

    return(
        <Row className="filter-bar">
        
        <Col span={24}>
        <div>
      <div style={{ marginBottom: 16 }}>
        <Row className="filter-bar">
        <Col span={6}>
        <div className="form-item">
            <label htmlFor="">Lọc</label>
        <Select>
          <Select.Option value="demo">Demo</Select.Option>
        </Select>
        </div>
        </Col>
        
        <Col span={6}>
            <Button onClick={() => setIsShowModal(true)} icon={<UilPlus/>} type="primary">Them San Pham</Button>
        </Col>
        </Row>
        {/* <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span> */}
      </div>
            <TableWareHouse 
              setIsShowPopUp ={()=>setIsShowPopUp(true)}
              setRowSelected={handleDataRowSelected}
              isShowSelection={true}
              columns={columns} 
              dataSource={listData.rows} 
              pagination={listData.pagination}
              bordered
              loading={listData.loading}
              onChange={handleTableChange}
              />
            </div>
        </Col>
        <Modal
        title={'form'}
        centered
        open={false}
        // onCancel={() => setIsMiddleModalOpen(false)}
        // size="medium"
        footer={<Footer />}
      >
        <Space className="modal-item" direction="vertical" size={32} align="center" style={{justifyContent: 'center', width: '100%'}}>
          <div className="form-item">
              <label htmlFor="">Chọn kho hàng cần chuyển</label>
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
          </div>
          <Button size="large" type="primary">
            Chuyển kho
          </Button>
        </Space>
        </Modal>
        <AddWareHouseItem
          isEdit={isEdit}
          setIsEdit={(status) => setIsEdit(status)}
          itemEdit={itemEdit}
          isShowModal={isShowModal}
          idWareHouse={idWareHouse}
          onCloseModal={() => setIsShowModal(false)}
        />
      </Row>

    )
}

export default WareHouseItem