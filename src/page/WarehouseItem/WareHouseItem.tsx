import {
  Row,
  Col,
  Card,
  Select,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Input,
  Upload,
  DatePicker,
} from "antd";
import "./styles/wareHouseItem.scss";
import { UilFilter, UilSearch, UilExport } from "@iconscout/react-unicons";
import type { ColumnsType } from "antd/es/table";

import { useEffect, useState } from "react";
import {
  UilMultiply,
  UilPen,
  UilExclamationCircle,
} from "@iconscout/react-unicons";
import {
  renderTextStatus,
  formatNumberWithCommas,
  getDateExpried,
} from "@/utils";
import { DataType, ISearchWareHouseItem, STATUS_MODAL } from "./types";
import TableWareHouse from "./components/TableWareHouse";
import { ipcRenderer } from "electron";
import { ResponseIpc, TableData, QUALITY_PRODUCT } from "@/types";
import { Link, useParams } from "react-router-dom";
import { TablePaginationConfig } from "antd/es/table";
import TransferModal from "./components/TransferModal";
import FilterWareHouseItem from "./components/FilterWareHouseItem";
import { useSearchParams } from "react-router-dom";
import ModalCreateEntry from "./components/ModalCreateEntry";
import ExportFiles from "./components/ExportFiles";

const { confirm } = Modal;

const defaultRows: DataType[] = [
  {
    IDIntermediary: "",
    name: "",
    price: "",
    unit: "",
    quality: null,
    note: "",
    quantity_plane: null,
    quantity_real: null,
    status: null,
    date_expried: "",
    date_created_at: "",
    date_updated_at: "",
    isExport: false,
    priceOrigin: 0,
    quantityPlaneOrigin: 0,
    quantityRemain: 0,
    quantityOrigin: 0,
  },
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



const WareHouseItem = () => {
  const [isShowPopUp, setIsShowPopUp] = useState<Boolean>(false);
  const [listData, setListData] = useState<TableData<DataType[]>>(defaultTable);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const { idWareHouse, nameWareHouse } = useParams();
  const [statusModal, setStatusModal] = useState<STATUS_MODAL>(
    STATUS_MODAL.CLOSE
  );
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([]);
  const [isListenChange, setIsListenChange] = useState(false);
  const [isShowSearch, setIsShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [nameSearch, setNameSearch] = useState("");
  const [isSearch, setIsSearch] = useState<boolean>(false);


  const columns: ColumnsType<DataType> = [
    {
      title: "Mã mặt hàng",
      dataIndex: "IDWarehouseItem",
      width: 150,
      render: (record) => {
        return `MH${record < 10 ? "0" : ""}${record}`;
      },
    },
    {
      title: "Tên mặt hàng",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 200,
      render: (record) => (
        <span style={{ fontWeight: "bold" }}>
          {formatNumberWithCommas(record)}
        </span>
      ),
    },
    {
      title: "Số lượng",
      children: [
        {
          title: "Dự tính",
          dataIndex: "quantity_plane",
          width: 200,
          render: (record) => (
            <span> {new Intl.NumberFormat().format(record)}</span>
          ),
        },
        {
          title: "Thực tế",
          dataIndex: "quantity",
          width: 200,
          render: (record) => (
            <span>{new Intl.NumberFormat().format(record)}</span>
          ),
        },
      ],
    },
    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      width: 200,
    },
    {
      title: "Chất lượng mặt hàng",
      dataIndex: "quality",
      width: 200,
      render: (record) => {
        const findItem = QUALITY_PRODUCT.find((item) => item.value == record);
        return <span>{findItem?.label}</span>;
      },
    },
    {
      title: "Thời gian hết hạn",
      dataIndex: "date_expried",
      render: (record) => <span>{getDateExpried(record)}</span>,
      width: 200,
    },
    {
      title: "Thời gian nhập",
      dataIndex: "date",
      width: 200,
    },
    {
      title: "Chú thích",
      dataIndex: "note",
      width: 200,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      fixed: "right",
      width: 150,
      render: (confirm: number, value) => {
        const { text, color } = renderTextStatus(confirm);
        return (
          <div style={{ display: "flex" }}>
            {<Tag color={color}>{text}</Tag>}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getListItem(
      listData.pagination.pageSize,
      listData.pagination.current,
      listData.pagination.total
    );
  }, []);

  useEffect(() => {
    if (isSearch) {
      getListItem(
        listData.pagination.pageSize,
        listData.pagination.current,
        listData.pagination.total
      );
    }
  }, [isSearch]);

  const getListItem = async (
    pageSize: number,
    currentPage: number,
    total: number
  ) => {
    const parsedSearchParams = Object.fromEntries(searchParams);
    setListData({
      ...listData,
      pagination: {
        current: isSearch ? 1 : currentPage,
        pageSize: pageSize,
        total: total,
      },
      loading: true,
    });

    const paramsSearch: ISearchWareHouseItem = {
      name: nameSearch,
      idSource: Number(parsedSearchParams.idSource) || null,
      startDate: parsedSearchParams.startDate || "",
      endDate: parsedSearchParams.endDate || "",
      status: Number(parsedSearchParams.status) || null,
      now_date_ex: parsedSearchParams.now_date_ex || "",
      after_date_ex: parsedSearchParams.after_date_ex || "",
    };

    const result: ResponseIpc<DataType[]> = await ipcRenderer.invoke(
      "warehouseitem-request-read",
      {
        pageSize: pageSize,
        currentPage: isSearch ? 1 : currentPage,
        idWareHouse: idWareHouse,
        paramsSearch: paramsSearch,
      }
    );
    if (result) {
      setListData((prev) => ({
        ...prev,
        rows: result.rows as any,
        pagination: {
          ...prev.pagination,
          total: result.total as any,
        },
        loading: false,
      }));
      if (isSearch) {
        setIsSearch(false);
      }
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    getListItem(pagination.pageSize!, pagination.current!, pagination.total!);
  };

  const handleDataRowSelected = (listRows: DataType[]) => {
    setListItemHasChoose(
      listRows.map((item) => ({
        ...item,
        newQuantity: item.quantity!,
      }))
    );
  };

  const removeItem = async (
    IDIntermediary: number,
    IDWarehouseItem: number
  ) => {
    const result = await ipcRenderer.invoke(
      "delete-warehouseitem",
      IDIntermediary,
      IDWarehouseItem
    );
    if (result) {
      message.success("Xóa sản phẩm thành công");
      await getListItem(
        listData.pagination.pageSize,
        1,
        listData.pagination.total
      );
      setListItemHasChoose([]);
      setIsListenChange(true);
    }
  };

  const handleRemoveItem = (data: DataType) => {
    confirm({
      closable: true,
      title: `Bạn chắc chắn sẽ xóa MH [${data.name}] ?`,
      icon: <UilExclamationCircle />,
      okText: "Đồng ý",
      okType: "danger",
      cancelText: "Từ chối",
      onOk() {
        removeItem(Number(data.IDIntermediary), Number(data.IDWarehouseItem));
      },
      onCancel() { },
    });
  };

  const handleShowTransferModal = () => {
    setStatusModal(STATUS_MODAL.CLOSE);
  };

  const removeItemList = (IDIntermediary: string[]) => {
    const filterNewList = listItemHasChoose.filter(
      (item) => !IDIntermediary.includes(item.IDIntermediary)
    );
    setListItemHasChoose(filterNewList);
    setIsListenChange(true);
  };

  const handleSearchName = () => {
    setIsSearch(true);
  };




  // const handleExportReport = async () => {
  //   const result = await ipcRenderer.invoke('export-request-xlsx', nameWareHouse);

  //   if (result.filePath) {
  //     const response = await ipcRenderer.invoke('export-report-warehouseitem', { nameWareHouse: nameWareHouse, data: idWareHouse, filePath: result.filePath });

  //     if (response === 'error') {
  //       message.error('Xuất file không thành công');
  //     } else {
  //       message.success('Xuất file thành công');
  //     }
  //   }
  // }

  return (
    <Row className="filter-bar">
      <Row style={{ width: "100%" }} align="middle">
        <Col span={12}>
          <h2 style={{ margin: 0 }}>{nameWareHouse ?? ""}</h2>
        </Col>
      </Row>
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: "16px 0" }}>
              <Row className="filter-bar">
                <Col span={12} className="col-item-filter">
                  <div className="form-item" style={{ width: "60%" }}>
                    <label htmlFor="">Tên mặt hàng</label>
                    <Input
                      value={nameSearch}
                      onChange={(event) => setNameSearch(event.target.value)}
                    />
                  </div>
                  <Button type="primary" onClick={handleSearchName}>
                    <UilSearch />
                  </Button>
                </Col>
                <Col span={12}>
                  <Space direction="horizontal" size={24} wrap>
                    <Button
                      className={
                        isShowSearch ? `default active-search` : `default`
                      }
                      icon={<UilFilter />}
                      onClick={() => setIsShowSearch(!isShowSearch)}
                    >
                      Lọc
                    </Button>
                    <Button
                      className={
                        listItemHasChoose.length > 0 ? "active-border" : ""
                      }
                      disabled={listItemHasChoose.length > 0 ? false : true}
                      onClick={() => setStatusModal(STATUS_MODAL.TRANSFER)}
                    >
                      Chuyển Kho
                    </Button>
                    <Button
                      className="default"
                      onClick={() => setIsShowModal(true)}
                      type="primary"
                    >
                      Thêm Sản Phẩm
                    </Button>
                    <Link
                      className="btn btn-upload"
                      to={`/upload-multiple/${idWareHouse}/${nameWareHouse}`}
                    >
                      Thêm Sản Phẩm từ File
                    </Link>
                  </Space>
                </Col>
              </Row>
              {isShowSearch && (
                <FilterWareHouseItem
                  isSearch={isSearch}
                  handleIsSearch={(envSearch) => setIsSearch(envSearch)}
                  handleChangeName={(value) => setNameSearch(value)}
                />
              )}
              <ExportFiles
                nameWareHouse={nameWareHouse!}
                idWareHouse={idWareHouse!}
              />
            </Card>
            <span style={{ marginLeft: 8, paddingBottom: 8 }}>
              {listItemHasChoose.length > 0
                ? `Đã chọn ${listItemHasChoose.length} mặt hàng`
                : ""}
            </span>
          </div>
          <TableWareHouse
            setIsShowPopUp={() => setIsShowPopUp(true)}
            setRowsSelect={handleDataRowSelected as any}
            isShowSelection={true}
            columns={columns}
            dataSource={listData.rows}
            pagination={{
              ...listData.pagination,
              showSizeChanger: true,
            }}
            bordered
            loading={listData.loading}
            onChange={handleTableChange}
            isListenChange={isListenChange}
            setIsListenChange={(status: boolean) => setIsListenChange(status)}
            listRowSelected={listItemHasChoose}
          />
        </div>
      </Col>

      <ModalCreateEntry
        isShowModal={isShowModal}
        onCloseModal={() => setIsShowModal(false)}
        idWareHouse={idWareHouse}
        nameWareHouse={nameWareHouse}
        reFetch={async () =>
          await getListItem(
            listData.pagination.pageSize,
            listData.pagination.current,
            listData.pagination.total
          )
        }
      />

      {statusModal === STATUS_MODAL.TRANSFER && (
        <TransferModal
          isShow={statusModal}
          idWareHouse={idWareHouse}
          setIsShow={handleShowTransferModal}
          listItem={listItemHasChoose}
          removeItemList={removeItemList}
          fetching={async () =>
            await getListItem(
              listData.pagination.pageSize,
              listData.pagination.current,
              listData.pagination.total
            )
          }
        />
      )}
    </Row>
  );
};

export default WareHouseItem;
