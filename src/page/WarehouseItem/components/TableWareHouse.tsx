import { useState } from "react";
import { Table, TableProps } from "antd";
import type { TableRowSelection } from 'antd/es/table/interface';

import { DataType } from "../types";

interface TableWareHouseProps extends TableProps<any> {
    isShowSelection?:Boolean;
    setIsShowPopUp: () => void;
    setRowSelected: (data: any) => void;
}

const TableWareHouse = (props : TableWareHouseProps) =>{
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const {isShowSelection = false, ...other} = props;
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
            key: 'select_all',
            text: 'Chọn tất cả',
            onSelect: (changeableRowKeys) => {
              setSelectedRowKeys(changeableRowKeys);
            },
          },
          {
            key: 'remove_all',
            text: 'Xóa tất cả',
            onSelect: (changeableRowKeys) => {
              setSelectedRowKeys([]);
            },
          },
          {
            key: 'change_warehouse',
            text: 'Chuyển kho',
            onSelect: (changeableRowKeys) =>{
                other.setRowSelected(changeableRowKeys);
            //   console.log(changeableRowKeys);
            }
          }
        ],
      };
    
    return (
        <Table 
        rowSelection={isShowSelection ? rowSelection : undefined} 
        scroll={{y: 500}}

        style={{maxWidth: '1200px'}}
        rowKey={isShowSelection ? (record: DataType) => record.ID : undefined}
            {
                ...other
            }
        />
    )
}

export default TableWareHouse