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
// import InputPrice from "@/components/InputPrice";


interface PropsAddWareHouseItem {
    isShowModal: boolean;
    onCloseModal : () => void;
    idWareHouse?: string;
    isEdit: boolean;
    itemEdit: Omit<DataType,'date_created_at'|'date_updated_at'|'status'> | undefined;
    setIsEdit: (status: boolean) => void;
    fetching: () => Promise<void>;
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

const AddWareHouseItem = React.memo(({isShowModal = false,onCloseModal, idWareHouse, isEdit, itemEdit, setIsEdit,fetching}: PropsAddWareHouseItem) => {
    const [formWareHouseItem] = Form.useForm();
    const [price, setPrice] = useState<any>();
    const [listOptionSource, setListOptionSource] = useState<OptionSelect[]>();
    const [loadingButton, setLoadingButton] = useState<boolean>(false);

    useEffect(() =>{
        if(isEdit){
            console.log(itemEdit);
const parsedDate = dayjs(itemEdit?.date_expried); 
            // formWareHouseItem.setFieldsValue(itemEdit);
            formWareHouseItem.setFieldsValue({
                name: itemEdit?.name,
                price: itemEdit?.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '',
                unit: itemEdit?.unit,
                quality: itemEdit?.quality,
                note: itemEdit?.note,
                quantity_plane: itemEdit?.quantity_plane,
                quantity_real: itemEdit?.quantity,
                date_expried: parsedDate,
                idSource: itemEdit?.id_Source
            })
        }
    },[isEdit]);

    useEffect(() =>{
        new Promise(async() =>{
            await getAllItemSource();
        })
    },[])

    const onFinishFormManagement = async(values: WarehouseItem) =>{
        const {date_expried} = values;
        const dateFormat = formatDate(date_expried, false, 'no_date');
        
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
                date: formatDate(new Date(), true, 'date_First'),
                date_created_at: formatDate(new Date(), true, 'date_First'),
                date_updated_at: formatDate(new Date(), true, 'date_First')
            }
            
            if(isEdit){
                const paramsEdit = {
                    ...params,
                    idIntermediary: itemEdit?.IDIntermediary,
                    idWarehouseItem: itemEdit?.IDWarehouseItem,
                    quantity: itemEdit?.quantity

                }
                const response = await ipcRenderer.invoke('update-warehouseitem', paramsEdit);
                if(response){
                    console.log(response);
                    message.success('Cập nhật sản phẩm thành công');
                }
            }else{
                console.log('add',params);
                
                const response = await ipcRenderer.invoke('create-product-item', JSON.stringify(params));
                if(response){
                    message.success('Tạo sản phẩm thành công');
                }
            }
            setLoadingButton(false);
            handleClean();
            await fetching();
        

    }

    const handleInputPrice = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const {value} = e.target;
        const numericValue = value.replace(/[^\d]/g, '');
    const formattedNumericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        setPrice(formattedNumericValue);
        formWareHouseItem.setFieldValue('price', formattedNumericValue)
      }  

      const getAllItemSource = async () =>{
        try {
            const response : { rows: ItemSource[], total: number } = await ipcRenderer.invoke('source-request-read');
            if(response){
                const customOption : OptionSelect[] = response?.rows?.map((e) => ({
                    label: e.name,
                    value: e.ID
                }));
        
                setListOptionSource(customOption);
                
            }
        } catch (error) {
            message.error('Lỗi item-source')
        }
      }

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
                        {/* <InputPrice name="price" label="Gias"/> */}
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
                            name="idSource"
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