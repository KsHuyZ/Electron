import { UilMultiply } from '@iconscout/react-unicons'
import { Button, Input } from 'antd'
import { ipcRenderer } from 'electron'
import React, { useState } from 'react'

type ModalProps = {
    closeModal: () => void,
    setLoading: () => void
}

const ModalItemSource = ({ closeModal, setLoading }: ModalProps) => {

    const [name, setName] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [phonenumber, setPhonenumber] = useState<string>("")

    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            closeModal()
        }
    }

    const hanldeAddNewItemSource = () => {
        setLoading()
        ipcRenderer.send("create-new-itemsource", { name, address, phonenumber })
    }

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
                        <Input size="large" placeholder="Tên nguồn hàng" onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="row">
                        <div className="title">Địa chỉ</div>
                        <Input size="large" placeholder="Địa chỉ" onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="row">
                        <div className="title">Số điện thoại</div>
                        <Input size="large" placeholder="Số điện thoại" onChange={(e) => setPhonenumber(e.target.value)} />
                    </div>
                </div>
                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={() => {
                            setTimeout(() => closeModal(), 300)
                        }}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" onClick={hanldeAddNewItemSource}>Thêm nguồn hàng</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalItemSource
