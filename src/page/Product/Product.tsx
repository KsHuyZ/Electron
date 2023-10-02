import { Row, Col, Card, Button, Space, Tag, Modal, message, Input } from "antd";
import { UilSearch, UilFilter } from '@iconscout/react-unicons'
import type { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from "react";
import { renderTextStatus, formatNumberWithCommas, getDateExpried, defaultRows } from "@/utils";
import { DataType, ISearchWareHouseItem, STATUS_MODAL } from "../WarehouseItem/types";
import TableWareHouse from "../WarehouseItem/components/TableWareHouse";
import { ipcRenderer } from "electron";
import { ResponseIpc, TableData, QUALITY_PRODUCT } from "@/types";
import { TablePaginationConfig } from "antd/es/table";
import FilterWareHouseItem from "../WarehouseItem/components/FilterWareHouseItem";
import { useSearchParams } from "react-router-dom";
import ModalCreateEntry from "./components/ModalCreateEntry";

const defaultTable: TableData<DataType[]> = {
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  rows: defaultRows,
};

const Product = () => {
  const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
  const [listData, setListData] = useState<TableData<DataType[]>>(defaultTable);
  const [dataRowSelected, setDataRowSelected] = useState<DataType[]>([]);
  const [isShowSearch, setIsShowSearch] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [statusModal, setStatusModal] = useState<STATUS_MODAL>(STATUS_MODAL.CLOSE);
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>(defaultRows);
  const [isListenChange, setIsListenChange] = useState(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
      title: 'Kho Hàng',
      dataIndex: 'nameWareHouse',
      width: 200,
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
      title: "Số lượng",
      dataIndex: "quantity",
      width: 200,
      render: (record) => (
        <span>{new Intl.NumberFormat().format(record)}</span>
      )
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      width: 200,
    },
    {
      title: 'Chất lượng mặt hàng',
      dataIndex: 'quality',
      width: 200,
      render: (record) => {
        const findItem = QUALITY_PRODUCT.find((item) => item.value == record);
        return (
          <span>{findItem?.label}</span>
        )
      }
    },
    {
      title: 'Thời gian hết hạn',
      dataIndex: 'date_expried',
      render: (record) => (
        <span>{getDateExpried(record)}</span>
      ),
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
      render: (confirm: number, value) => {
        const { text, color } = renderTextStatus(confirm)
        return (
          <div style={{ display: 'flex' }}>
            <Tag color={color}>
              {text}
            </Tag>
          </div>
        )
      }
    },
  ];

  useEffect(() => {
    getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
  }, [])

  useEffect(() => {
    if (isSearch) {
      getListItem(listData.pagination.pageSize, 1, listData.pagination.total);
    }
  }, [isSearch])

  const getListItem = async (pageSize: number, currentPage: number, total: number) => {
    const parsedSearchParams = Object.fromEntries(searchParams);
    setListData({
      ...listData,
      pagination: {
        current: currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    })
    const paramsSearch: ISearchWareHouseItem = {
      name: nameSearch,
      idSource: Number(parsedSearchParams.idSource) || null,
      startDate: parsedSearchParams.startDate || '',
      endDate: parsedSearchParams.endDate || '',
      status: Number(parsedSearchParams.status) || null,
      now_date_ex: parsedSearchParams.now_date_ex || '',
      after_date_ex: parsedSearchParams.after_date_ex || ''
    };
    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("get-all-warehouse-item", { pageSize: pageSize, currentPage, paramsSearch });
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
      ));
      if (isSearch) {
        setIsSearch(false);
      }
    }
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    getListItem(pagination.pageSize!, pagination.current!, pagination.total!)
  };

  const handleShowTransferModal = () => {
    setStatusModal(STATUS_MODAL.CLOSE);
  }

  const handleDataRowSelected = (listRows: DataType[]) => {
    setDataRowSelected(listRows.map((item) => ({
      ...item,
      newQuantity: item.quantity!
    })));
  }


  return (
    <Row className="filter-bar">
      <Row style={{ width: '100%' }} align="middle">
      </Row>
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: '16px 0' }}>
              <Row className="filter-bar">
                <Col span={12} className="col-item-filter">
                  <div className="form-item" style={{ width: '60%' }}>
                    <label htmlFor="">Tên mặt hàng</label>
                    <Input value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} />
                  </div>
                  <Button type="primary" onClick={() => setIsSearch(true)}><UilSearch /></Button>
                </Col>
                <Col span={12}>
                  <Space direction="horizontal" size={24}>
                    <Button className={isShowSearch ? `default active-search` : `default`} icon={<UilFilter />} onClick={() => setIsShowSearch(!isShowSearch)}>Lọc</Button>
                    <Button onClick={() => setIsShowPopUp(true)} disabled={dataRowSelected!?.length > 0 ? false : true} type="primary">Tạm Xuất kho</Button>
                  </Space>
                </Col>
              </Row>
              {isShowSearch && (
                <FilterWareHouseItem
                  isSearch={isSearch}
                  handleIsSearch={(envSearch) => setIsSearch(envSearch)}
                  handleChangeName={(value) => setNameSearch(value)}
                />)}
            </Card>
          </div>
          <TableWareHouse
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
            setRowsSelect={handleDataRowSelected as any}
          />
        </div>
      </Col>
      <ModalCreateEntry
        isShowModal={isShowPopUp}
        onCloseModal={() => setIsShowPopUp(false)}
        listItem={dataRowSelected}
        reFetch={async () => await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total)}
      />
    </Row>

  )
}

export default Product