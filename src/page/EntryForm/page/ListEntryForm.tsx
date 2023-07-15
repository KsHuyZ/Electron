import { useState, useEffect } from "react";
import { UilFilter, UilSearch } from '@iconscout/react-unicons'
import { Row, Col, Card, Input, Button, Space, Tag } from "antd";
import type { ColumnsType } from 'antd/es/table';
import TableWareHouse from "@/page/WarehouseItem/components/TableWareHouse";
import { DataType, ISearchWareHouseItem, STATUS_MODAL } from "@/page/WarehouseItem/types";
import { formatNumberWithCommas, getDateExpried, renderTextStatus, createFormattedTable, removeItemChildrenInTable } from "@/utils";
import { ResponseIpc,TableData,FormatTypeTable } from "@/types";
import { TablePaginationConfig } from "antd/es/table";
import { useSearchParams, useParams } from "react-router-dom";
import { ipcRenderer } from "electron";
import TableTree from "@/components/TreeTable/TreeTable";
import ModalCreateEntry from "../components/ModalCreateEntry";

const defaultRows: DataType[] = [
    {
      IDIntermediary: '',
      name: '',
      nameWareHouse : '',
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

const ListEntryForm = () =>{
    const [nameSearch, setNameSearch] = useState("");
    const [isSearch, setIsSearch] = useState<Boolean>(false);
    const [listData, setListData] = useState<TableData<FormatTypeTable<DataType>[]>>(defaultTable);
    const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
    const [isListenChange, setIsListenChange] = useState(false);
    const [statusModal, setStatusModal] = useState<boolean>(false);
    const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([]);
    const {id,nameSource} = useParams();
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
          title: 'Tên Kho Hàng',
          dataIndex: 'nameWareHouse',
          render: (text: string) => (<b>{text.toUpperCase()}</b>),
          width: 200,
        },
        {
          title: 'Tên mặt hàng',
          dataIndex: 'name',
          // render: (text) => <a>{text}</a>,
          // onCell: (_, index) => ({
          //   colSpan: index === 1 ? 2 : 1,
          // }),
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
          render : (record) =>(
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
          width: 200,
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
  }, []);

  useEffect(() => {
    if (isSearch) {
      new Promise(async () => {
        await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
      })
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

    console.log(parsedSearchParams);
    

    const paramsSearch: ISearchWareHouseItem = {
      name: parsedSearchParams.name || nameSearch,
      idSource: Number(parsedSearchParams.idSource) || null,
      startDate: parsedSearchParams.startDate || '',
      endDate: parsedSearchParams.endDate || '',
      status: Number(parsedSearchParams.status) || null,
      now_date_ex : parsedSearchParams.now_date_ex || '' ,
      after_date_ex : parsedSearchParams.after_date_ex || ''
    };
    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("source-entry-form-request-read", { pageSize: pageSize, currentPage: currentPage, id: id, paramsSearch: paramsSearch });
    if (result) {
      const responseRow = createFormattedTable(result.rows);
      setListData((prev) => (
        {
          ...prev,
          rows: responseRow,
          pagination: {
            ...prev.pagination,
            total: responseRow.length
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
    
      const handleDataRowSelected = (listRows: any) => {
        setListItemHasChoose(listRows);
      }

      const removeItemList = (IDIntermediary: string) => {
        const newList = removeItemChildrenInTable(listItemHasChoose);
        
        const filterNewList = newList.filter(item => item.IDIntermediary !== IDIntermediary);
        setListItemHasChoose(filterNewList);
        setIsListenChange(true);
      }

      console.log(listData);
      
      
    return (
        <Row className="filter-bar">
      {/* <Row style={{ width: '100%' }} align="middle">
        <Col span={12}>
          <h2 style={{margin : 0}}>Nguồn Hàng </h2>
        </Col>
      </Row> */}
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
                  <Button type="primary" ><UilSearch /></Button>
                </Col>
                <Col span={12}>
                  <Space direction="horizontal" size={24}>
                    {/* <Button className={true ? `default active-search` : `default`} icon={<UilFilter />}>Lọc</Button> */}
                    <Button className={listItemHasChoose.length > 0 ? 'active-border' : ''} disabled={listItemHasChoose.length > 0 ? false : true} onClick={() => setStatusModal(true)}>Làm Phiếu Nhập</Button>
                    {/* <Button className="default" onClick={() => setIsShowModal(true)} type="primary">Thêm Sản Phẩm</Button> */}
                  </Space>
                </Col>
              </Row>
              {/* {isShowSearch && (
                <FilterWareHouseItem
                  name={nameSearch}
                  isSearch={isSearch}
                  handleIsSearch={(envSearch) => setIsSearch(envSearch)}
                  handleChangeName={(value) => setNameSearch(value)}
                />)} */}
            </Card>
            <span style={{ marginLeft: 8, paddingBottom: 8 }}>
              {listItemHasChoose.length > 0 ? `Đã chọn ${listItemHasChoose.length} mặt hàng` : ''}
            </span>
          </div>
          <TableTree
          isShowSelection={true}
            columns={columns}
            data={listData.rows as any}
            pagination = {
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
            setRowsSelect={handleDataRowSelected as any}
            listRowSelected={listItemHasChoose}
          />
        </div>
      </Col>
      
      {
        statusModal &&(
          <ModalCreateEntry
            isShowModal={statusModal}
            onCloseModal={() => setStatusModal(false)}
            listItem={listItemHasChoose as any}
            idSource={id}
            nameSource={nameSource}
            removeItemList={removeItemList}
            // fetching={async () => await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total)}
          />
        )
      }
    </Row>
    )
}

export default ListEntryForm