import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input } from 'antd'
import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'


type DataType = {
    ID: number;
    name: string;
    address: string;
    phone: string;
}

interface ModalItemSourceProps {
    closeModal: () => void,
    setLoading: () => void
    data: DataType | null | undefined
}




const ModalItemSource = (props: ModalItemSourceProps) => {
    const { closeModal, setLoading, data } = props
    const [value, setValue] = useState({
        name: "",
        address: "",
        phonenumber: ""
    })
    const [error, setError] = useState({
        name: "",
        address: "",
        phonenumber: ""
    })
    const [isSubmit, setIsSubmit] = useState(false)


    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            closeModal()
        }
    }

    const hanldeSubmit = () => {
        setIsSubmit(true)
        let error = { name: "", address: "", phonenumber: "" }
        const { name, address, phonenumber } = value
        if (name === "") {
            error.name = "Chưa nhập tên nguồn hàng"
        }
        if (address === "") {
            error.address = "Chưa nhập địa chỉ nguồn hàng"
        }
        if (phonenumber === "") {
            error.phonenumber = "Chưa nhập số điện thoại nguồn hàng"
        }

        if (error.name.length > 0 || error.address.length > 0 || error.phonenumber.length > 0) {
            setError(error)
            return
        }
        setLoading()
        if (data) {
            const { ID } = data
            return ipcRenderer.send("update-itemsource", { id: ID, name, address, phonenumber })
        }
        ipcRenderer.send("create-new-nguonHang", { name, address, phonenumber })
    }

    const handleChangeInput = (field: string, value: string) => {
        setError(prev => ({ ...prev, [field]: "" }))
        setValue(prev => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        if (data) {
            const { name, address, phone } = data
            setValue({ name, phonenumber: phone, address })
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
                    <div className="row">
                        <div className="title">Tên nguồn hàng</div>
                        <div className="error">{error.name}</div>
                        <Input size="large" placeholder="Tên nguồn hàng" status={isSubmit && error.name.length > 0 ? "error" : ""} value={value.name} onChange={(e) => handleChangeInput("name", e.target.value)} />
                    </div>
                    <div className="row">
                        <div className="title">Địa chỉ</div>
                        <div className="error">{error.address}</div>
                        <Input size="large" placeholder="Địa chỉ" value={value.address} onChange={(e) => handleChangeInput("address", e.target.value)} status={isSubmit && error.address.length > 0 ? "error" : ""} />
                    </div>
                    <div className="row">
                        <div className="title">Số điện thoại</div>
                        <div className="error">{error.phonenumber}</div>
                        <Input size="large" placeholder="Số điện thoại" type='number' value={value.phonenumber} status={isSubmit && error.phonenumber.length > 0 ? "error" : ""} onChange={(e) => handleChangeInput("phonenumber", e.target.value)} />
                    </div>
                </div>
                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={() => {
                            setTimeout(() => closeModal(), 300)
                        }}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" onClick={hanldeSubmit}>{!data ? "Thêm nguồn hàng" : "Cập nhật"}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalItemSource
