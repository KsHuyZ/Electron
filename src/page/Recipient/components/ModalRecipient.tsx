import toastify from '@/lib/toastify'
import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input, Form, Modal, message, InputRef } from 'antd'
import { ipcRenderer } from 'electron'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'


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
    isShow: boolean;
}


const ModalRecipient = (props: ModalRecipientProps) => {
    const { closeModal, data, reload, setAllRecipient, isShow } = props
    const [form] = Form.useForm();
    const { notifySuccess, notifyError } = toastify
    const inputRef = useRef<InputRef | null>(null)
    const hanldeSubmit = async () => {
        await form.validateFields();
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
            handleClean()
            return message.success("Thêm đơn vị nhận thành công!")
        } if (!success) {
            return form.setFields([{
                name: 'name',
                errors: ['Đơn vị nhận đã tồn tại']
            }])
        } else {
            message.error("Thêm đơn vị nhận thất bại")
        }
    }

    const handleInputPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const numericValue = value.replace(/[^\d]/g, '');
        form.setFieldValue('phone', numericValue)
    }

    useEffect(() => {
        if (data && isShow) {
            form.setFieldsValue(data);
        }
        const handle = setTimeout(() => {
            inputRef.current?.focus()
        }, 300)
        return () => {
            clearTimeout(handle)
        }
    }, [data, isShow])

    const handleClean = () => {
        form.resetFields()
        closeModal()
    }

    return (
        <Modal
            title={data ? `Cập nhật đơn vị` : `Thêm đơn vị mới`}
            centered
            open={isShow}
            onCancel={handleClean}
            onOk={() => form.submit()}>
            <Form form={form} layout="vertical" onFinish={hanldeSubmit}>
                <Form.Item
                    label="Tên Đơn Vị Nhận"
                    name="name"
                    rules={[
                        { required: true, message: 'Tên đơn vị nhận không được để trống.' },
                    ]}
                >
                    <Input size="large" placeholder="Tên đơn vị nhận" ref={inputRef} />
                </Form.Item>
                <Form.Item
                    label="Địa Chỉ Đơn Vị Nhận"
                    name="address"
                >
                    <Input size="large" placeholder="Địa chỉ đơn vị nhận" />
                </Form.Item>
                <Form.Item
                    label="Số Điện Thoại Đơn Vị Nhận"
                    name="phone"
                >
                    <Input size="large" placeholder="Số điện thoại đơn vị nhận" onChange={handleInputPhone} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalRecipient
