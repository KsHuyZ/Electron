import toastify from '@/lib/toastify'
import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input, Form } from 'antd'
import { ipcRenderer } from 'electron'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'


type DataType = {
    ID: number;
    name: string;
    address: string;
    phone: string;
}

interface ModalRecipientProps {
    closeModal: () => void,
    data: DataType | null | undefined,
    reload: () => void,
    setAllRecipient: Dispatch<SetStateAction<DataType[]>>
}


const ModalRecipient = (props: ModalRecipientProps) => {
    const { closeModal, data, reload, setAllRecipient } = props
    const [isLoading, setIsLoading] = useState(false)
    const [form] = Form.useForm();
    const { notifySuccess, notifyError } = toastify

    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            closeModal()
        }
    }

    const hanldeSubmit = async () => {
        await form.validateFields();
        setIsLoading(true)
        const { name, address, phone } = form.getFieldsValue();
        if (data) {
            const { ID } = data
            const success = await ipcRenderer.invoke("update-receiving", { name, address, phone }, ID)
            if (success) {
                setAllRecipient(prev => {
                    let prevAllRecipient = [...prev]
                    const index = prev.findIndex((item) => item.ID === ID)
                    prevAllRecipient[index] = { ID, name, address, phone }
                    return prevAllRecipient
                })
                closeModal()
                return notifySuccess("Cập nhật thành công!")
            } else {
                return notifyError("Cập nhật thất bại!")
            }
        }
        const receivingString = JSON.stringify({ name, address, phone, is_receiving: 1 })
        const success = await ipcRenderer.invoke("create-new-receiving", receivingString)
        if (success.ID) {
            reload()
            closeModal()
            return notifySuccess("Thêm đơn vị nhận thành công!")
        } else {
            notifyError("Thêm đơn vị nhận thất bại")
        }
        
    }

    const handleInputPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const numericValue = value.replace(/[^\d]/g, '');
        form.setFieldValue('phone', numericValue)
    }


    useEffect(() => {
        if (data) {
            const { name, address, phone } = data
            form.setFieldValue('name', name);
            form.setFieldValue('address', address);
            form.setFieldValue('phone', phone);
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
                            <Input size="large" placeholder="Số điện thoại đơn vị nhận" disabled={isLoading} onChange={handleInputPhone} />
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
