import { useState, useEffect, useCallback } from "react";
import { UilFilter, UilSearch } from '@iconscout/react-unicons'
import { Row, Col, Card, Input, Button, Space, Tag, Select } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { DataType, ISearchWareHouseItem, STATUS_MODAL } from "@/page/WarehouseItem/types";
import { formatNumberWithCommas, getDateExpried, renderTextStatus, createFormattedTable, removeItemChildrenInTable, defaultRows } from "@/utils";
import { ResponseIpc, TableData, FormatTypeTable, OptionSelect, QUALITY_PRODUCT, STATUS } from "@/types";
import { TablePaginationConfig } from "antd/es/table";
import { useSearchParams, useParams } from "react-router-dom";
import { ipcRenderer } from "electron";
import ModalCreateEntry from "../components/ModalCreateEntry";
import TableWareHouse from "@/page/WarehouseItem/components/TableWareHouse";

const defaultTable: TableData<DataType[]> = {
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  rows: defaultRows,
};

const ListEntryForm = () => {
  const [nameSearch, setNameSearch] = useState("");
  const [isSearch, setIsSearch] = useState<Boolean>(false);
  const [listData, setListData] = useState<TableData<FormatTypeTable<DataType>[]>>(defaultTable);
  const [isListenChange, setIsListenChange] = useState(false);
  const [statusModal, setStatusModal] = useState<boolean>(false);
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([]);
  const { id, nameSource } = useParams();
  const [listWareHouse, setListWareHouse] = useState<OptionSelect[]>([]);
  const [selectSearch, setSelectSearch] = useState<{ select: string }>();

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
      dataIndex: 'prev_idwarehouse',
      render: (value, row: DataType, index) => {
        const trueIndex =
          index + listData.pagination.pageSize * (1 - 1);
        const obj = {
          children: (<b>{!value ? row.nameWareHouse : listWareHouse[Number(value) - 1]?.label}</b>),
          props: {} as any
        };
        if (!row.prev_idwarehouse) {
          if (index > 0 && row.id_WareHouse === listData.rows[trueIndex - 1].id_WareHouse) {
            obj.props.rowSpan = 0;
            // obj.props.colSpan = 2;
          }
          else {
            for (let i = 0; trueIndex + i !== listData.rows.length && row.id_WareHouse === listData.rows[trueIndex + i].id_WareHouse; i += 1) {
              obj.props.rowSpan = i + 1;
            }
          }
        }
        else {
          if (index > 0 && row.prev_idwarehouse === listData.rows[trueIndex - 1].prev_idwarehouse) {
            obj.props.rowSpan = 0;
            // obj.props.colSpan = 2;
          }
          else {
            for (let i = 0; trueIndex + i !== listData.rows.length && row.prev_idwarehouse === listData.rows[trueIndex + i].prev_idwarehouse; i += 1) {
              obj.props.rowSpan = i + 1;
            }
          }
        }
        return obj;
      },
      width: 200,
    },
    {
      title: 'Đơn Vị Nhận ',
      dataIndex: 'nameWareHouse',
      width: 200,
      render: (record, value: DataType) => {
        return (
          <span>{!value.prev_idwarehouse ? '' : record}</span>
        )
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
      await getListWareHouse();
    })
  }, []);

  useEffect(() => {
    if (isSearch) {
      new Promise(async () => {
        await getListItem(listData.pagination.pageSize, listData.pagination.current, listData.pagination.total);
      })
    }
  }, [isSearch, selectSearch]);

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


  const getListItem = async (pageSize: number, currentPage: number, total: number) => {

    setListData({
      ...listData,
      pagination: {
        current: isSearch ? 1 : currentPage,
        pageSize: pageSize,
        total: total
      },
      loading: true
    });


    const paramsSearch: { name: string, itemWareHouse: any } = {
      name: nameSearch ?? '',
      itemWareHouse: selectSearch?.select ?? ''
    };

    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke("source-entry-form-request-read", { pageSize: pageSize, currentPage: isSearch ? 1 : currentPage, id: id, paramsSearch: paramsSearch });
    if (result) {
      setListData((prev) => (
        {
          ...prev,
          rows: result.rows,
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
  };


  const removeItemList = (IDIntermediary: string[]) => {

    const newList = removeItemChildrenInTable(listItemHasChoose);

    const filterNewList = newList.filter(item => !IDIntermediary.includes(item.IDIntermediary));
    setListItemHasChoose(filterNewList);
    setIsListenChange(true);
  }

  const handleChangeInput = (key: string, event: any) => {
    if (key === 'select') {
      setSelectSearch({
        select: event
      });
      setIsSearch(true);
    } else {
      setNameSearch(event.target.value);
    }
  }

  const handleSearchName = () => {
    setIsSearch(true);
  }

  const checkingStatus = useCallback(() => {
    if (listItemHasChoose.length > 0 && listItemHasChoose.filter((item) => item.status === STATUS.IMPORT).length <= 0) {
      return true;
    }
    return false;
  }, [listItemHasChoose]);

  return (
    <Row className="filter-bar">
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: '16px 0' }}>
              <Row className="filter-bar">
                <Col span={10} className="col-item-filter">
                  <div className="form-item" style={{ width: '70%' }}>
                    <label htmlFor="">Tên mặt hàng</label>
                    <Input value={nameSearch} onChange={(event) => handleChangeInput('name', event)} />
                  </div>
                  <Button type="primary" onClick={handleSearchName}><UilSearch /></Button>
                </Col>
                <Col span={10} className="col-item-filter">
                  <div className="form-item" style={{ width: '70%' }}>
                    <label htmlFor="">Kho Hàng</label>
                    <Select
                      style={{ width: '100%' }}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={listWareHouse}
                      onChange={(value) => handleChangeInput('select', value)}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
            <span style={{ marginLeft: 8, paddingBottom: 8 }}>
              {listItemHasChoose.length > 0 ? `Đã chọn ${listItemHasChoose.length} mặt hàng` : ''}
            </span>
          </div>
          <TableWareHouse
            isShowSelection={true}
            columns={columns}
            dataSource={listData.rows as any}
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
            setRowsSelect={handleDataRowSelected as any}
            listRowSelected={listItemHasChoose}
          />
        </div>
      </Col>
    </Row>
  )
}

export default ListEntryForm