import { Row, Col, Table, Select, Button, Space, Tag, Modal, message } from "antd";
import "./styles/wareHouseItem.scss";
import { UilPlus } from '@iconscout/react-unicons'
import type { ColumnsType } from 'antd/es/table';

import { useCallback, useEffect, useState } from "react";
import { UilMultiply, UilPen,UilExclamationCircle } from '@iconscout/react-unicons';
import { fakeData } from "./constants/test";
import { renderTextStatus, formatNumberWithCommas } from "@/utils";
import { DataType,FormWareHouseItem,STATUS_MODAL } from "./types";
import TableWareHouse from "./components/TableWareHouse";
import { ipcRenderer } from "electron";
import AddWareHouseItem from "./components/AddWareHouseItem";
import { ItemSource,ResponseIpc,TableData } from "@/types";
import { useParams } from "react-router-dom";
import { TablePaginationConfig } from "antd/es/table";
import TransferModal from "./components/TransferModal";
import { ERROR } from "./constants/messValidate";

const {confirm} = Modal;

const defaultRows: DataType[] = [
  {
    IDIntermediary: '',
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
    pageSize: 10,
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
    const [statusModal, setStatusModal] = useState<STATUS_MODAL>(STATUS_MODAL.CLOSE);
    const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>(defaultRows);
    const [isListenChange, setIsListenChange] = useState(false);

    const columns: ColumnsType<DataType> = [
      {
        title: 'Mã mặt hàng',
        dataIndex: 'IDIntermediary',
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
              dataIndex: "quantity",
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
          title: 'Thời gian hết hạn',
          dataIndex: 'date_expried',
          width: 200,
        },
        {
          title: 'Thời gian nhập',
          dataIndex: 'date',
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
      new Promise(async() =>{
        await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
      })
    },[])

  const getListItem =async(pageSize: number, currentPage: number, total: number) =>{
    setListData({
      ...listData,
      pagination:{
        current: currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    })
    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("warehouseitem-request-read", { pageSize: pageSize, currentPage: currentPage, id: idWareHouse });
    if(result){
      
      
      setListData((prev) =>(
        {
          ...prev,
          rows : result.rows as any,
          pagination : {
            ...prev.pagination,
            total : result.total as any
          },
          loading: false
        }
      ))
    }
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    getListItem(pagination.pageSize!, pagination.current!, pagination.total!)
};

    const handleDataRowSelected = (listIdRow: number[]) =>{
      console.log(listIdRow);
      // console.log(listData);
      // check nguon hang must be in the same place

      const mergedList = listIdRow.map((id, index) => {
        const foundItem = listData.rows.find((item) => Number(item.IDIntermediary) === id);
        return foundItem ? { ...foundItem } : null;
      });

      // const differentItems = getDifferentItems(mergedList as DataType[]);
      // if(differentItems.length > 0){
      //     message.open({
      //       type: 'error',
      //       content:`Sản phẩm ${differentItems.map((item) => `MH${item.ID}`).toString()} không cùng nguồn hàng cùng các sản phẩm còn lại`,
      //       duration: 4
      //     });
      //     return;
      // }

      // handle choose WareHouse

      console.log(mergedList);
      if(mergedList.length > 0){
        setStatusModal(STATUS_MODAL.TRANSFER);
        setListItemHasChoose(mergedList as DataType[]);

      }else{
        message.error(ERROR.ERROR_3);
        return;
      }
    }
  
    // const getDifferentItems = (list: DataType[]) => {
    //   const seenIds = new Set();
    //   const differentItems = [];
    //   for (const item of list) {
    //     if (seenIds.has(item.id_nguonHang)) {
    //       differentItems.push(item);
    //     }
    //     seenIds.add(item.id_nguonHang);
    //   }
    //   return differentItems;
    // }

    const removeItem = async(IDIntermediary: number, IDWarehouseItem: number) =>{
      const result = await ipcRenderer.invoke("delete-warehouseitem", IDIntermediary, IDWarehouseItem);
      if(result){
        message.success('Xóa sản phẩm thành công');
        await getListItem(listData.pagination.pageSize, 1, listData.pagination.total);

      }
    }

    const handleRemoveItem = (data: DataType) =>{
      console.log(data);
      confirm({
        closable: true,
        title: `Bạn chắc chắn sẽ xóa MH${data.IDIntermediary} ?`,
        icon: <UilExclamationCircle />,
        okText: 'Đồng ý',
        okType: 'danger',
        cancelText: 'Từ chối',
        onOk() {
          removeItem(Number(data.IDIntermediary), Number(data.IDWarehouseItem))
        },
        onCancel(){

        }
      });
    };

    const handleShowTransferModal = () =>{
      setStatusModal(STATUS_MODAL.CLOSE);
    }

    const removeItemList = (IDIntermediary: string) =>{
      console.log('remove item list', IDIntermediary);
      const filterNewList = listItemHasChoose.filter(item => item.IDIntermediary !== IDIntermediary);
      setListItemHasChoose(filterNewList);
      setIsListenChange(true);
    }

    console.log(listData);
    

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
              pagination={
                {
                  ...listData.pagination,
                showSizeChanger: true
                }
              }
              bordered
              loading={listData.loading}
              onChange={handleTableChange}
              isListenChange={isListenChange}
              setIsListenChange={(status: boolean) => setIsListenChange(status)}
              listRowSelected={listItemHasChoose}
              />
            </div>
        </Col>
        {
          isShowModal && (
            <AddWareHouseItem
              isEdit={isEdit}
              setIsEdit={(status) => setIsEdit(status)}
              itemEdit={itemEdit}
              isShowModal={isShowModal}
              idWareHouse={idWareHouse}
              onCloseModal={() => setIsShowModal(false)}
              fetching={async() => await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total)}
            />
          )
        }
        {
          statusModal === STATUS_MODAL.TRANSFER && (
            <TransferModal
          isShow={statusModal}
          idWareHouse={idWareHouse}
          setIsShow={handleShowTransferModal}
          listItem={listItemHasChoose}
          removeItemList={removeItemList}
        />
          )
        }
      </Row>

    )
}

export default WareHouseItem