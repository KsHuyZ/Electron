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

const TableTree = (props: TableTreeProps) => {
  const {  columns,
    data,
    isShowSelection,
    setIsListenChange,
    setRowsSelect,
    listRowSelected,
    ...other} = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRow?: DataType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (selectedRow && setRowsSelect) {
      setRowsSelect(selectedRow)
    }
  };

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: onSelectChange,
  };

  const MemoTableTree = React.memo(({ columns, data, rowSelection, ...other }: TableTreeProps) => {
    return (
      <Table
        columns={columns}
        scroll={{ y: 500 }}
        loading={true}
        style={{ maxWidth: '1200px' }}
        rowSelection={rowSelection}
        dataSource={data as any}
        rowKey={(record: DataType) => record.IDIntermediary}
        // expandable = {{
        //   childrenColumnName : "children",
        //   defaultExpandAllRows : true
        //   }}
        {...other}
      />
    );
  });

  // useEffect(() => {
  //   if (listRowSelected) {
  //     setSelectedRowKeys(listRowSelected.map((item) => +item.IDIntermediary));
  //     if (setRowsSelect) {
  //       setRowsSelect(listRowSelected);
  //     }
  //     setIsListenChange(false);
  //   }
  // }, [listRowSelected]);

  return <MemoTableTree columns={columns} data={data} rowSelection={rowSelection} {...other} />;
};

export default TableTree;
