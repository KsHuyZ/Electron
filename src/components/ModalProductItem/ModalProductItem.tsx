import { UilMultiply } from '@iconscout/react-unicons'
import { Button, DatePicker, Input, Select } from 'antd'
import { ipcRenderer } from 'electron'
import React, { useState } from 'react'
import moment, { Moment } from 'moment'
import dayjs, { Dayjs } from 'dayjs'
// import viVn from 'antd/lib/locale/vi_VN';
// import type { Dayjs } from 'dayjs';


type ModalProps = {
    closeModal: () => void,
    setLoading: () => void,
    id: string | undefined
}

interface FormState {
    name: string;
    price: string;
    unit: string;
    quality: number;
    numplan: number;
    numreal: number;
    expiry: Moment | null;
    imported_date: Moment | null;
    wareHouse: string | undefined;
    confirm: boolean;
}

const ModalProductItem = ({ closeModal, setLoading, id }: ModalProps) => {

    const [inputValue, setInputValue] = useState<FormState>({
        name: "",
        price: "",
        wareHouse: id,
        unit: "",
        quality: 1,
        numplan: 0,
        numreal: 0,
        confirm: false,
        expiry: null,
        imported_date: moment(new Date()),
    })
    // const [name, setName] = useState<string>("")
    // const [price, setPrice] = useState<string>("")
    // const [wareHouse, setWareHouse] = useState()
    // const [unit, setUnit] = useState("")
    // const [quality, setQuality] = useState(1)
    // const [numplan, setNumplan] = useState(0)
    const handleCloseModal = () => {

    }

    const handleAddNewProductItem = () => {
        ipcRenderer.send("create-product-item", inputValue)
        setLoading()

    }

    const handleChangeInput = (value: string | number, name: keyof FormState) => {
        // const { name, value } = event.target;
        setInputValue(prev => ({ ...prev, [name]: value }))
    }


    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const newDate = moment(value, 'DD/MM/YYYY', true);
        setInputValue(prev => ({ ...prev, expiry: newDate.isValid() ? newDate : null })) // date chính là giá trị ngày tháng được chọn
        // console.log(dateString); // dateString chính là giá trị ngày tháng được chọn dưới dạng chuỗi
    }

    return (
        <div className='backdrop'>
            <div className="modal" onKeyDown={handleCloseModal} tabIndex={0} style={{ margin: "10vh auto", width: "40vw" }}>
                <div className="header">
                    <div className="close-btn" >
                        <UilMultiply onClick={closeModal} />
                    </div>
                </div>
                <div className="main-body" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="left">
                        <div className="row">
                            <div className="title">Tên mặt hàng</div>
                            <Input size="large" placeholder="Tên mặt hàng" name='name' onChange={(e) => handleChangeInput(e.target.value, "name")} />
                        </div>
                        <div className="row">
                            <div className="title">Giá</div>
                            <Input size="large" placeholder="Giá" name='price' onChange={(e) => handleChangeInput(e.target.value, "price")} />
                        </div>
                        <div className="row">
                            <div className="title">Đơn vị tính</div>
                            <Input size="large" placeholder="Đơn vị tính" name='unit' onChange={(e) => handleChangeInput(e.target.value, "unit")} />
                        </div>
                        <div className="row">
                            <div className="title">Hạn dùng</div>
                            <DatePicker
                                value={inputValue.expiry}
                                format={"DD/MM/YYYY"}
                                // locale={viVn}
                                onChange={handleDateChange}
                                placeholder='Hạn sử dụng'
                                size='large'
                            />
                        </div>
                    </div>
                    <div className="right">
                        <div className="row">
                            <div className="title">Chất lượng</div>
                            <Select
                                labelInValue
                                value={inputValue.quality}
                                style={{ width: "100%" }}
                                onChange={(value) => handleChangeInput(value.value, "quality")}
                                size='large'
                                options={[
                                    {
                                        value: 1,
                                        label: 'Rất tốt',
                                    },
                                    {
                                        value: 2,
                                        label: 'Tốt',
                                    },
                                    {
                                        value: 3,
                                        label: 'Bình thường',
                                    },
                                    {
                                        value: 4,
                                        label: 'Không tốt',
                                    },
                                    {
                                        value: 5,
                                        label: 'Không thể sử dụng',
                                    },
                                ]}
                            />
                        </div>
                        <div className="row">
                            <div className="title">Số lượng nhập vào dự kiến</div>
                            <Input size="large" placeholder="Số lượng nhập vào dự kiến" name='' onChange={(e) => handleChangeInput(e.target.value, "numplan")} />
                        </div>
                        <div className="row">
                            <div className="title">Số lượng nhập vào thực tế</div>
                            <Input size="large" placeholder="Số lượng nhập vào thực tế" name='' onChange={(e) => handleChangeInput(e.target.value, "numreal")} />
                        </div>
                        <div className="row">
                            <div className="title">Ngày nhập</div>
                            <DatePicker
                                value={inputValue.expiry}
                                format={"DD/MM/YYYY"}
                                // locale={viVn}
                                onChange={handleDateChange}
                                placeholder='Ngày nhập'
                                size='large'
                            />
                        </div>
                    </div>
                </div>
                <div className="action">
                    <div className="cancel">
                        <Button type="primary" ghost onClick={() => {
                            setTimeout(() => closeModal(), 300)
                        }}>Thoát</Button>
                    </div>
                    <div className="create">
                        <Button type="primary" onClick={handleAddNewProductItem}>Thêm mặt hàng</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalProductItem
