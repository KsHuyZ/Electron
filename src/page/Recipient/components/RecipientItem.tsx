import { Row, Col, Card, Select, Button, Space, Tag, Modal, message, Input } from "antd";
// import "./styles/wareHouseItem.scss";
import { UilSearch, UilFilter } from '@iconscout/react-unicons'
import type { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from "react";
import { renderTextStatus, formatNumberWithCommas, removeItemChildrenInTable } from "@/utils";
import { DataType, ISearchWareHouseItem } from "../../WarehouseItem/types/index";
import TableWareHouse from "../../WarehouseItem/components/TableWareHouse";
import { ipcRenderer } from "electron";
import { ResponseIpc, STATUS, TableData, OptionSelect } from "@/types";
import { useParams } from "react-router-dom";
import { TablePaginationConfig } from "antd/es/table";
import { useSearchParams } from "react-router-dom";
import FilterWareHouseItem from "@/page/WarehouseItem/components/FilterWareHouseItem";
import toasitify from "../../../lib/toastify"
import ModalCreateEntry from "@/page/EntryForm/components/ModalCreateEntry";

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
    prev_idwarehouse: 0,
    date_created_at: '',
    date_updated_at: '',
  }
];

const defaultTable: TableData<DataType[]> = {
  pagination: {
    current: 1,
    pageSize: 2,
    total: 0,
  },
  loading: false,
  rows: [],
};

