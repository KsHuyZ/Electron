import { useState, useMemo, useRef, useEffect } from "react";
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
import AddWareHouseItem from "./AddWareHouseItem";

interface PropsModal {
  isShowModal: any;
  onCloseModal: () => void;
  nameWareHouse?: string;
  idWareHouse?: number | string;
  reFetch: () => void;
}

const removeItemChildrenInTable = (
  arrays: FormatTypeTable<DataType>[]
): DataType[] => {
  const newArray = JSON.parse(JSON.stringify(arrays));
  for (let i = 0; i < newArray.length; i++) {
    const item = newArray[i];
    item.totalPrice = Number(item.price) * Number(item.quantity_real);
  }
  return newArray;
};

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

const defaultInput = {
  name: 'QUÂN KHU 5 CỤC HẬU CẦN',
  title: '',
}

const nameOfEntryForm = nameOf<ModalEntryForm>();

const ModalCreateEntry: React.FC<PropsModal> = (props) => {

  const {
    isShowModal,
    onCloseModal,
    idWareHouse,
    nameWareHouse,
    reFetch
  } = props;

  const [listItemEntryForm, setListItemEntryForm] = useState<DataType[]>(
    removeItemChildrenInTable([])
  );

  const [listSource, setListSource] = useState<{ name: string, ID: number }[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const formRef = useRef<FormInstance>(null);

  const handleGetAllSource = async () => {
    const result = await ipcRenderer.invoke("get-all-no-pagination")
    setListSource(result.rows)
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

  const columns: ColumnsType<DataType> = [
    {
      title: 'Tên Kho Hàng',
      dataIndex: 'prev_idwarehouse',
      render: () => {
        return nameWareHouse
      },
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
          dataIndex: "quantity_real",
          width: 200,
          render: (record) => (
            <span>{new Intl.NumberFormat().format(record)}</span>
          ),
        },
      ],
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
  const optionSource: OptionSelect[] = listSource.map(source => (
    {
      label: source?.name,
      value: source?.ID
    }
  ));
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

  const importWarehouseCallBack = async (
    event: Electron.IpcRendererEvent,
    isSuccess: boolean
  ) => {
    if (!isSuccess) {
      return message.error("Nhập kho thất bại. Hãy thử lại");
    } else {
      message.success("Nhập kho thành công");
      handleClean();
      return;
    }
  };

  const handleClean = () => {
    onCloseModal();
    formRef.current?.resetFields();
    setListItemEntryForm([])
  };

  const onFinishFormManagement = async (values: ModalEntryForm) => {
    if (listItemEntryForm.length < 1) {
      message.error("Không có sản phẩm để làm phiếu");
      return;
    }
    const idSource = formRef.current?.getFieldValue("id_Source")

    const sourceSelect = listSource?.find(item => item.ID === idSource)
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
      nameWareHouse,
      idWareHouse
    };

    const result = await ipcRenderer.invoke("create-product-item", { ...params });
    if (result) {
      setTimeout(() => {
        reFetch()
        message.success("Tạm nhập mặt hàng thành công")
        handleClean()
      }, 500)

    }
    // if (result) {
    //   setListItemEntryForm([])
    // }
  };

  const handleCreateNewItem = (item: DataType) => {
    setListItemEntryForm(prev => removeItemChildrenInTable([...prev, item]))
  }

  const handleRemoveItem = (item: DataType) => {
    const filterItem = listItemEntryForm.filter(
      (cur) => cur.IDIntermediary !== item.IDIntermediary
    );
    setListItemEntryForm(filterItem);
  };

  const totalPrice = useMemo(() => {
    return listItemEntryForm.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.price) * currentValue.quantity_real!,
      0
    );
  }, [listItemEntryForm]);

  return (
    <Modal
      title={`LÀM PHIẾU TẠM NHẬP`}
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
            <Form.Item label={"Nguồn nhập"} name={"id_Source"} initialValue={optionSource[0]?.value} rules={[
              {
                required: true,
                message: getMessage(ERROR.ERROR_1, "Nguồn nhập"),
              },
            ]}>
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

        <Space align="center" style={{ margin: "10px 0" }}>
          <Button type="primary" onClick={() => setShowModal(true)}>Thêm sản phẩm mới</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={listItemEntryForm as any}
          bordered
          pagination={false}
          scroll={{ y: 500 }}
          style={{ maxWidth: "1200px" }}
          rowKey={(item: DataType) => item.IDIntermediary}
        />
      </Form>
      <AddWareHouseItem
        isShowModal={showModal}
        onCloseModal={() => setShowModal(false)}
        onCreateItem={(item) => handleCreateNewItem(item)}
      />
    </Modal>
  );
};

export default ModalCreateEntry;
