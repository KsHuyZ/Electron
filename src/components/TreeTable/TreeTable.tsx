import { Table } from "antd";
import { TableProps } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { DataType } from "@/page/WarehouseItem/types";
import type { TableRowSelection } from 'antd/es/table/interface';
import { FormatTypeTable } from "@/types";
import React,{ useState,SetStateAction,Dispatch, useEffect } from "react";

interface TableTreeProps extends TableProps<any>{
isShowSelection? : Boolean;
columns : ColumnsType<DataType>;
data?: FormatTypeTable<DataType> | [];
isListenChange?: boolean;
setRowsSelect?: Dispatch<SetStateAction<DataType[]>>
setIsListenChange?: (status: boolean) => void;
listRowSelected?: DataType[];
}

const TableTree = ({
  columns,
  data,
  isShowSelection,
  setIsListenChange,
  setRowsSelect,
  listRowSelected,
}: TableTreeProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (selectedRowKeys : React.Key[], selectedRows :DataType[]) => {
    setSelectedRowKeys(selectedRowKeys);
    if (selectedRows && setRowsSelect) {
      setRowsSelect(selectedRows);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: onSelectChange,
  };

  const MemoTableTree = React.memo(({ columns, data, rowSelection }: TableTreeProps) => {
    return (
      <Table
        columns={columns}
        scroll={{ y: 500 }}
        style={{ maxWidth: '1200px' }}
        rowSelection={rowSelection}
        dataSource={data as any}
        rowKey={(record) => record.IDIntermediary}
        expandable = {{
          childrenColumnName : "children",
          defaultExpandAllRows : true
          }}
        bordered
      />
    );
  });

  useEffect(() => {
    if (listRowSelected) {
      setSelectedRowKeys(listRowSelected.map((item) => +item.IDIntermediary));
      if (setRowsSelect) {
        setRowsSelect(listRowSelected);
      }
      setIsListenChange(false);
    }
  }, [listRowSelected]);

  return <MemoTableTree columns={columns} data={data} rowSelection={rowSelection} />;
};

export default TableTree;
