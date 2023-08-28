import React, { Ref, useEffect, useRef, useState } from 'react';
import { UilMultiply } from '@iconscout/react-unicons';
import { Form, Input, Button, Modal, InputRef } from 'antd';
import { ipcRenderer } from 'electron';
import { message } from "antd";

type ModalProps = {
  closeModal: () => void;
  setLoading: () => void;
  clean: () => void;
  dataEdit?: {
    idEdit: string;
    name: string;
  };
  fetching: () => void;
  isShow: boolean;
};

const ModalWareHouse = ({ closeModal, setLoading, dataEdit, clean, fetching, isShow }: ModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<InputRef | null>(null)
  useEffect(() => {
    if (dataEdit?.idEdit && isShow) {
      form.setFieldValue('name', dataEdit.name);
    }
    const handle = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => {
      clearTimeout(handle)
    }
  }, [dataEdit?.idEdit, isShow])



  const handleAddNewWareHouse = async () => {
    try {
      await form.validateFields();
      setIsLoading(true);
      const { name } = form.getFieldsValue();
      if (dataEdit?.idEdit) {
        const params = {
          name: name,
          address: '',
          description: '',
          is_receiving: 0,
          phone: ''
        }
        const response = await ipcRenderer.invoke('update-warehouse', { ...params, id: dataEdit.idEdit });
        if (response) {
          console.log(response);

        }
      } else {
        const params = {
          name: name,
          address: '',
          description: '',
          is_receiving: 0,
          phone: ''
        }
        const response = await ipcRenderer.invoke('create-new-warehouse', JSON.stringify(params));
        if (!response) {
          setIsLoading(false);
          return form.setFields([{
            name: 'name',
            errors: ['Kho đã tồn tại']
          }])
        }
        handleClean()
        message.success('Tạo kho hàng thành công');
      }

      clean();
      setIsLoading(false);
      setLoading();
      closeModal();
      fetching();
    } catch (error) {
      console.log('Form validation error:', error);
    }
  };

  const handleClean = () => {
    form.resetFields()
    closeModal()
  }

  return (
    <Modal
      title={dataEdit?.idEdit ? `Cập nhật kho` : `Thêm kho mới`}
      centered
      open={isShow}
      onCancel={handleClean}
      onOk={() => form.submit()}

    >
      <Form form={form} layout="vertical" onFinish={handleAddNewWareHouse}>
        <Form.Item
          label="Tên Kho Hàng"
          name="name"
          rules={[
            { required: true, message: 'Tên kho hàng không được để trống.' },
          ]}
        >
          <Input size="large" placeholder="Tên kho hàng" disabled={isLoading} ref={inputRef} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalWareHouse;
