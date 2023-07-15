import { Table } from "antd";
import { TableProps } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { DataType } from "@/page/WarehouseItem/types";
import type { TableRowSelection } from 'antd/es/table/interface';
import { FormatTypeTable } from "@/types";
import { useState,SetStateAction,Dispatch, useEffect } from "react";

interface TableTreeProps extends TableProps<any>{
isShowSelection? : Boolean;
columns : ColumnsType<DataType>;
data?: FormatTypeTable<DataType> | [];
isListenChange?: boolean;
setRowsSelect?: Dispatch<SetStateAction<DataType[]>>
setIsListenChange?: (status: boolean) => void;
listRowSelected?: DataType[];
}

function TableTree(props:  TableTreeProps){
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const {columns, data,isShowSelection,setIsListenChange,...other} =  props;


    useEffect(() => {
        if (props.isListenChange && props.listRowSelected) {
          setSelectedRowKeys(props.listRowSelected.map(item => +item.IDIntermediary));
          if (props.listRowSelected && props.setRowsSelect) {
            props.setRowsSelect(props.listRowSelected)
          }
          
          props.setIsListenChange(false);
        }
      }, [props.isListenChange])

    const onSelectChange = (selectedRowKeys : React.Key[], selectedRows : DataType[]) => {
        setSelectedRowKeys(selectedRowKeys);
        if (selectedRows && props.setRowsSelect) {
          props.setRowsSelect(selectedRows)
        }
      }


    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        preserveSelectedRowKeys: true,
        onChange: onSelectChange,
      };

    
    return (
        <Table
        columns={columns}
        scroll={{ y: 500 }}
        style={{ maxWidth: '1200px' }}
        rowSelection={isShowSelection ? { ...rowSelection } : undefined}
        dataSource={data as any}
        rowKey={(record: FormatTypeTable<DataType>) => record.IDIntermediary}
        {...other}
      />
    )
}

export default TableTree;