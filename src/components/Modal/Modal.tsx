import "./modal.scss"
import { UilMultiply } from '@iconscout/react-unicons'
import { Input, Button } from 'antd';
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

type ModalProps = {
    closeModal: () => void
}

const Modal = ({ closeModal }: ModalProps) => {

    const [name, setName] = useState<string>("")

    const handleCloseModal = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            closeModal()
        }
    }

    const handleAddNewWareHouse = () => {
        ipcRenderer.send("create-new-warehouse", name)
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
                        <div className="title">Tên kho hàng</div>
                        <Input size="large" placeholder="Tên kho hàng" onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={() => {
                            setTimeout(() => closeModal(), 300)
                        }}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" onClick={handleAddNewWareHouse}>Tạo</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal
