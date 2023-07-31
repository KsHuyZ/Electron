import React, { useState, useMemo, useRef, useEffect, useContext, Ref } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Select,
  Space,
  Button,
  DatePicker,
  Tag,
  Table,
  message,
  InputRef,
  Tooltip,
} from "antd";
import { ModalEntryForm } from "../../EntryForm/types";
import { nameOf, OptionSelect, FormatTypeTable } from "@/types";
import { DataType } from "@/page/WarehouseItem/types";
import {
  formatNumberWithCommas,
  removeItemChildrenInTable,
  formatDate,
} from "@/utils";
import { getMessage, ERROR } from "@/page/WarehouseItem/constants/messValidate";
import { UilMultiply } from "@iconscout/react-unicons";
import { FormInstance } from "antd/lib/form";
import docso from "@/utils/toVietnamese";
import { ipcRenderer } from "electron";
import dayjs from "dayjs";
import TableListItem from "./TableListItem";

type CountDeliveryType = {
  ID: number;
  Nature: string;
  Note: string;
  name: string;
  title: string;
  TotalPrice: number;
  date: string;
  nameReceiving: string;
  nameSource: string;
  id_Source: number | string
}

interface PropsModal {
  isShowModal: boolean;
  onCloseModal: () => void;
  select?: CountDeliveryType
}

const defaultOptionNature: OptionSelect[] = [
  {
    label: "Thường Xuyên",
    value: "Thường Xuyên",
  },
  {
    label: "Nhập Theo KH",
    value: "Nhập Theo KH",
  },
];

const EditableContext = React.createContext<FormInstance<any> | null>(null);
const CheckingErrorContext = React.createContext<any>(null);

interface EditableRowProps {
  index: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof DataType;
  record: DataType;
  handleSave: (record: DataType) => void;
}

type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const handleSelectInput = (title: React.ReactNode, ref: Ref<InputRef>, record: DataType, dataIndex: keyof DataType, save: () => void) => {
  const numberValidator = (_: unknown, value: any) => {
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      return Promise.reject(`Giá trị phải là số và lớn hơn 0.`);
    }
    return Promise.resolve();
  };

  switch (dataIndex) {
    case 'date_expried':
      return <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          { validator: numberValidator },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(`${title} bắt buộc nhập.`);
              }
              return Promise.resolve();
            },
          }),
        ]}
      >

        <DatePicker ref={ref} onOk={save} onChange={save} />
      </Form.Item>
      break;
    case 'quantity_plane':
      return <Tooltip placement="top" title={`Số lượng hiện có ${record[dataIndex]}`}>
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            { validator: numberValidator },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(`${title} bắt buộc nhập.`);
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input ref={ref} onPressEnter={save} onBlur={save} />
        </Form.Item>
      </Tooltip>
    case 'quantity':
      return <Tooltip placement="top" title={`Số lượng hiện có ${record[dataIndex]}`}>
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            { validator: numberValidator },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(`${title} bắt buộc nhập.`);
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input ref={ref} onPressEnter={save} onBlur={save} />
        </Form.Item>
      </Tooltip>
    case 'price':
      return <Tooltip placement="top" title={`Số lượng hiện có ${record[dataIndex]}`}>
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            { validator: numberValidator },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(`${title} bắt buộc nhập.`);
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input ref={ref} onPressEnter={save} onBlur={save} />
        </Form.Item>
      </Tooltip>
    default:
      break;
  }

}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const { isError, setIsError } = useContext(CheckingErrorContext);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: dataIndex === 'date_expried' ? dayjs(record[dataIndex]) : record[dataIndex] })
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const key = Object.keys(values)[0]
      const tempValue: any = Object.values(values)[0]
      const value = key === 'date_expried' ? dayjs(tempValue).format("YYYY/MM/DD") : Object.values(values)[0]
      setIsError(false);
      toggleEdit();
      handleSave({ ...record, [key]: value });
    } catch (errInfo) {
      setIsError(true);
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      handleSelectInput(title, inputRef, record, dataIndex, save)
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const nameOfEntryForm = nameOf<ModalEntryForm>();

const ModalCreateEntry: React.FC<PropsModal> = (props) => {

  const {
    isShowModal,
    onCloseModal,
    select
  } = props;

  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [listItemEntryForm, setListItemEntryForm] = useState<DataType[]>([]);
  const [itemEditList, setItemEditList] = useState<DataType[]>([])
  const [removeItemList, setRemoveItemList] = useState<DataType[]>([])
  const [newItemList, setNewItemList] = useState<DataType[]>([])
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([])
  const [listSource, setListSource] = useState<{ name: string, ID: number }[]>([])
  const [paginationInfo, setPaginationInfo] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isError, setIsError] = useState(false);
  const [showAddItem, setShowAddItem] = useState<boolean>(false)
  const formRef = useRef<FormInstance>(null);

  const optionSource: OptionSelect[] = listSource.map(source => (
    {
      label: source?.name,
      value: source?.ID
    }
  ));
  const handleGetCouponItemByCouponId = async () => {
    const result = await ipcRenderer.invoke("get-coupon-item-by-coupon-id", select?.ID)
    setListItemEntryForm(removeItemChildrenInTable(result as any))
  }
  const handleSave = (data: DataType) => {
    console.log(data);
    const newList = listItemEntryForm.map(item => item.IDIntermediary === data.IDIntermediary ? data : item)
    const index = itemEditList.findIndex(item => item.IDIntermediary === data.IDIntermediary)
    setItemEditList(prev => {
      let newArray = [...prev]
      if (index > -1) {
        newArray[index] = data
      } else {
        newArray = [...prev, data]
      }
      return newArray
    })
    setListItemEntryForm(removeItemChildrenInTable(newList));
  }
  const handleGetAllSource = async () => {
    const result = await ipcRenderer.invoke("get-all-no-pagination")
    setListSource(result.rows)
  }
  useEffect(() => {
    if (listItemHasChoose.length !== 0) {
      setNewItemList(listItemHasChoose)
      setListItemEntryForm(prev => (removeItemChildrenInTable([...prev, ...listItemHasChoose])))
      setListItemHasChoose([])
    }
  }, [listItemHasChoose])

  useEffect(() => {
    handleGetCouponItemByCouponId()
  }, [select])

  useEffect(() => {
    handleGetAllSource()
  }, [])

  const columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: "Tên Kho Hàng",
      dataIndex: "nameWareHouse",
      render: (value, row: any, index) => {
        const trueIndex =
          index + paginationInfo.pageSize * (paginationInfo.current - 1);
        const obj = {
          children: <b>{value?.toUpperCase() ?? ""}</b>,
          props: {} as any,
        };
        if (
          index > 0 &&
          row.id_WareHouse === listItemEntryForm[trueIndex - 1].id_WareHouse
        ) {
          obj.props.rowSpan = 0;
          // obj.props.colSpan = 2;
        } else {
          for (
            let i = 0;
            trueIndex + i !== listItemEntryForm.length &&
            row.id_WareHouse === listItemEntryForm[trueIndex + i].id_WareHouse;
            i += 1
          ) {
            obj.props.rowSpan = i + 1;
          }
        }
        return obj;
      },
      width: 200,
    },
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
      title: "Đơn vị tính",
      dataIndex: "unit",
      width: 200,
    },
    {
      title: "Thời gian hết hạn",
      dataIndex: "date_expried",
      editable: true,
      render: (record) => <span>{record}</span>,
      width: 200,
    },
    {
      title: "Dự tính",
      dataIndex: "quantity_plane",
      editable: true,
      width: 200,
      render: (record) => (
        <span> {new Intl.NumberFormat().format(record)}</span>
      ),
    },
    {
      title: "Thực tế",
      dataIndex: "quantity",
      editable: true,
      width: 200,
      render: (record) => (
        <span>{new Intl.NumberFormat().format(record)}</span>
      ),
    },
    {
      title: "Giá lẻ",
      dataIndex: "price",
      editable: true,
      width: 200,
      render: (record) => (
        <span style={{ fontWeight: "bold" }}>
          {formatNumberWithCommas(record)}
        </span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      width: 200,
      render: (record) => (
        <span style={{ fontWeight: "bold" }}>
          {formatNumberWithCommas(record)}
        </span>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      fixed: "right",
      width: 150,
      render: (_, record: any) => (
        <Space size="middle">
          <UilMultiply
            style={{ cursor: "pointer" }}
            onClick={() => handleRemoveItem(record.IDIntermediary)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmitForm = async () => {
    try {
      await formRef?.current!.validateFields();
      formRef.current?.submit();
    } catch (error: any) {
      if (error?.errorFields?.length > 0) {
        const firstErrorField = error?.errorFields[0];
        const firstErrorNode = document.getElementById(
          `${firstErrorField.name.toString()}`
        );
        if (firstErrorNode) {
          firstErrorNode.scrollIntoView({ behavior: "smooth" });
          firstErrorNode.focus();
        }
      }
    }
  };

  const Footer = () => {
    return (
      <Space
        align="center"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Button onClick={handleClean}>Đóng</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loadingButton}
          onClick={handleSubmitForm}
        >
          Làm phiếu
        </Button>
      </Space>
    );
  };

  const handleClean = () => {
    onCloseModal();
    formRef.current?.resetFields();
  };

  const onFinishFormManagement = async (values: ModalEntryForm) => {
    if (listItemEntryForm.length < 1) {
      message.error("Không có sản phẩm để làm phiếu");
      return;
    }
    const params: any = {
      ...values,
      ID: select?.ID,
      removeItemList,
      newItemList,
      itemEditList,
      items: listItemEntryForm,
      name: values.name,
      note: values.note,
      nature: values.nature,
      date: formatDate(values.date, false, "no_date"),
      total: totalPrice,
      title: values.title,
      nameSource: select?.nameSource,
    };

    const result = await ipcRenderer.invoke("print-import-edit", { ...params });
    setLoadingButton(true);
  };

  const handleRemoveItem = (id: string) => {
    const filterItem = listItemEntryForm.filter(
      (cur) => cur.IDIntermediary !== id
    );
    const removeItem = listItemEntryForm.find(item => item.IDIntermediary === id)
    const isNewItemIndex = newItemList.findIndex(item => item.IDIntermediary === id)
    const newArray = itemEditList.filter(item => item.IDIntermediary !== id)
    if (newArray) setItemEditList(newArray)
    setListItemEntryForm(filterItem);
    if (removeItem && isNewItemIndex === -1) {
      setRemoveItemList(prev => ([...prev, removeItem]))
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const totalPrice = useMemo(() => {
    return listItemEntryForm.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.price) * currentValue.quantity!,
      0
    );
  }, [listItemEntryForm]);
  const newColumn = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  const handleSetError = (params: boolean) => {
    setIsError(params)
  }
  const contextValue = {
    isError,
    setIsError: handleSetError
  }
  return (
    <CheckingErrorContext.Provider value={contextValue}>
      <Modal
        title={`Sửa phiếu nhập`}
        centered
        open={isShowModal}
        onCancel={handleClean}
        width={"90%"}
        footer={<Footer />}
      >
        <Form layout="vertical" ref={formRef} onFinish={onFinishFormManagement}>
          <Row gutter={32}>
            <Col span={8}>
              <Form.Item
                label="Tên đơn vị"
                name={nameOfEntryForm("name")}
                initialValue={select?.name}
                rules={[
                  {
                    required: true,
                    message: getMessage(ERROR.ERROR_1, "Tên đơn vị"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={"Tên loại phiếu"}
                name={nameOfEntryForm("title")}
                initialValue={select?.title}
                rules={[
                  {
                    required: true,
                    message: "Tên loại phiếu",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={"Nguồn nhập"} name={nameOfEntryForm("idSource")} initialValue={select?.id_Source}>
                <Select options={optionSource} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Loại nhập"
                name={nameOfEntryForm("nature")}
                initialValue={select?.Nature}
                rules={[
                  {
                    required: true,
                    message: getMessage(ERROR.ERROR_1, "Loại nhập"),
                  },
                ]}
              >
                <Select options={defaultOptionNature} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Thời gian làm phiếu"
                name={nameOfEntryForm("date")}
                initialValue={dayjs(select?.date)}
                rules={[
                  {
                    required: true,
                    message: getMessage(ERROR.ERROR_1, "Thời gian làm phiếu"),
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Chú thích" name={nameOfEntryForm("note")}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <h4>
                Thành tiền : {`${new Intl.NumberFormat().format(totalPrice)} vnđ`}
              </h4>
              <h4>(Bằng chữ : {`${docso(totalPrice)} đồng`})</h4>
            </Col>
          </Row>

          <Space align="center" >
            <h3>SẢN PHẨM THUỘC {select?.nameSource?.toLocaleUpperCase() ?? ""}</h3>
            <Button
              type="primary"
              onClick={() => setShowAddItem(true)}
            >
              Thêm sản phẩm mới
            </Button>
          </Space>
          <Table
            columns={newColumn as any}
            dataSource={listItemEntryForm as any}
            bordered
            pagination={false}
            components={components}
            scroll={{ y: 500 }}
            style={{ maxWidth: "1200px" }}
            rowKey={(item: DataType) => item.IDIntermediary}
          />
        </Form>
        <TableListItem id={select?.id_Source} isShow={showAddItem} onCloseModal={() => setShowAddItem(false)} setListItem={setListItemHasChoose} />
      </Modal>
    </CheckingErrorContext.Provider>
  );
};

export default ModalCreateEntry;
