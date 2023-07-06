import { useEffect, useState } from "react";
import { Table, TableProps } from "antd";
import type { TableRowSelection } from 'antd/es/table/interface';

import { DataType } from "../types";

interface TableWareHouseProps extends TableProps<any> {
    isShowSelection?:Boolean;
    setIsShowPopUp: () => void;
    setRowSelected: (data: any) => void;
    isListenChange?:Boolean;
    setIsListenChange : (status: boolean) => void;
    listRowSelected?: DataType[];
}

const TableWareHouse = (props : TableWareHouseProps) =>{
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const {isShowSelection = false, ...other} = props;

    useEffect(() =>{
      if(props.isListenChange && props.listRowSelected){
        console.log('has call here');
        console.log('list will converst' , props.listRowSelected);
        
        onSelectChange(props.listRowSelected.map(item => +item.IDIntermediary));
        props.setIsListenChange(false);
      }
    },[props.isListenChange])

    const onSelectChange = (newSelectedRowKeys: any) => {
      console.log('selectedRowKeys changed: ', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<DataType> = {
      selectedRowKeys,
        columnWidth: 150,
        onChange: onSelectChange,
        selections: [
          {
            key: 'change_warehouse',
            text: 'Chuyển kho',
            onSelect: (changeableRowKeys) =>{
                other.setRowSelected(selectedRowKeys);
            }
          }
        ],
      };
    
    return (
        <Table 
        rowSelection={isShowSelection ? rowSelection : undefined} 
        scroll={{y: 500}}

        style={{maxWidth: '1200px'}}
        rowKey={isShowSelection ? (record: DataType) => record.IDIntermediary : undefined}
            {
                ...other
            }
        />
    )
}

export default TableWareHouse