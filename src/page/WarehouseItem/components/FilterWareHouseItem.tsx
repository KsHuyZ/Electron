import { Row, Col, Select, Input, DatePicker, Space, Button, Form } from "antd";
import { OptionSelect } from "@/types";
import { STATUS } from "@/types";
import { useEffect, useState, useMemo } from "react";
import { ipcRenderer } from 'electron';
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { stringifyParams } from "@/utils";

const { RangePicker } = DatePicker;

interface PropsFilter {
  name?: string;
  isSearch?: Boolean;
  handleIsSearch: (envSearch: Boolean) => void;
  handleChangeName: (value: string) => void;
}

type ISearch = {
  name?: string;
  idSource: string;
  date: any;
  status: number | null;
};

const listOptionStatus: OptionSelect[] = [
  {
    label: 'Tạm nhập',
    value: STATUS.TEMPORARY_IMPORT
  },
]


const FilterWareHouseItem = (props: PropsFilter) => {
  const [listSource, setListSource] = useState<OptionSelect[]>([]);
  const { name, ...other } = props;
  const [formFilter] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    new Promise(async () => {
      await getListSource();
    })
  }, []);

  const getListSource = async () => {
    const result = await ipcRenderer.invoke("get-all-no-pagination");
    if (result as any) {
      const option: OptionSelect[] = result.rows.map((item: any) => ({
        label: item.name,
        value: item.ID
      }));

      setListSource(option);
    }
  }

  const handleRemoveItemSearch = () => {
    formFilter.resetFields();
    other.handleChangeName('')
  }

  const onFinish = (value: ISearch) => {
    const objSearch = {
      name: name ?? '',
      status: value.status ?? '',
      startDate: value.date && value.date[0] ? dayjs(value.date[0]).format('YYYY/MM/DD') : undefined,
      endDate: value.date && value.date[1] ? dayjs(value.date[1]).format('YYYY/MM/DD') : undefined,
      idSource: value.idSource ?? ''
    }
    other.handleIsSearch(true);
    setSearchParams(stringifyParams({ params: { ...objSearch } }));

  }

  return (
    <>
      <Form layout="vertical" form={formFilter} onFinish={onFinish}>
        <Row className="filter-bar" gutter={12}>
          <Col span={8}>


            <Form.Item
              name={'idSource'}
              label={'Nguồn Hàng'}
              className="label-custom-input-filter"
            >
              <Select

                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={listSource}

              />
            </Form.Item>


          </Col>
          <Col span={8}>

            <Form.Item
              name={'date'}
              label={'Thời gian nhập'}
              className="label-custom-input-filter"
            >
              <RangePicker
                style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>

            <Form.Item
              name={'status'}
              label={'Trạng thái'}
              className="label-custom-input-filter"
            >
              <Select

                style={{ width: '100%' }}
                options={listOptionStatus}

              />
            </Form.Item>

          </Col>
        </Row>
        <Row align={'bottom'} style={{ float: 'right', marginTop: '20px' }}>
          <Space>
            <Button danger onClick={handleRemoveItemSearch}>Xóa</Button>
            <Button className="button-bar" type="primary" htmlType="submit">Tìm kiếm</Button>
          </Space>
        </Row>
      </Form>
    </>
  )
}

export default FilterWareHouseItem;