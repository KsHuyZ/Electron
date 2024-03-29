import React, { useState, useMemo, useRef, useEffect, Ref, useContext } from "react";
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
  Tooltip,
  InputRef,
} from "antd";
import { ModalEntryForm } from "../../EntryForm/types";
import { nameOf, OptionSelect, FormatTypeTable } from "@/types";
import { ColumnsType } from "antd/es/table";
import { DataType } from "@/page/WarehouseItem/types";
import {
  formatNumberWithCommas,
  getDateExpried,
  formatDate,
} from "@/utils";
import { getMessage, ERROR } from "@/page/WarehouseItem/constants/messValidate";
import { UilMultiply } from "@iconscout/react-unicons";
import { FormInstance } from "antd/lib/form";
import docso from "@/utils/toVietnamese";
import { ipcRenderer } from "electron";
import dayjs from "dayjs";

interface PropsModal {
  isShowModal: any;
  onCloseModal: () => void;
  listItem: DataType[];
  reFetch: () => Promise<void>;
}

interface EditableRowProps {
  index: number;
}
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
type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof DataType;
  record: DataType;
  handleSave: (record: DataType) => void;
}

const removeItemChildrenInTable = (
  arrays: FormatTypeTable<DataType>[]
): DataType[] => {
  const newArray = JSON.parse(JSON.stringify(arrays));
  for (let i = 0; i < newArray.length; i++) {
    const item = newArray[i];
    item.totalPrice = Number(item.price) * Number(item.quantity);
  }
  return newArray;
};

const EditableContext = React.createContext<FormInstance<any> | null>(null);
const CheckingErrorContext = React.createContext<any>(null);


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

const handleSelectInput = (title: React.ReactNode, ref: Ref<InputRef | any>, record: DataType, dataIndex: keyof DataType, save: () => void) => {
  const numberValidator = (_: unknown, value: any) => {
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      return Promise.reject(`Giá trị phải là số và lớn hơn 0.`);
    }
    return Promise.resolve();
  };

  switch (dataIndex) {
    case 'quantity':
      return <Tooltip placement="top" title={`Số lượng hiện có ${record.quantityOrigin}`}>
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

                if (Number(value) > record.quantityOrigin)
                  return Promise.reject(`Trong kho chỉ có ${record.quantityOrigin} ${record.unit}`)

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
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const key = Object.keys(values)[0]
      const value = Object.values(values)[0]
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


const defaultInput = {
  name: 'QUÂN KHU 5 CỤC HẬU CẦN',
  title: '',
}

const nameOfEntryForm = nameOf<ModalEntryForm>();

const ModalCreateEntry: React.FC<PropsModal> = (props) => {

  const {
    isShowModal,
    onCloseModal,
    listItem,
    reFetch,
  } = props;

  const [listItemEntryForm, setListItemEntryForm] = useState<DataType[]>([]);
  const [isError, setIsError] = useState(false);
  const [listWareHouse, setListWareHouse] = useState<{ name: string, ID: number }[]>([])
  const formRef = useRef<FormInstance>(null);

  const handleGetAllSource = async () => {
    const result = await ipcRenderer.invoke("receiving-list")
    setListWareHouse(result.rows)
  }

  useEffect(() => {
    handleGetAllSource()
  }, [])

  useEffect(() => {
    if (isShowModal) {
      return formRef.current?.setFieldsValue({
        ...defaultInput
      })
    }
    handleClean()
  }, [isShowModal])

  useEffect(() => {
    setListItemEntryForm(removeItemChildrenInTable(listItem))
  }, [listItem])

  const columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Tên Kho Hàng',
      dataIndex: 'nameWareHouse',
      width: 200,
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
      render: (record) => <span>{getDateExpried(record)}</span>,
      width: 200,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      width: 200,
      editable: true,
      key: "quantity",
      render: (record) => (
        <span>{new Intl.NumberFormat().format(record)}</span>
      )
    },
    {
      title: "Giá lẻ",
      dataIndex: "price",
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
            onClick={() => handleRemoveItem(record)}
          />
        </Space>
      ),
    },
  ];

  const optionSource: OptionSelect[] = listWareHouse.length > 0 ? listWareHouse.map(source => (
    {
      label: source?.name,
      value: source?.ID
    }
  )) : [];

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
    if (isError) return
    const idSource = formRef.current?.getFieldValue("idReceiving")

    const sourceSelect = listWareHouse?.find(item => item.ID === idSource)
    const params: any = {
      ...values,
      items: listItemEntryForm,
      name: values.name,
      note: values.note,
      nature: values.nature,
      date: formatDate(values.date, false, "no_date"),
      total: totalPrice,
      title: values.title,
      nameSource: sourceSelect?.name,
    };


    const result: { success: boolean, error?: string } = await ipcRenderer.invoke("temp-export-warehouse", params);
    if (result.success) {
      await reFetch()
      message.success("Tạm xuất kho thành công")
      handleClean()
      onCloseModal()
    } else {
      message.error(result.error)
    }
  };

  const handleSave = (data: DataType) => {
    const newList = listItemEntryForm.map(item => item.IDIntermediary === data.IDIntermediary ? data : item)
    setListItemEntryForm(removeItemChildrenInTable(newList));
  }

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

  const handleRemoveItem = (item: DataType) => {
    const filterItem = listItemEntryForm.filter(
      (cur) => cur.IDIntermediary !== item.IDIntermediary
    );
    setListItemEntryForm(filterItem);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  console.log(listItemEntryForm)
  const totalPrice = useMemo(() => {
    return listItemEntryForm.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.price) * Number(currentValue.quantity),
      0
    );
  }, [listItemEntryForm]);

  return (
    <CheckingErrorContext.Provider value={contextValue}>
      <Modal
        title={`LÀM PHIẾU TẠM XUẤT`}
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
                label={"Cấp theo"}
                name={nameOfEntryForm("title")}
                rules={[
                  {
                    required: true,
                    message: getMessage(ERROR.ERROR_1, "Cấp theo"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={"Đơn vị nhận"} name={"idReceiving"} rules={[
                {
                  required: true,
                  message: getMessage(ERROR.ERROR_1, "Nguồn nhập"),
                },
              ]}
                initialValue={optionSource[0]?.value}
              >
                <Select options={optionSource} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Loại nhập"
                name={nameOfEntryForm("nature")}
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
                initialValue={dayjs()}
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
            <Col span={16}>
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

          <Table
            columns={newColumn as any}
            dataSource={listItemEntryForm as any}
            bordered
            components={components}
            pagination={false}
            scroll={{ y: 500 }}
            style={{ maxWidth: "1200px" }}
            rowKey={(item: DataType) => item.IDIntermediary}
          />
        </Form>
      </Modal>
    </CheckingErrorContext.Provider>
  );
};

export default ModalCreateEntry;
