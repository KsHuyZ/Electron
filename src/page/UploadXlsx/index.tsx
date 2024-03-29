import './uploadXlsx.scss';
import { Button, Row, Col, Card, Select, Table, Space, Input, InputNumber, Form, Typography, Popconfirm, DatePicker, message } from 'antd';
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { chooseRowsAboveThreshold, convertItemKey, formatNumberWithCommas, getDateExpried, renderTextStatus, createRegexValidator, formatDate, formatDateUploadFile } from '@/utils';
import { UilMinusCircle } from '@iconscout/react-unicons'
import { ColumnType } from 'antd/lib/table';
import { IFileUpload, OptionSelect, ItemSource, STATUS } from '@/types';
import dayjs from "dayjs";
import { ipcRenderer } from 'electron';
import { useParams, useNavigate } from 'react-router-dom';
import { isDate } from '../../utils';
import ModalCreateEntry from '../WarehouseItem/components/ModalCreateEntry';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'date';
  record: IFileUpload;
  index: number;
  children: React.ReactNode;
}

const listTypeNumberValidate = ['quality', 'price', 'quantity_plane', 'quantity_real', 'total'];

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'date' ? <DatePicker style={{ width: '100%' }} /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (dataIndex === 'quality' && (Number(value) <= 0 || Number(value) > 5)) {
                  return Promise.reject(`${title} thuộc 1 - 5`);
                }
                if ((dataIndex !== 'note' && dataIndex !== 'date_expried') && !value) {
                  return Promise.reject(`${title} bắt buộc nhập.`);
                }
                if (listTypeNumberValidate.includes(dataIndex) && !/^[^a-zA-Z\W]*\.?\d*$/.test(value)) {
                  return Promise.reject(`${title} phải là số.`);
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

interface CustomColumnType<RecordType> extends ColumnType<RecordType> {
  editable?: boolean;
}


const UploadXlsx = () => {

  const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [nameFile, setNameFile] = useState<string>('');
  const [listSheet, setListSheet] = useState<string[]>();
  const [isFetch, setIsFetch] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const refError = useRef<any>(null);
  const refInputFile = useRef<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false)
  const { idWareHouse, nameWareHouse } = useParams();
  const navigate = useNavigate();

  const columns: CustomColumnType<IFileUpload>[] = [
    {
      title: 'Tên mặt hàng',
      dataIndex: 'name',
      editable: true,
      width: 200,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      editable: true,
      width: 200,
    },
    {
      title: 'Chất lượng',
      dataIndex: 'quality',
      editable: true,
      width: 200,
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'date_expried',
      editable: true,
      render: (record) => (
        <span>{isDate(record) ? getDateExpried(record) : 'Bạn đã nhập sai định dạng'}</span>
      ),
      width: 200,
    },
    {
      title: 'Giá lẻ',
      dataIndex: 'price',
      editable: true,
      width: 200,
      render: (record) => (
        <span style={{ fontWeight: 'bold' }}>{formatNumberWithCommas(record)}</span>
      )
    },
    {
      title: "Kế hoạch (Số Lượng)",
      dataIndex: "quantity_plane",
      editable: true,
      width: 200,
      render: (record: any) => (
        <span>  {new Intl.NumberFormat().format(record)}</span>
      )
    },
    {
      title: "Thực hiện (Số Lượng)",
      dataIndex: "quantity_real",
      editable: true,
      width: 200,
      render: (record: any) => (
        <span>{new Intl.NumberFormat().format(record)}</span>
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      editable: true,
      width: 200,
      render: (record) => (
        <span style={{ fontWeight: 'bold' }}>{formatNumberWithCommas(record)}</span>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      editable: true,
      width: 200,
    },


    {
      title: "Hành động",
      dataIndex: "action",
      fixed: "right",
      width: 200,
      render: (_: any, record: IFileUpload) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Typography.Link onClick={() => save(record.key!)} style={{ marginRight: 8 }}>
              <Button type='primary'>Đồng Ý</Button>
            </Typography.Link>
            <Popconfirm title="Bạn có đồng ý với xác nhận?" onConfirm={cancel}>
              <Button>Hủy</Button>
            </Popconfirm>
          </Space>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record as any)}>
            <Button>Chỉnh sửa</Button>
          </Typography.Link>
        );
      },
    }
  ];

  useEffect(() => {
    if (isFetch) {
      if (excelFile !== null) {
        const workbook = XLSX.read(excelFile, { type: 'buffer' });
        console.log(JSON.stringify(workbook));

        setListSheet(workbook.SheetNames ?? []);
        setIsFetch(false);
      }
    }
  }, [isFetch])

  const isEditing = (record: IFileUpload) => record.key === editingKey;

  const edit = (record: Partial<IFileUpload> & { key: React.Key }) => {

    dayjs.locale('vi');

    if (record['date_expried']) {
      record['date_expried'] = isDate(record['date_expried']) ? dayjs(record['date_expried']) : null;
    }

    form.setFieldsValue({ name: '', unit: '', quality: '', date_expried: '', price: '', quantity_plane: '', quantity_real: '', total: '', note: '', ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      let row = (await form.validateFields()) as IFileUpload;
      row['date_expried'] = row['date_expried'] ? formatDate(row['date_expried'], false, 'no_date') : ''
      const newData = [...excelData as any];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setExcelData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setExcelData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const removeFile = () => {
    setNameFile('');
    setExcelFile(null);
    setTypeError(null);
    setExcelData([]);
    setListSheet([]);
    refInputFile.current.value = null;
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    let selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        setNameFile(selectedFile.name);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setIsFetch(true);
          setExcelFile(e.target?.result as ArrayBuffer);
        }
      } else {
        setTypeError('Please select only excel file types');
        setExcelFile(null);
      }
    } else {
      console.log('Please select your file');
    }
  }

  // submit event
  const handleFileSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await form.validateFields();
      setShowModal(true)
    } catch (error: any) {
      console.log(error)
      message.error(`MH ${error?.values?.name} đang thiếu dữ liệu`);
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

  const handleNavigate = () => {
    navigate(`/home/${idWareHouse}/${nameWareHouse}`, { replace: true });
  }

  const handleChangeSheet = (value: string) => {
    if (!value) return;
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: 'buffer' });
      const worksheet = workbook.Sheets[value];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const dataSlice: any = data.slice(4);

      if (dataSlice.length > 0) {
        const key = Object.keys(dataSlice && dataSlice[0])?.map((key) => {
          return key;
        });

        const chosenRows = convertItemKey(chooseRowsAboveThreshold(dataSlice as any, key, 5));
        setExcelData(chosenRows.slice(1));
      } else {
        message.error('Dữ liệu không trùng khớp');
        setExcelData([]);

      }
    }
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IFileUpload) => ({
        record,
        inputType: col.dataIndex === 'date_expried' ? 'date' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Row className="filter-bar">
      <Row style={{ width: '100%' }} align="middle">
        <Col span={12}>
          <h2 style={{ margin: 0 }}>Nhập từ file</h2>
        </Col>
      </Row>
      <Col span={24}>
        <div>
          <div>
            <Card style={{ margin: '16px 0' }}>
              <Row className="filter-bar">
                <Col span={8} className="col-item-filter">
                  <form className="form-group custom-form" onSubmit={handleFileSubmit}>
                    <label htmlFor="input-upload" className='btn btn-uploadFile'>Chọn file</label>
                    <input type="file" accept='.xlsx' id='input-upload' ref={refInputFile} className="form-control" hidden required onChange={handleFile} />
                    <button type="submit" className="btn btn-success btn-md" disabled={excelData && excelData?.length > 0 && listSheet && listSheet?.length > 0 ? false : true}>Nhập nhiều file</button>
                    {typeError && (
                      <div className="alert alert-danger" role="alert">{typeError}</div>
                    )}
                    {
                      nameFile && (
                        <div className="card-file">
                          <p>{nameFile}</p>
                          <UilMinusCircle onClick={removeFile} />

                        </div>
                      )
                    }
                  </form>
                </Col>
                <Col span={8}>
                  <div className="form-item">
                    <label htmlFor="">SHEETS TAB</label>
                    <Select
                      style={{ width: '70%' }}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      onChange={(event) => handleChangeSheet(event)}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={listSheet?.map((item) => ({
                        label: item,
                        value: item
                      }))}

                    />
                  </div>
                </Col>

              </Row>
            </Card>
          </div>
        </div>
      </Col>

      {
        excelData && (
          excelData.length < 100 ? (


            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                bordered
                dataSource={excelData as any}
                scroll={{ y: 500 }}
                columns={mergedColumns as any}
                rowClassName="editable-row"
                pagination={{
                  onChange: cancel,
                }}
              />
            </Form>
          ) : (
            <span>Dữ liệu của bạn không trùng khớp, hoặc dữ liệu quá lớn</span>
          )
        )
      }
      <ModalCreateEntry
        isShowModal={showModal}
        onCloseModal={() => setShowModal(false)}
        reFetch={handleNavigate}
        listWarehouseItem={excelData}
        idWareHouse={idWareHouse}
        nameWareHouse={nameWareHouse}
      />
    </Row>
  )
}

export default UploadXlsx