import { Modal, Space, Select, Button, Form, Table, Tag, Typography, message, Input, InputRef, Tooltip } from "antd";
import { STATUS_MODAL } from "../types";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import { OptionSelect, WareHouse } from "@/types";
import type { ColumnsType } from 'antd/es/table';
import { DataType } from "../types";
import { UilMultiply } from "@iconscout/react-unicons";
import { formatNumberWithCommas, renderTextStatus } from "@/utils";
import type { FormInstance } from 'antd/es/form';
import "../styles/transferModal.scss"

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface TransferModalProps {
  isShow: STATUS_MODAL;
  setIsShow: () => void;
  idWareHouse?: string;
  listItem: DataType[];
  removeItemList: (IDIntermediary: string) => void;
}

const { Title } = Typography;

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
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    console.log(record[dataIndex]);

    form.setFieldsValue({ [dataIndex]: record[dataIndex] });

  };

  const numberValidator = (_: unknown, value: any) => {
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      return Promise.reject(`Giá trị phải là số và lớn hơn 0.`);
    }
    return Promise.resolve();
  };


  const save = async () => {
    try {
      const values = await form.validateFields();
      console.log('value', values);

      toggleEdit();
      handleSave({ ...record, quantity: +values.quantity });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Tooltip placement="top" title={`Số lượng hiện có ${record.quantity}`}>
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} bắt buộc nhập.`,
            },
            { validator: numberValidator },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value > record.quantity!) {
                  return Promise.reject(`Số lượng tối đa có thể chuyển là ${record.quantity}.`);
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      </Tooltip>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};




const TransferModal = ({ isShow, setIsShow, idWareHouse, listItem, ...props }: TransferModalProps) => {
  const [listWareHouse, setListWareHouse] = useState<OptionSelect[]>();
  const [listItemTransfer, setListItemTransfer] = useState<DataType[]>(listItem);
  const refError = useRef<any>(null);
  const [item, setItem] = useState<number>();
  const [isError, setIsError] = useState(false);

  const columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Mã mặt hàng',
      dataIndex: 'IDIntermediary',
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
      title: 'Số lượng muốn chuyển',
      dataIndex: 'quantity',
      editable: true,
      width: 200,
      render: (record) => (
        <span>{record}</span>
      )
    },
    {
      title: 'Nguồn Hàng',
      dataIndex: 'id_Source',
      width: 200,
      render: (record) => (
        <span>{record}</span>
      )
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'date_expried',
      width: 200,
      render: (record) => (
        <span>{record}</span>
      )
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
    {
      title: "Hành động",
      dataIndex: "action",
      fixed: 'right',
      width: 150,
      render: (_, record: any) => (
        <Space size="middle">
          <UilMultiply style={{ cursor: "pointer" }} onClick={() => handleRemoveItem(record)} />
        </Space>
      ),
    }
  ];

  useEffect(() => {
    if (idWareHouse) {
      new Promise(async () => {
        const response = await ipcRenderer.invoke("warehouse-list-except-id", idWareHouse);
        if (response) {
          const data: WareHouse[] = response.rows;
          const newListWareHouse = data.map((item) => ({
            label: item.name,
            value: item.ID
          }));
          setListWareHouse(newListWareHouse);
        }
      })
    }

  }, [idWareHouse]);



  const Footer = () => {
    return (
      <>

      </>
    )
  }

  const handleTransferWareHouse = () => {
    if (!item) {
      refError.current.focus();
      setIsError(true);
      return;
    }

    const newList = listItem.map((item: DataType) => item.IDIntermediary)
    ipcRenderer.send("change-warehouse", item, newList);
    setIsShow()

  }

  const handleChangeSelect = (idItem: number) => {
    setItem(idItem);
    setIsError(false);
  }

  const handleRemoveItem = (item: DataType) => {
    const filterItem = listItemTransfer.filter(cur => cur.IDIntermediary !== item.IDIntermediary);
    setListItemTransfer(filterItem);
    props.removeItemList(item.IDIntermediary)

  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleSave = (data: DataType) => {
    console.log(data);
    const newList = listItemTransfer.map(item => item.IDIntermediary === data.IDIntermediary ? data : item)
    setListItemTransfer(newList);
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

  console.log('modal trans');


  return (
    <Modal
      title={'Chuyển kho hàng'}
      centered
      open={isShow === STATUS_MODAL.TRANSFER}
      onCancel={setIsShow}
      style={{ margin: '50px' }}
      width={'90%'}
      footer={<Footer />}
    >
      <Space className="modal-item" direction="vertical" size={32} align="center" style={{ justifyContent: 'center', width: '100%' }}>
        <div className="form-item">
          <label htmlFor="">Chọn kho hàng cần chuyển</label>
          <Select
            showSearch
            optionFilterProp="children"
            className={isError ? 'error' : ''}
            ref={refError}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={item}
            onChange={(e) => handleChangeSelect(e)}
            options={listWareHouse}
          />
          {
            isError && <p className="text-error">Vui lòng không để trống ô này</p>
          }
        </div>

        <div style={{ marginBottom: 32 }}>
          <Title level={5}>Sản Phẩm Đã Chọn</Title>
          <Table
            bordered
            style={{ width: '1200px' }}
            scroll={{ y: 300 }}
            components={components}
            rowClassName={() => 'editable-row'}
            pagination={false}
            dataSource={listItemTransfer}
            rowKey={(record: DataType) => record.IDIntermediary}
            columns={newColumn as any}
          />
        </div>
        <Button size="large" type="primary" onClick={handleTransferWareHouse}>
          Chuyển kho
        </Button>

      </Space>
    </Modal>
  )
}

export default TransferModal