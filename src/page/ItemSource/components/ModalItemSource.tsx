import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input, Form, Modal, message } from 'antd'
import { ipcRenderer } from 'electron'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import toastify from '@/lib/toastify'

type DataType = {
    ID: number;
    name: string;
    address: string;
    phone: string;
}

interface ModalItemSourceProps {
    closeModal: () => void,
    setLoading: Dispatch<SetStateAction<boolean>>
    data: DataType | null | undefined,
    reload: () => void,
    setAllItemSource: Dispatch<SetStateAction<DataType[]>>
    isShow: boolean;
}

const ModalItemSource = (props: ModalItemSourceProps) => {
    const { closeModal, setLoading, data, reload, setAllItemSource, isShow } = props
    const [isLoading, setIsLoading] = useState(false)
    const [form] = Form.useForm();

    const hanldeSubmit = async () => {
        await form.validateFields();
        setIsLoading(true)
        setLoading(true)
        const { name, address, phone } = form.getFieldsValue();
        if (data) {
            const { ID } = data
            const result = await ipcRenderer.invoke("update-itemSource", { name, address, phone }, ID)
            if (result) {
                setAllItemSource((prev: DataType[]) => {
                    let oldItemSource = [...prev]
                    const index = prev.findIndex(item => item.ID === result.ID)
                    oldItemSource[index] = result
                    return oldItemSource
                })
                message.success("Cập nhật thành công")
            } else {
                message.error("Cập nhật thất bại")
            }
        } else {
            const result = await ipcRenderer.invoke("create-new-source", { name, address, phone })
            setIsLoading(false)
            setLoading(false)
            if (!result) {
                return form.setFields([{
                    name: 'name',
                    errors: ['Nguồn hàng đã tồn tại']
                }])
            }
            reload()
            message.success("Thêm nguồn hàng thành công")
        }
        handleClean()
    }

    const handleInputPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const numericValue = value.replace(/[^\d]/g, '');
        form.setFieldValue('phone', numericValue)
    }

    useEffect(() => {
        if (data) {
            form.setFieldsValue(data);
        }
    }, [data])

    const handleClean = () => {
        form.resetFields()
        closeModal()
    }

    return (
        <Modal
            title={data ? `Cập nhật đơn vị` : `Thêm nguồn mới`}
            centered
            open={isShow}
            onCancel={handleClean}
            onOk={() => form.submit()}>
            <Form form={form} layout="vertical" onFinish={hanldeSubmit}>
                <Form.Item
                    label="Tên Nguồn Hàng"
                    name="name"
                    rules={[
                        { required: true, message: 'Tên nguồn hàng không được để trống.' },
                    ]}
                >
                    <Input size="large" placeholder="Tên nguồn hàng" />
                </Form.Item>
                <Form.Item
                    label="Địa Chỉ Nguồn Hàng"
                    name="address"
                >
                    <Input size="large" placeholder="Địa chỉ nguồn hàng" />
                </Form.Item>
                <Form.Item
                    label="Số Điện Thoại Nguồn Hàng"
                    name="phone"
                >
                    <Input size="large" placeholder="Số điện thoại nguồn hàng" onChange={handleInputPhone} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalItemSource
