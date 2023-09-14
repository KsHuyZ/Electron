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
import { CountDeliveryType } from "../History";
import AddWareHouseItem from "@/page/WarehouseItem/components/AddWareHouseItem";
import { useNavigate } from "react-router-dom";
import ModalDelete from "./ModalDelete";

interface PropsModal {
  isShowModal: boolean;
  onCloseModal: () => void;
  select?: CountDeliveryType;
  path: string;
  reFetch: () => void;
  isOfficial: boolean
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
    case 'quantity':
    case 'price':
      return <Tooltip placement="top" title={`${dataIndex === "price" ? "Giá hiện tại" : "Số lượng hiện có"} ${record[dataIndex]}`}>
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
    case 'name':
      return (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
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
      )

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
    select,
    path,
    reFetch,
    isOfficial
  } = props;

  const navigate = useNavigate()

  const [listItemEntryForm, setListItemEntryForm] = useState<DataType[]>([]);
  const [itemEditList, setItemEditList] = useState<DataType[]>([])
  const [removeItemList, setRemoveItemList] = useState<DataType[]>([])
  const [newItemList, setNewItemList] = useState<DataType[]>([])
  const [listItemHasChoose, setListItemHasChoose] = useState<DataType[]>([])
  const [listSource, setListSource] = useState<{ name: string, ID: number }[]>([])
  const [listWarehouse, setListWarehouse] = useState<{ name: string, ID: number }[]>([])
  const [isError, setIsError] = useState(false);
  const [showAddItem, setShowAddItem] = useState<boolean>(false)
  const [currentListItem, setCurrentListItem] = useState<DataType[]>([])
  const [isValidForm, setIsValidForm] = useState<{ message: string, isValid: boolean }>({ isValid: true, message: "" })
  const [showModalDelete, setShowModalDelete] = useState<boolean>(false)

  const formRef = useRef<FormInstance>(null);
  const isExport = path.includes("export")
  const isTemp = path.includes("temp")
  let errorData = false

  const optionSource: OptionSelect[] = listSource.map(source => (
    {
      label: source?.name,
      value: source?.ID
    }
  ));
  const optionWareHouse: OptionSelect[] = listWarehouse.map(source => (
    {
      label: source?.name,
      value: source?.ID
    }
  ))
  const handleGetCouponItemByCouponId = async () => {
    if (select) {
      const result = await ipcRenderer.invoke(`get-${path}-item-by-id`, select?.ID)
      setListItemEntryForm(removeItemChildrenInTable(result as any))
      setCurrentListItem(result)
      formRef.current?.setFieldsValue(select)
      formRef.current?.setFieldValue("date", dayjs(select?.date))
    }
  }

  const handleSave = (data: DataType) => {
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
    const result = await ipcRenderer.invoke(path.includes("export") ? "receiving-list" : "get-all-no-pagination")
    setListSource(result.rows)
  }
  const handleGetAllWareHouse = async () => {
    const result = await ipcRenderer.invoke("get-warehouse-no-pagination")
    setListWarehouse(result.rows)
  }

  useEffect(() => {
    if (!isShowModal) {
      setListItemHasChoose([])
    }
  }, [isShowModal])

  useEffect(() => {

    if (listItemHasChoose.length !== 0) {
      const removeIds = new Set(removeItemList.map(item => item.IDIntermediary));
      const newArray = currentListItem.filter(item => !removeIds.has(item.IDIntermediary))
      setListItemEntryForm((removeItemChildrenInTable([...newArray, ...listItemHasChoose])))
      setNewItemList(listItemHasChoose)
    }

  }, [listItemHasChoose])

  useEffect(() => {
    handleGetCouponItemByCouponId()
  }, [select])

  useEffect(() => {
    handleGetAllSource()
    if (path.includes("import")) {
      handleGetAllWareHouse()
    }
  }, [path])



  let columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: "Tên Kho Hàng",
      dataIndex: "nameWareHouse",
      key: "nameWareHouse",
      width: 200,
    },
    {
      title: "Tên mặt hàng",
      dataIndex: "name",
      editable: true,
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
  if (!isExport) {
    columns = columns.filter(column => column.key !== "nameWareHouse")
  }
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
          onClick={handleSubmitForm}
        >
          Lưu
        </Button>
      </Space>
    );
  };

  const handleClean = () => {
    onCloseModal();
    formRef.current?.resetFields();
    setIsValidForm({ message: "", isValid: true })
    setNewItemList([])
    setRemoveItemList([])
  };

  const onFinishFormManagement = async (values: ModalEntryForm) => {
    if (listItemEntryForm.length < 1) {
      message.error("Không có sản phẩm để làm phiếu");
      return;
    }
    if (!isValidForm.isValid) {
      return message.error(isValidForm.message)
    }
    const idWarehouse = formRef.current?.getFieldValue(path.includes("export") ? "id_WareHouse" : "id_Source")
    const item = listSource.find(src => src.ID === idWarehouse)
    const params: any = {
      ...values,
      ID: select?.ID,
      removeItemList,
      newItemList,
      items: listItemEntryForm,
      name: values.name,
      note: values.note,
      nature: values.nature,
      date: formatDate(values.date, false, "no_date"),
      total: totalPrice,
      title: values.title,
      nameSource: item?.name,
      id_WareHouse: idWarehouse,
      idSource: idWarehouse,
    };
    // const result = await ipcRenderer.invoke(`print-${path}-edit`, { ...params });
    const result = await ipcRenderer.invoke(!isOfficial ? `${path}-edit` : "print-form-import", { ...params })
    if (result.success) {
      if (!isOfficial) {
        reFetch()
        message.success("Sửa phiếu thành công")
        handleClean()
      } else {
        message.success("làm phiếu thành công")
        handleClean()
        navigate("/history/import")
      }

    } else {
      return message.error(result.error)
    }
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
    )
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

  const handleAddNewItem = async (item: DataType) => {
    setListItemEntryForm(prev => removeItemChildrenInTable([...prev, { ...item, quantity: item.quantity_real, IDWarehouse: select?.idWareHouse }]))
  }

  const handleValidateQuantity = (quantity: number, quantityI: number, quantityOrigin: number) => {

    if (quantity - quantityOrigin + quantityI >= 0 || !quantityI || !quantityOrigin) return true
    return false
  }

  const handleValidForm = (record: DataType & { quantityI: number, quantityOrigin: number }, index: number) => {
    if ((!record.price || !record.date_expried) && isOfficial) {
      if (isValidForm.isValid && isShowModal) {
        errorData = true
        if (errorData && index === listItemEntryForm.length - 1) {
          setIsValidForm({ isValid: false, message: "Các mặt hàng chưa được nhập đầy đủ thông tin" })
        }
      }
      return "red"
    }
    if (!handleValidateQuantity(Number(record.quantity), record.quantityI, record.quantityOrigin)) {
      if (isValidForm.isValid && isShowModal) {
        errorData = true
        if (errorData && index === listItemEntryForm.length - 1) {
          setIsValidForm({ isValid: false, message: "Bạn đã xuất hoặc chuyển mặt hàng sang kho khác với số lượng lớn hơn" })
        }
      }
      return "red"
    }
    if (!errorData && index === listItemEntryForm.length - 1 && !isValidForm.isValid) {
      setIsValidForm({ isValid: true, message: "" })
    }
    return "black"

  }

  const handleBackupData = (ids: (number | string)[]) => {
    const listItemBackup = removeItemList.filter(item => ids.includes(item.IDIntermediary))
    setListItemEntryForm(prev => [...prev, ...listItemBackup])
    setRemoveItemList(prev => prev.filter(item => !ids.includes(item.IDIntermediary)))
  }
  return (
    <CheckingErrorContext.Provider value={contextValue}>
      <Modal
        title={`Sửa phiếu ${isTemp ? "tạm" : ""} ${isExport ? "xuất" : "nhập"}`}
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
                label={isExport ? "Cấp theo" : "Tên loại phiếu"}
                name={nameOfEntryForm("title")}
                rules={[
                  {
                    required: true,
                    message: isExport ? "Cấp theo" : "Tên loại phiếu",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={isExport ? "Đơn vị nhận" : "Nguồn nhập"} name={isExport ? "id_WareHouse" : "id_Source"}>
                <Select options={optionSource} />
              </Form.Item>
            </Col>
            {path.includes("import") ? <Col span={8}>
              <Form.Item label={"Thuộc kho"} name={"idWareHouse"}>
                <Select options={optionWareHouse} />
              </Form.Item>
            </Col> : null}

            <Col span={8}>
              <Form.Item
                label="Loại nhập"
                name="nature"
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
                name={"date"}
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
              <Form.Item label="Người làm phiếu" name={nameOfEntryForm("author")} rules={[
                {
                  required: true,
                  message: "Người làm phiếu không được để trống"
                }
              ]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Hợp đồng số" name={nameOfEntryForm("numContract")} rules={[
                {
                  required: true,
                  message: "Hợp đồng số không được để trống"
                }
              ]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={path.includes("import") ? 8 : 16}>
              <Form.Item label="Chú thích" name={"note"}>
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

          {!isOfficial ? <Space align="center">
            <Button
              style={{ margin: "10px 0" }}
              type="primary"
              onClick={() => setShowAddItem(true)}
            >
              Thêm sản phẩm
            </Button>
            <Button
              style={{ margin: "10px 0" }}
              type="primary"
              onClick={() => setShowModalDelete(true)}>
              Xem mặt hàng đã xóa
            </Button>
          </Space> : null}
          <Table
            columns={newColumn as any}
            dataSource={listItemEntryForm as any}
            bordered
            pagination={false}
            components={isOfficial ? undefined : components}
            scroll={{ y: 500 }}
            style={{ maxWidth: "1200px" }}
            onRow={(record, index) => ({
              style: {
                color: handleValidForm(record, index),
              }
            })}
            rowKey={(item: DataType) => item.IDIntermediary}
          />
        </Form>
        <ModalDelete listItemDelete={removeItemList}
          isShow={showModalDelete}
          closeModal={() => setShowModalDelete(false)}
          onSubmit={(ids) => handleBackupData(ids)} />
        {isExport ? <TableListItem
          isShow={showAddItem}
          onCloseModal={() => setShowAddItem(false)}
          setListItem={setListItemHasChoose}
          listItem={listItemHasChoose}
        /> : <AddWareHouseItem
          isShowModal={showAddItem}
          onCloseModal={() => setShowAddItem(false)}
          onCreateItem={handleAddNewItem} />}
      </Modal>
    </CheckingErrorContext.Provider>
  );
};

export default ModalCreateEntry;
