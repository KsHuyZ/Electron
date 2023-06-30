import { Modal, Form, Space, Select, Button, Row, Col, Input, DatePicker, InputNumber, message } from "antd";
import "../styles/wareHouseItem.scss";
import { WarehouseItem, FormWareHouseItem,DataType } from "../types";
import { getMessage,ERROR,ERROR_SERVER } from "../constants/messValidate";
import { createRegexValidator, formatDate } from "@/utils";
import { priceRegex, OptionSelect, ItemSource,QUALITY, STATUS} from "@/types";
import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import dayjs from 'dayjs';
import React from "react";


interface PropsAddWareHouseItem {
    isShowModal: boolean;
    onCloseModal : () => void;
    idWareHouse?: string;
    isEdit: boolean;
    itemEdit: Omit<DataType,'date_created_at'|'date_updated_at'|'status'> | undefined;
    setIsEdit: (status: boolean) => void;
}

const defaultQuality : OptionSelect[] = [
    {
        label : 'Chất lượng loại 1',
        value : QUALITY.QUALITY_1
    },
    {
        label : 'Chất lượng loại 2',
        value : QUALITY.QUALITY_2
    },
    {
        label : 'Chất lượng loại 3',
        value : QUALITY.QUALITY_3
    },
    {
        label : 'Chất lượng loại 4',
        value : QUALITY.QUALITY_4
    }
]

const AddWareHouseItem = React.memo(({isShowModal = false,onCloseModal, idWareHouse, isEdit, itemEdit, setIsEdit}: PropsAddWareHouseItem) => {
    const [formWareHouseItem] = Form.useForm();
    const [price, setPrice] = useState<any>();
    const [listOptionSource, setListOptionSource] = useState<OptionSelect[]>();
    const [loadingButton, setLoadingButton] = useState<boolean>(false);

    useEffect(() =>{
        if(isEdit){
            console.log(itemEdit);
const parsedDate = dayjs(itemEdit?.date_expried, 'DD/MM/YYYY'); 
            // formWareHouseItem.setFieldsValue(itemEdit);
            formWareHouseItem.setFieldsValue({
                name: itemEdit?.name,
                price: itemEdit?.price,
                unit: itemEdit?.unit,
                quality: itemEdit?.quality,
                note: itemEdit?.note,
                quantity_plane: itemEdit?.quantity_plane,
                quantity_real: itemEdit?.quantity_real,
                date_expried: parsedDate,
                id_nguonHang: itemEdit?.id_nguonHang
            })
        }
    },[isEdit])

    const onFinishFormManagement = (values: WarehouseItem) =>{
        const {date_expried} = values;
        const dateFormat = formatDate(date_expried);
        
        if(idWareHouse === undefined){
            message.error(ERROR_SERVER.ERROR_1);
            return;
        }
        setLoadingButton(true);
        
            const params : FormWareHouseItem= {
                ...values,
                id_wareHouse : Number(idWareHouse),
                date_expried: dateFormat,
                status: STATUS.TEMPORARY_IMPORT,
                date_created_at: formatDate(new Date()),
                date_updated_at: formatDate(new Date())
            }
            
            if(isEdit){
                ipcRenderer.send('update-warehouseitem', params, itemEdit?.ID);
            }else{
                ipcRenderer.send('create-product-item', JSON.stringify(params));
            }
            setLoadingButton(false);
            handleClean();
        

    }

    const handleInputPrice = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const {value} = e.target;
        const numericValue = value.replace(/[^\d]/g, '');
    const formattedNumericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        setPrice(formattedNumericValue);
        formWareHouseItem.setFieldValue('price', formattedNumericValue)
      }  
      const ListSourceCallBack = (event: Electron.IpcRendererEvent, data: { rows: ItemSource[], total: number }) =>{
        const customOption : OptionSelect[] = data?.rows?.map((e) => ({
            label: e.name,
            value: e.ID
        }));

        setListOptionSource(customOption);
      }

      useEffect(() => {
        ipcRenderer.send("itemsource-request-read", { pageSize: 10, currentPage: 1 });
        ipcRenderer.on("all-itemsource", ListSourceCallBack);
    
        return () => {
          ipcRenderer.removeListener("all-itemsource", ListSourceCallBack);
        };
      }, []);

    const Footer = () => {
        return (
            <Space align="center" style={{display: 'flex',justifyContent: 'center'}}>
                <Button onClick={handleClean}>
                    Đóng
                </Button>
                <Button type="primary" htmlType="submit" form="formWareHouseItem" loading={loadingButton}>
                    {isEdit ? 'Cập Nhật' : 'Thêm mới'}
                </Button>
            </Space>
        )
    }

    const handleClean = () =>{
        formWareHouseItem.resetFields();
        onCloseModal();
        setIsEdit(false);
    }

    console.log('loading ');
    
    

    return (
        <Modal
            title={isEdit ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM'}
            centered
            open={isShowModal}
            onCancel={handleClean}
            width={'80%'}
            footer={<Footer />}
        >
            <Form layout="vertical" id='formWareHouseItem' form={formWareHouseItem} onFinish={onFinishFormManagement}>
                <Row gutter={32}>
                    <Col span={8}>
                        <Form.Item
                            label="Tên mặt hàng"
                            name="name"
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Tên mặt hàng') }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[
                                { required: true, message: getMessage(ERROR.ERROR_1, 'Giá') },
                                // {validator:  createRegexValidator(priceRegex, getMessage(ERROR.ERROR_2, 'Giá'))}
                            ]}
                        >
                            <Input
                            value={price}
                            onChange={handleInputPrice}
                            addonAfter="vnđ"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Chất lượng"
                            name="quality"
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Chất lượng') }]}
                        >
                            <Select
                            options={defaultQuality}
                            />
                            
                        </Form.Item>

                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Số lượng dự tính"
                            name="quantity_plane"
                            rules={[
                                { required: true, message: getMessage(ERROR.ERROR_1, 'SL dự tính') },
                                {validator:  createRegexValidator(priceRegex, getMessage(ERROR.ERROR_2, 'SL dự tính'))}
                            ]}
                        >
                            <Input style={{width: '100%'}} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Số lượng thực tế"
                            name="quantity_real"
                            rules={[
                                { required: true, message: getMessage(ERROR.ERROR_1, 'SL thực tế') },
                                {validator:  createRegexValidator(priceRegex, getMessage(ERROR.ERROR_2, 'SL thực tế'))}
                            ]}
                        >
                            <Input style={{width: '100%'}} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Nguồn hàng"
                            name="id_nguonHang"
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Nguồn hàng') }]}
                        >
                            <Select
                            showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={listOptionSource}
                            />
                            
                        </Form.Item>

                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Ngày hết hạn"
                            name="date_expried"
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Ngày hết hạn') }]}>
                            <DatePicker style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item
                            label="Đơn vị tính"
                            name="unit"
                            rules={[{ required: true, message: getMessage(ERROR.ERROR_1, 'Đơn vị tính') }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item
                            label="Chú thích"
                            name="note"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>


            </Form>
        </Modal>
    )
})

export default AddWareHouseItem