import { Modal, Space, Select, Button, Form, Table, Tag, Typography, message, Input, InputRef, Tooltip } from "antd";
import { STATUS_MODAL } from "../types";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import { OptionSelect, WareHouse } from "@/types";
import { DataType } from "../types";
import { UilMultiply } from "@iconscout/react-unicons";
import { formatNumberWithCommas, renderTextStatus } from "@/utils";
import type { FormInstance } from 'antd/es/form';
import "../styles/transferModal.scss"

const EditableContext = React.createContext<FormInstance<any> | null>(null);
const CheckingErrorContext = React.createContext<any>(null);
interface TransferModalProps {
  isShow: STATUS_MODAL;
  setIsShow: () => void;
  idWareHouse?: string;
  listItem: DataType[];
  removeItemList: (IDIntermediary: string[]) => void;
  fetching: () => Promise<void>;
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
  const { isError, setIsError } = useContext(CheckingErrorContext);
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
      setIsError(false);
      toggleEdit();
      handleSave({ ...record, quantity: +values.quantity });
    } catch (errInfo) {
      setIsError(true);
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
            { validator: numberValidator },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(`${title} bắt buộc nhập.`);
                }
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
  const [isErrorSelect, setIsErrorSelect] = useState(false);
  const columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Mã mặt hàng',
      dataIndex: 'IDWarehouseItem',
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

  const handleSetError = (params: boolean) => {
    setIsError(params)
  }

  const contextValue = {
    isError,
    setIsError: handleSetError
  }

  const handleGetWarehouseOrReceiving = (idWareHouse?: string) => {
    const eventRequest = isShow === STATUS_MODAL.TRANSFER ? "warehouse-list-except-id" : "receiving-list"
    new Promise(async () => {
      const response = await ipcRenderer.invoke(eventRequest, idWareHouse);
      if (response) {
        console.log('data', response);
        
        const data: WareHouse[] = response.rows;
        const newListWareHouse = data.map((item) => ({
          label: item.name,
          value: item.ID
        }));
        setListWareHouse(newListWareHouse);
      }
    })
  }

  useEffect(() => {
    handleGetWarehouseOrReceiving(idWareHouse)
  }, [idWareHouse]);



  const Footer = () => {
    return (
      <>

      </>
    )
  }

  const handleTransferWareHouse = async () => {
    if (!item) {
      refError.current.focus();
      setIsErrorSelect(true);
      return;
    }

    if (listItemTransfer.length < 1) {
      message.error('Không có sản phẩm cần chuyển')
      return;
    }

    if (isError) {
      message.error('Vui lòng kiểm tra lại các số lượng cần chuyển')
      return;
    }

    const newList = listItemTransfer.map((item: DataType) => ({
      id_wareHouse_item: item.IDWarehouseItem,
      quantity: item.quantity,
      id_wareHouse: item.id_WareHouse,
      status: item.status,
      quality: item.quality,
      idIntermediary: item?.IDIntermediary,
      date: item.date

    }))

    if (newList) {
      try {
        const result = await ipcRenderer.invoke(`${isShow === STATUS_MODAL.TRANSFER ? "change-warehouse" : "export-warehouse"}`, item, newList);
        if (result) {
          await props.fetching();
          setIsShow();
          props.removeItemList(newList.map(i => i.idIntermediary));
          message.success('Chuyển kho thành công');
        }
      } catch (error) {
        message.error('Loi server')
        console.log(error);

      }
    }
  }

  const handleChangeSelect = (idItem: number) => {
    setItem(idItem);
    setIsErrorSelect(false);
  }

  const handleRemoveItem = (item: DataType) => {
    const filterItem = listItemTransfer.filter(cur => cur.IDIntermediary !== item.IDIntermediary);
    setListItemTransfer(filterItem);
    props.removeItemList([item.IDIntermediary])

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

  console.log(listItemTransfer);
  

  return (
    <CheckingErrorContext.Provider value={contextValue}>
      <Modal
        title={isShow === STATUS_MODAL.TRANSFER ? 'Chuyển kho hàng' : 'Xuất kho'}
        centered
        open={isShow === STATUS_MODAL.TRANSFER || isShow === STATUS_MODAL.RECEIPT}
        onCancel={setIsShow}
        style={{ margin: '50px' }}
        width={'90%'}
        footer={<Footer />}
      >
        <Space className="modal-item" direction="vertical" size={32} align="center" style={{ justifyContent: 'center', width: '100%' }}>
          <div className="form-item">
            <label htmlFor="">Chọn {isShow === STATUS_MODAL.TRANSFER ? 'kho hàng cần chuyển' : 'đơn vị nhận'}</label>
            <Select
              showSearch
              optionFilterProp="children"
              className={isErrorSelect ? 'error' : ''}
              ref={refError}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              value={item}
              onChange={(e) => handleChangeSelect(e)}
              options={listWareHouse}
              style={{width : '200px'}}
            />
            {
              isErrorSelect && <p className="text-error">Vui lòng không để trống ô này</p>
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
            {isShow === STATUS_MODAL.TRANSFER ? 'Chuyển kho' : 'Xuất kho'}
          </Button>

        </Space>
      </Modal>
    </CheckingErrorContext.Provider>
  )
}

export default TransferModal