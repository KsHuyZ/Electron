import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input, Form } from 'antd'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'


type DataType = {
    ID: number;
    name: string;
    address: string;
    phone: string;
}

interface ModalRecipientProps {
    closeModal: () => void,
    setLoading: () => void
    data: DataType | null | undefined
}


const ModalRecipient = (props: ModalRecipientProps) => {
    const { closeModal, setLoading, data } = props
    const [isLoading, setIsLoading] = useState(false)
    const [form] = Form.useForm();

    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            closeModal()
        }
    }

    const hanldeSubmit = async () => {
        await form.validateFields();
        setLoading()
        setIsLoading(true)
        const { name, address, phone } = form.getFieldsValue();
        if (data) {
            const { ID } = data
            return ipcRenderer.send("update-recipient", { id: ID, name, address, phonenumber: phone })
        }
        ipcRenderer.send("create-new-donViNhan", { name, address, phonenumber: phone })
    }

    useEffect(() => {
        if (data) {
            const { name, address, phone } = data
            form.setFieldValue('name', name);
            form.setFieldValue('address', address);
            form.setFieldValue('phone', phone);
            // setValue({ name, phonenumber: phone, address })
        }
    }, [])

    return (
        <div className='backdrop'>
            <div className="modal" onKeyDown={handleCloseModal} tabIndex={0}>
                <div className="header">
                    <div className="close-btn" >
                        <UilMultiply onClick={closeModal} />
                    </div>
                </div>
                <div className="main-body">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Tên Đơn Vị Nhận"
                            name="name"
                            rules={[
                                { required: true, message: 'Tên đơn vị nhận không được để trống.' },
                            ]}
                        >
                            <Input size="large" placeholder="Tên đơn vị nhận" disabled={isLoading} />
                        </Form.Item>
                        <Form.Item
                            label="Địa Chỉ Đơn Vị Nhận"
                            name="address"
                            rules={[
                                { required: true, message: 'Địa chỉ đơn vị nhận không được để trống.' },
                            ]}
                        >
                            <Input size="large" placeholder="Địa chỉ đơn vị nhận" disabled={isLoading} />
                        </Form.Item>
                        <Form.Item
                            label="Số Điện Thoại Đơn Vị Nhận"
                            name="phone"
                            rules={[
                                { required: true, message: 'Số điện thoại đơn vị nhận không được để trống.' },
                            ]}
                        >
                            <Input size="large" type='number' placeholder="Số điện thoại đơn vị nhận" disabled={isLoading} />
                        </Form.Item>
                    </Form>
                </div>

                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={() => {
                            setTimeout(() => closeModal(), 300)
                        }}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" onClick={hanldeSubmit} htmlType="submit">{!data ? "Thêm nguồn hàng" : "Cập nhật"}</Button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ModalRecipient
