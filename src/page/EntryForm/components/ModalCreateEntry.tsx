import { useState, useMemo, useRef } from "react";
import { Modal, Form, Row, Col, 
    Input, Select, Space, Button, DatePicker, Tag, Table, message } from "antd";
import { ModalEntryForm } from "../types";
import { nameOf, OptionSelect, FormatTypeTable } from "@/types";
import TableTree from "@/components/TreeTable/TreeTable";
import { ColumnsType } from "antd/es/table";
import { DataType } from "@/page/WarehouseItem/types";
import { formatNumberWithCommas, getDateExpried, removeItemChildrenInTable } from "@/utils";
import { getMessage, ERROR } from "@/page/WarehouseItem/constants/messValidate";
import { UilMultiply } from "@iconscout/react-unicons";
import { FormInstance } from "antd/lib/form";
import docso from "@/utils/toVietnamese";

interface PropsModal {
    isShowModal: any;
    onCloseModal : () => void;
    idSource?: string;
    nameSource?: string;
    listItem?: FormatTypeTable<DataType> | [];
    // fetching: () => Promise<void>;
    removeItemList: (IDIntermediary: string) => void;
}

const defaultOptionNature : OptionSelect[] = [
    {
        label : 'Thường Xuyên',
        value : 'Thường Xuyên'
    },
    {
        label : 'Nhập Theo KH',
        value : 'Nhập Theo KH'
    }
]

const nameOfEntryForm = nameOf<ModalEntryForm>();

const ModalCreateEntry: React.FC<PropsModal> =  (props) =>{
    const {isShowModal, onCloseModal, listItem, removeItemList,nameSource} = props;
    const [loadingButton, setLoadingButton] = useState<boolean>(false);
    const [listItemEntryForm, setListItemEntryForm] = useState<DataType[]>(removeItemChildrenInTable(listItem as any));
    const [paginationInfo, setPaginationInfo] = useState({
      current: 1,
      pageSize: 10
    });
    const formRef = useRef<FormInstance>(null);
    


    const columns: ColumnsType<DataType> = [
      {
        title: 'Tên Kho Hàng',
        dataIndex: 'nameWareHouse',
        render: (value, row, index) => {
          
          const trueIndex =
          index + paginationInfo.pageSize * (paginationInfo.current - 1);
          const obj = {
            children : (<b>{value.toUpperCase() ?? ''}</b>),
            props : {} as any
          };
          if(index > 0 && row.id_WareHouse === listItemEntryForm[trueIndex -1].id_WareHouse){
            obj.props.rowSpan = 0;
            // obj.props.colSpan = 2;
          }
          else{
            for (let i = 0; trueIndex + i !== listItemEntryForm.length && row.id_WareHouse === listItemEntryForm[trueIndex + i].id_WareHouse; i+=1) {
             obj.props.rowSpan = i+1; 
            }
          }
          return obj;
        },
        width: 200,
      },
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
            title: 'Giá lẻ',
            dataIndex: 'price',
            width: 200,
            render: (record) => (
              <span style={{ fontWeight: 'bold' }}>{formatNumberWithCommas(record)}</span>
            )
          },
          {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            width: 200,
            render: (record) => (
              <span style={{ fontWeight: 'bold' }}>{formatNumberWithCommas(record)}</span>
            )
          },
        // {
        //   title: "Trạng thái",
        //   dataIndex: "status",
        //   fixed: 'right',
        //   width: 200,
        //   render: (confirm: number) => {
        //     const { text, color } = renderTextStatus(confirm)
        //     return (
        //       <span>
        //         <Tag color={color}>
        //           {text}
        //         </Tag>
        //       </span>
        //     )
        //   }
        // },
        {
          title: "Hành động",
          dataIndex: "action",
          fixed: 'right',
          width: 150,
          render: (_, record: any) => (
            <Space size="middle">
              <UilMultiply style={{ cursor: "pointer" }} onClick={()=>handleRemoveItem(record.IDIntermediary)}/>
            </Space>
          ),
        }
      ];

      const handleSubmitForm = async () => {
        try {
          await formRef?.current!.validateFields();
        } catch (error: any) {
          if (error?.errorFields?.length > 0) {
            const firstErrorField = error?.errorFields[0];
            const firstErrorNode = document.getElementById(`${firstErrorField.name.toString()}`);
            if (firstErrorNode) {
              firstErrorNode.scrollIntoView({ behavior: 'smooth' });
              firstErrorNode.focus();
               
            }
          }
        }
      };
      

    const Footer = () => {
        return (
            <Space align="center" style={{display: 'flex',justifyContent: 'center'}}>
                <Button onClick={handleClean}>
                    Đóng
                </Button>
                <Button type="primary" htmlType="submit" loading={loadingButton} onClick={handleSubmitForm}>
                    Làm Phiếu
                </Button>
            </Space>
        )
    }

    const handleClean = () =>{
        onCloseModal();
        formRef.current?.resetFields();
    }

    const onFinishFormManagement = async(values: ModalEntryForm) =>{
      if(listItemEntryForm.length < 1) {
        message.error('Không có sản phẩm để làm phiếu');
        return;
      }
      
    }

    const handleRemoveItem = (id: string) =>{
      const filterItem = listItemEntryForm.filter(cur => cur.IDIntermediary !== id);
      setListItemEntryForm(filterItem);
      removeItemList(id);
    };

    const totalPrice = useMemo(() => {
      return listItemEntryForm.reduce((accumulator, currentValue) => accumulator + Number(currentValue.price) * currentValue.quantity!, 0);
    }, [listItemEntryForm]);

    return (
        <Modal
            title={'LÀM PHIẾU NHẬP'}
            centered
            open={isShowModal}
            onCancel={handleClean}
            width={'90%'}
            footer={<Footer />}
        >
            <Form layout="vertical" ref={formRef} onFinish={onFinishFormManagement}>
                <Row gutter={32}>
                    <Col span={8}>
                        <Form.Item
                            label="Tên đơn vị"
                            name={nameOfEntryForm('name')}
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Tên đơn vị') }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Nguồn nhập"
                            name={nameOfEntryForm('idSource')}
                        >
                            <Input placeholder={nameSource} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Loại nhập"
                            name={nameOfEntryForm('nature')}
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Loại nhập') }]}
                        >
                            <Select
                            options={defaultOptionNature}
                            />
                            
                        </Form.Item>

                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Thời gian làm phiếu"
                            name={nameOfEntryForm('date')}
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Thời gian làm phiếu') }]}
                            >
                            <DatePicker style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item
                            label="Chú thích"
                            name={nameOfEntryForm('note')}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                      <h4>Thành tiền : {`${new Intl.NumberFormat().format(totalPrice)} vnđ`}</h4>
                      <h4>(Bằng chữ : {`${docso(totalPrice)}`})</h4>
                    </Col>
                </Row>

                <Space align="center">
                   <h3>SẢN PHẨM THUỘC {nameSource?.toLocaleUpperCase() ?? ''}</h3>
                </Space>
                <Table
                    // isShowSelection={false}
                        columns={columns}
                        dataSource={listItemEntryForm as any}
                        bordered
                        pagination={false}
                        scroll={{ y: 500 }}
                         style={{ maxWidth: '1200px' }}
                        rowKey={(item: DataType) => item.IDIntermediary}
                    />
            </Form>
        </Modal>
    )
}

export default ModalCreateEntry;