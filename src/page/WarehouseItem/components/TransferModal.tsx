import { Modal, Space,Select, Button, Form, Table, Tag,Typography, message } from "antd";
import { STATUS_MODAL } from "../types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import { OptionSelect,WareHouse } from "@/types";
import type { ColumnsType } from 'antd/es/table';
import { DataType } from "../types";
import { formatNumberWithCommas,renderTextStatus } from "@/utils";

interface TransferModalProps {
    isShow: STATUS_MODAL;
    setIsShow: () => void;
    idWareHouse?: string;
    listItem: DataType[];
}

const { Title } = Typography;

const TransferModal = ({isShow, setIsShow,idWareHouse, listItem}: TransferModalProps) =>{
    const [listWareHouse, setListWareHouse]= useState<OptionSelect[]>();
    const refError = useRef<any>(null);
    const [item, setItem] = useState<number>();
    const [isError, setIsError] = useState(false);

    const columns: ColumnsType<DataType> = [
        {
          title: 'Mã mặt hàng',
          dataIndex: 'ID',
          width: 150,
          render: (record) => {
            return `MH${record < 10 ? "0" : ""}${record}`
          }
        },
        {
          title: 'Tên mặt hàng',
          dataIndex: 'name',
          width: 200,
        },
        {
          title: 'Giá',
          dataIndex: 'price',
          width: 200,
          render : (record) =>(
            <span style={{fontWeight: 'bold'}}>{formatNumberWithCommas(record)}</span>
          )
        },
        {
            title: 'Nguồn Hàng',
            dataIndex: 'id_nguonHang',
            width: 200,
            render : (record) =>(
              <span>{record}</span>
            )
          },
          {
            title: 'Ngày Hết Hạn',
            dataIndex: 'date_expried',
            width: 200,
            render : (record) =>(
              <span>{record}</span>
            )
          },
          { 
            title: "Trạng thái",
            dataIndex: "status",
            fixed: 'right',
            width: 150,
            render: (confirm: number) => {
              const { text , color} = renderTextStatus(confirm)
              return (
                <span>
                <Tag color={color}>
                  {text}
                </Tag>
              </span>
              )
            }
          },
      ];

      useEffect(() => {
        const handleListTransferCallback = (
          event: Electron.IpcRendererEvent,
          data: WareHouse[]
        ) => {
          const newListWareHouse = data.map((item) => ({
            label: item.name,
            value: item.ID
          }));
    
          setListWareHouse(newListWareHouse);
        };
    
        if (idWareHouse) {
          console.log("day", idWareHouse);
    
          ipcRenderer.send("on-list-warehouse-except-id", idWareHouse);
          ipcRenderer.on("all-warehouse-except-id", handleListTransferCallback);
        }
    
        return () => {
          ipcRenderer.removeListener(
            "all-warehouse-except-id",
            handleListTransferCallback
          );
        };
      }, [idWareHouse]);



    const Footer = () => {
        return (
          <>
           
          </>
        )
      }
    
    const handleTransferWareHouse = () =>{
      if(!item){
        refError.current.focus();
        setIsError(true);
        return;
      }

      const newList = listItem.map((item : DataType) => item.ID )
      ipcRenderer.send("change-warehouse", item, newList);
      setIsShow()

    }

    const handleChangeSelect = (idItem: number) =>{
     setItem(idItem);
     setIsError(false);
    }

    console.log('modal trans',refError);
    

    return (
        <Modal
        title={'Chuyển kho hàng'}
        centered
        open={isShow === STATUS_MODAL.TRANSFER}
        onCancel={setIsShow}
        style={{margin: '50px'}}
        width={'90%'}
        footer={<Footer />}
      >
        <Space className="modal-item" direction="vertical" size={32} align="center" style={{justifyContent: 'center', width: '100%'}}>
          <div className="form-item">
              <label htmlFor="">Chọn kho hàng cần chuyển</label>
          <Select
            showSearch
            optionFilterProp="children"
            className={isError ? 'error' : ''}
            ref={refError}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={item}
            onChange={(e) => handleChangeSelect(e)}
            options={listWareHouse}
          />
          {
            isError && <p className="text-error">Vui lòng không để trống ô này</p>
          }
          </div>
        
          <div style={{ marginBottom: 32 }}>
          <Title level={5}>Sản Phẩm Đã Chọn</Title>
        <Table
        bordered
        style={{width: '1200px'}}
            columns={columns}
            pagination={false}
            dataSource={listItem}
            rowKey={(record: DataType) => record.ID}
        />
      </div>
      <Button size="large" type="primary" onClick={handleTransferWareHouse}>
            Chuyển kho
      </Button>

        </Space>
        </Modal>
    )
}

export default TransferModal