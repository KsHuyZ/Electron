import { Dispatch, Key, SetStateAction, useEffect, useState, memo } from "react";
import { Table, TableProps } from "antd";
import type { TableRowSelection } from 'antd/es/table/interface';

import { DataType } from "../types";

interface TableWareHouseProps extends TableProps<any> {
  isShowSelection?: boolean;
  setIsShowPopUp?: () => void;
  setRowSelected?: (data: any) => void;
  isListenChange?: Boolean;
  setIsListenChange: (status: boolean) => void;
  listRowSelected?: DataType[];
  setRowsSelect?: Dispatch<SetStateAction<DataType[]>>
}

function TableWareHouse(props: TableWareHouseProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { isShowSelection = false, listRowSelected, ...other } = props;

  useEffect(() => {
    if (props.isListenChange && props.listRowSelected) {
      onSelectChange(props.listRowSelected.map(item => +item.IDIntermediary));
      props.setIsListenChange(false);
    }
  }, [props.isListenChange, listRowSelected])

  const onSelectChange = (newSelectedRowKeys: Key[], selectedRow?: DataType[]) => {
    console.log("key: ", newSelectedRowKeys)
    console.log("slect row: ", selectedRow)
    setSelectedRowKeys(newSelectedRowKeys);
    if (selectedRow && props.setRowsSelect) {
      props.setRowsSelect(selectedRow)
    }
  };


  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    columnWidth: 150,
    preserveSelectedRowKeys: true,
    onChange: onSelectChange,
  };


  return (
    <Table
      rowSelection={isShowSelection ? rowSelection : undefined}
      scroll={{ y: 500 }}
      style={{ maxWidth: '1200px' }}
      rowKey={isShowSelection ? (record: DataType) => record.IDIntermediary : undefined}
      {
      ...other
      }
    />
  )
}

export default memo(TableWareHouse)