const RecipientItem = () => {
  const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
  const [listData, setListData] = useState<TableData<DataType[]>>(defaultTable);
  const { idRecipient, nameReceiving } = useParams();
  const [statusModal, setStatusModal] = useState<boolean>(false);
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([]);
  const [isListenChange, setIsListenChange] = useState(false);
  const [isShowSearch, setIsShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [nameSearch, setNameSearch] = useState('');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [isReadyExport, setIsReadyExport] = useState<boolean>(false)
  const [listWareHouse, setListWareHouse] = useState<OptionSelect[]>([]);
  const [selectSearch, setSelectSearch] = useState<{select: string}>();

  const { notifyError, notifySuccess } = toasitify

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
      title: 'Tên Kho Hàng',
      dataIndex: 'nameWareHouse',
      render: (value, row, index) => {
        const trueIndex =
        index + listData.pagination.pageSize * (1 - 1);
        const obj = {
          children : (<b>{value?.toUpperCase() ?? ''}</b>),
          props : {} as any
        };
        if(index > 0 && row.nameWareHouse === listData.rows[trueIndex -1].nameWareHouse){
          obj.props.rowSpan = 0;
          // obj.props.colSpan = 2;
        }
        else{
          for (let i = 0; trueIndex + i !== listData.rows.length && row.nameWareHouse === listData.rows[trueIndex + i].nameWareHouse; i+=1) {
           obj.props.rowSpan = i+1; 
          }
        }
        return obj;
      },
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
      await getListWareHouse();
      await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
    })
  }, []);

  useEffect(() => {
    if (isSearch) {
      getListItem(listData.pagination.pageSize, 1, listData.pagination.total);
    }
  }, [isSearch]);


  const getListItem = async (pageSize: number, currentPage: number, total: number) => {
    const parsedSearchParams = Object.fromEntries(searchParams);
    setListData({
      ...listData,
      pagination: {
        current: isSearch ? 1 : currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    });

    const paramsSearch: ISearchWareHouseItem = {
      name: nameSearch,
      idSource: Number(parsedSearchParams.idSource) || null,
      startDate: parsedSearchParams.startDate || '',
      endDate: parsedSearchParams.endDate || '',
      status: Number(parsedSearchParams.status) || null,
      itemWareHouse : selectSearch?.select ?? ''
    };
    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("warehouseitem-request-read", { pageSize: pageSize, currentPage: currentPage, idRecipient, paramsSearch: paramsSearch });
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

  const handleDataRowSelected = (listRows: DataType[]) => {
    setListItemHasChoose(listRows);
    listRows.forEach(row => {
      if (row.status !== STATUS.TEMPORARY_EXPORT) {
        setIsReadyExport(false)
        throw new Error("errorr")
      }
    })
    return setIsReadyExport(true)
  }


  const removeItemList = (IDIntermediary: string[]) => {
        
    const newList = removeItemChildrenInTable(listItemHasChoose);
    
    const filterNewList = newList.filter(item => !IDIntermediary.includes(item.IDIntermediary));
    setListItemHasChoose(filterNewList);
    setIsListenChange(true);
  }

  const handleSearchName = () => {
    setIsSearch(true);
  }

  const handleOpenExportBill = async () => {
    if (!isReadyExport) return notifyError("Chỉ được lựa chọn mặt hàng tạm xuất")
    setStatusModal(true)
  }

  const exportWarehouseCallBack = async (event: Electron.IpcRendererEvent, isSuccess: boolean) => {
    if (!isSuccess) {
      return notifyError("Xuất kho thất bại. Hãy thử lại")
    }
    await getListItem(listData.pagination.pageSize, 1, listData.pagination.total);
    setListItemHasChoose([])
    setStatusModal(false)
    return notifySuccess("Xuất kho thành công")
  }

  useEffect(() => {
    ipcRenderer.on("export-warehouse", exportWarehouseCallBack)
    return () => {
      ipcRenderer.removeListener("export-warehouse", exportWarehouseCallBack)
    }
  }, []);

  const getListWareHouse = async () => {
    const result = await ipcRenderer.invoke("get-warehouse-no-pagination");
    if (result as any) {
      const option: OptionSelect[] = result.rows.map((item: any) => ({
        label: item.name,
        value: item.ID
      }));

      setListWareHouse(option);
    }
  }

  const handleChangeInput = (key: string,event : any) =>{
    if(key === 'select'){
      setSelectSearch({
        select : event
      });
      setIsSearch(true);
    }else{
      setNameSearch(event.target.value);
    }
  }

  return (
    <Row className="filter-bar">
      <Row style={{ width: '100%' }} align="middle">
        <Col span={12}>
          <h2>{nameReceiving}</h2>
        </Col>
      </Row>
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: '16px 0' }}>
              <Row className="filter-bar">
                <Col span={8} className="col-item-filter">
                  <div className="form-item" style={{ width: '70%' }}>
                    <label htmlFor="">Tên mặt hàng</label>
                    <Input value={nameSearch} onChange={(event) => handleChangeInput('select',event.target.value)} />
                  </div>
                  <Button type="primary" onClick={handleSearchName}><UilSearch /></Button>
                </Col>
                <Col span={8} className="col-item-filter">
                  <div className="form-item" style={{ width: '90%' }}>
                    <label htmlFor="">Kho Hàng</label>
                    <Select
                    style={{width : '100%'}}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={listWareHouse}
                    onChange={(value) => handleChangeInput('select',value)}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <Space direction="horizontal" size={24}>
                    <Button className={isShowSearch ? `default active-search` : `default`} icon={<UilFilter />} onClick={() => setIsShowSearch(!isShowSearch)}>Lọc</Button>
                    <Button className="default" onClick={handleOpenExportBill} disabled={listItemHasChoose.length > 0 ? false : true} type="primary">Tạo Phiếu Xuất Kho</Button>
                  </Space>
                </Col>
              </Row>
              {isShowSearch && (
                <FilterWareHouseItem
                  isSearch={isSearch}
                  handleIsSearch={(envSearch) => setIsSearch(envSearch)}
                  handleChangeName={(value) => setNameSearch(value)}
                  page='receiving'
                />)}
            </Card>
            <span style={{ marginLeft: 8, paddingBottom: 8 }}>
              {listItemHasChoose.length > 0 ? `Đã chọn ${listItemHasChoose.length} mặt hàng` : ''}
            </span>
          </div>
          <TableWareHouse
            setIsShowPopUp={() => setIsShowPopUp(true)}
            setRowsSelect={handleDataRowSelected as any}
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
        statusModal && (
          <ModalCreateEntry
            isShowModal={statusModal}
            onCloseModal={() => setStatusModal(false)}
            listItem={listItemHasChoose as any}
            idReceiving={idRecipient}
            nameSource={nameReceiving}
            removeItemList={removeItemList}
            fetching={async () => await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total)}
            listWareHouse={listWareHouse}
          />
        )
      }
    </Row>

  )
}

export default RecipientItem