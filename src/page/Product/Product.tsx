import { Row, Col, Card, Select, Button, Space, Tag, Modal, message, Input } from "antd";
import { UilPlus, UilImport, UilFileExport, UilSearch } from '@iconscout/react-unicons'
import type { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from "react";
import { UilMultiply, UilPen, UilExclamationCircle } from '@iconscout/react-unicons';
import { renderTextStatus, formatNumberWithCommas } from "@/utils";
import { DataType, FormWareHouseItem, STATUS_MODAL } from "../WarehouseItem/types";
import TableWareHouse from "../WarehouseItem/components/TableWareHouse";
import { ipcRenderer } from "electron";
import { ItemSource, ResponseIpc, TableData } from "@/types";
import { TablePaginationConfig } from "antd/es/table";
import TransferModal from "../WarehouseItem/components/TransferModal";
import { ERROR } from "../WarehouseItem/constants/messValidate";

const { confirm } = Modal;

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
    warehouseName: ''
  }
];

const defaultTable: TableData<DataType[]> = {
  pagination: {
    current: 1,
    pageSize: 2,
    total: 0,
  },
  loading: false,
  rows: defaultRows,
};

const Product = () => {
  const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
  const [listData, setListData] = useState<TableData<DataType[]>>(defaultTable);
  const [dataRowSelected, setDataRowSelected] = useState<DataType[]>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [itemEdit, setItemEdit] = useState<DataType>();
  const [statusModal, setStatusModal] = useState<STATUS_MODAL>(STATUS_MODAL.CLOSE);
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>(defaultRows);
  const [isListenChange, setIsListenChange] = useState(false);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Mã mặt hàng',
      dataIndex: 'IDWarehouseItem',
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
      render: (record) => (
        <span style={{ fontWeight: 'bold' }}>{formatNumberWithCommas(record)}</span>
      )
    },
    {
      title: 'Thuộc',
      dataIndex: 'warehouseName',
      width: 200,
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
        const { text, color } = renderTextStatus(confirm)
        return (
          <span>
            <Tag color={color}>
              {text}
            </Tag>
          </span>
        )
      }
    },
  ];


  useEffect(() => {
    new Promise(async () => {
      await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
    })
  }, [])

  const getListItem = async (pageSize: number, currentPage: number, total: number) => {
    setListData({
      ...listData,
      pagination: {
        current: currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    })
    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("get-all-warehouse-item", { pageSize: pageSize, currentPage: currentPage });
    if (result) {

      setListData((prev) => (
        {
          ...prev,
          rows: result.rows as any,
          pagination: {
            ...prev.pagination,
            total: result.total as any
          },
          loading: false
        }
      ))
    }
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    getListItem(pagination.pageSize!, pagination.current!, pagination.total!)
  };

  const handleDataRowSelected = (listIdRow: number[]) => {
    console.log(listIdRow);

    const mergedList = listIdRow.map((id, index) => {
      const foundItem = listData.rows.find((item) => Number(item.IDIntermediary) === id);
      return foundItem ? { ...foundItem } : null;
    });

    console.log(mergedList);
    if (mergedList.length > 0) {
      setStatusModal(STATUS_MODAL.TRANSFER);
      setListItemHasChoose(mergedList as DataType[]);

    } else {
      message.error(ERROR.ERROR_3);
      return;
    }
  }

  const removeItem = async (IDIntermediary: number, IDWarehouseItem: number) => {
    const result = await ipcRenderer.invoke("delete-warehouseitem", IDIntermediary, IDWarehouseItem);
    if (result) {
      message.success('Xóa sản phẩm thành công');
      await getListItem(listData.pagination.pageSize, 1, listData.pagination.total);

    }
  }

  const handleShowTransferModal = () => {
    setStatusModal(STATUS_MODAL.CLOSE);
  }

  const removeItemList = (IDIntermediary: string[]) => {
    const filterNewList = listItemHasChoose.filter(item => !IDIntermediary.includes(item.IDIntermediary));
    setDataRowSelected(filterNewList)
    setIsListenChange(true);
  }

  return (
    <Row className="filter-bar">
      <Row style={{ width: '100%' }} align="middle">
        <Col span={12}>
          <Button className="button-bar" onClick={() => setStatusModal(STATUS_MODAL.RECEIPT)} icon={<UilFileExport />} type="primary" disabled={dataRowSelected!?.length > 0 ? false : true}>Xuất kho</Button>
        </Col>
      </Row>
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: '16px 0' }}>
              <Row className="filter-bar">
                <Col span={12} className="col-item-filter">
                  <div className="form-item" style={{ width: '60%' }}>
                    <label htmlFor="">Tên mặt hàng</label>
                    <Input />
                  </div>
                  <Button type="primary"><UilSearch /></Button>
                </Col>
                <Col span={12}>
                  <Space direction="horizontal" size={24}>
                    <Button className="default" icon={<UilImport />}>Đã nhập</Button>
                    <Button className="default" icon={<UilFileExport />}>Tạm Xuất</Button>
                  </Space>
                </Col>
              </Row>

            </Card>
          </div>
          <TableWareHouse
            setIsShowPopUp={() => setIsShowPopUp(true)}
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
            listRowSelected={dataRowSelected}
            setRowsSelect={setDataRowSelected}
          />
        </div>
      </Col>
      {
        statusModal === STATUS_MODAL.RECEIPT && (
          <TransferModal
            isShow={statusModal}
            setIsShow={handleShowTransferModal}
            listItem={dataRowSelected}
            removeItemList={removeItemList}
            fetching={async () => await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total)}
          />
        )
      }
    </Row>

  )
}

export default Product