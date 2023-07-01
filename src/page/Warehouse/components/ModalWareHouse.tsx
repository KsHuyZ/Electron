import "./modalWareHouse.scss";
import React, { useEffect, useState } from 'react';
import { UilMultiply } from '@iconscout/react-unicons';
import { Form, Input, Button } from 'antd';
import { ipcRenderer } from 'electron';
import { message } from "antd";

type ModalProps = {
  closeModal: () => void;
  setLoading: () => void;
  clean: () => void;
  dataEdit?:{
    idEdit: string;
    name: string;
  };
};

const ModalWareHouse = ({ closeModal, setLoading, dataEdit, clean }: ModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() =>{
    if(dataEdit?.idEdit){
        form.setFieldValue('name', dataEdit.name);

    }
  },[dataEdit?.idEdit])

  const handleAddNewWareHouse = async () => {
    try {
      await form.validateFields(); // Validate the form fields
      setLoading();
      setIsLoading(true); // Set loading state to true
      const { name } = form.getFieldsValue(); // Get the value of the name field
      if(dataEdit?.idEdit){
        const params = {
          name: name,
          address: '',
          description: '',
          is_receiving : 0,
          phone: ''
        }
        const response = await ipcRenderer.invoke('update-warehouse', {...params, id: dataEdit.idEdit});
        if(response){
          console.log(response);
          
        }
      }else{
        const params = {
          name: name,
          address: '',
          description: '',
          is_receiving : 0,
          phone: ''
        }
        const response = await ipcRenderer.invoke('create-new-warehouse', JSON.stringify(params));
        if(response){
          message.success('Tạo kho hàng thành công');
        }
      }
      // Simulating loading completion after 3 seconds
      clean();
      setIsLoading(false); // Set loading state to false
      closeModal();
    } catch (error) {
      console.log('Form validation error:', error);
    }
  };

  return (
    <div className="backdrop">
      <div className="modal" tabIndex={0}>
        <div className="header">
          <div className="close-btn">
            <UilMultiply onClick={closeModal} />
          </div>
        </div>
        <div className="main-body">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Tên Kho Hàng"
              name="name"
              rules={[
                { required: true, message: 'Tên kho hàng không được để trống.' },
              ]}
            >
              <Input size="large" placeholder="Tên kho hàng" disabled={isLoading} />
            </Form.Item>
          </Form>
        </div>
        <div className="action">
          <div className="cancel">
            <Button
              type="primary"
              ghost
              onClick={() => {
                setTimeout(() => closeModal(), 300);
              }}
            >
              Thoát
            </Button>
          </div>
          <div className="create">
            <Button
              type="primary"
              onClick={handleAddNewWareHouse}
              loading={isLoading}
              htmlType="submit"
            >
              {dataEdit?.idEdit ? 'Cập Nhật' : 'Tạo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWareHouse;
