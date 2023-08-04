import { Form, Modal, Input, Row, Col, Space,Button } from "antd";
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useState } from "react";


interface PropsModal {
    canUpdate: boolean;
    setCanUpdate: (status: boolean) => void;
}

const AuthModal = (props: PropsModal) => {
    
    const [form] = Form.useForm();
    const [isShowModal, setIsShowModal] = useState(false)

    const onFinish = async () => {
        const password = form.getFieldValue('password')
        if (password !== "admin") return form.setFields([{
            name: 'password',
            errors: ['Sai mật khẩu']
        }])
        props.setCanUpdate(true)
        handleClean()
    };

    const handleShowForm = () => {
        if (props.canUpdate) return props.setCanUpdate(false)
        setIsShowModal(true)
    }

    
    const handleClean = () => {
        form.resetFields()
        setIsShowModal(false)
    }

    return (
        <>
        <Row style={{ margin: '0 0 10px 0 ' }}>
                <Col span={24}>
                    <Space>
                        <Button className="default" type="primary" onClick={handleShowForm} icon={props.canUpdate ? <LockOutlined /> : <UnlockOutlined />}>{!props.canUpdate ? "Chỉnh sửa" : "Khóa chỉnh sửa"}</Button>
                    </Space>
                </Col>
            </Row>
        <Modal
                title={`Nhập đúng mật khẩu để được phép chỉnh sửa`}
                centered
                open={isShowModal}
                onCancel={handleClean}
                onOk={form.submit}
            >
                <Form form={form} onFinish={onFinish}>
                    <Form.Item label="Mật khẩu" name={'password'} rules={[
                        {
                            required: true,
                            message: "Hãy nhập mật khẩu để sửa phiếu",
                        },
                    ]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default AuthModal