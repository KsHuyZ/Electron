import { Row, Col, Button, message, Space, DatePicker } from "antd";
import { ipcRenderer } from "electron";
import { formatDate } from "@/utils";
import { useState } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ExportFiles = ({
  nameWareHouse,
  idWareHouse,
}: {
  nameWareHouse: string;
  idWareHouse: number | string;
}) => {
  const [selectTime, setSelectTime] = useState({
    show: false,
    startTime: "",
    endTime: "",
  });
  const [selectTimeRemain, setSelectTimeRemain] = useState({
    show: false,
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState({
    remain: false,
    kk: false,
  });

  const handleExportReport = async () => {
    try {
      const result = await ipcRenderer.invoke(
        "export-request-xlsx",
        nameWareHouse
      );

      if (result.filePath) {
        setLoading((prev) => ({ ...prev, remain: true }));
        const response = await ipcRenderer.invoke("form-remain-inventory", {
          ID: idWareHouse,
          startTime: selectTimeRemain.startTime,
          endTime: selectTimeRemain.endTime,
          filePath: result.filePath,
        });

        if (response === "error") {
          message.error("Xuất file không thành công");
        } else {
          message.success("Xuất file thành công");
        }
        setLoading((prev) => ({ ...prev, remain: false }));
        setSelectTimeRemain({startTime: "", endTime: "", show: false})
      }
    } catch (error) {
      message.error("Không thể xuất file");
    }
  };

  const handleExportNewItem = async () => {
    let dateRanger = {
      start: formatDate("", true, "no_date"),
      end: formatDate(new Date(), true, "no_date"),
    };

    try {
      const result = await ipcRenderer.invoke(
        "export-request-xlsx",
        nameWareHouse
      );

      if (result.filePath) {
        const response = await ipcRenderer.invoke("export-report-new-item", {
          date: dateRanger,
          idWareHouse: idWareHouse,
          filePath: result.filePath,
        });

        if (response === "error") {
          message.error("Xuất file không thành công");
        } else {
          message.success("Xuất file thành công");
        }
      }
    } catch (error) {
      message.error("Không thể xuất file");
    }
  };

  const handleChangeDate = (values: any) => {
    if (!values) {
      return setSelectTime((prev) => ({ ...prev, startTime: "", endTime: "" }));
    }
    setSelectTime((prev) => ({
      ...prev,
      startTime: dayjs(values[0]).format("YYYY/MM/DD"),
      endTime: dayjs(values[1]).format("YYYY/MM/DD"),
    }));
  };

  const handleChangeDateRemain = (values: any) => {
    if (!values) {
      return setSelectTimeRemain((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
      }));
    }
    setSelectTimeRemain((prev) => ({
      ...prev,
      startTime: dayjs(values[0]).format("YYYY/MM/DD"),
      endTime: dayjs(values[1]).format("YYYY/MM/DD"),
    }));
  };

  const handleExportReportKK = async () => {
    const result = await ipcRenderer.invoke(
      "export-request-xlsx",
      "BIÊN BẢN KIỂM KÊ - " + nameWareHouse
    );
    if (result.filePath) {
      setLoading((prev) => ({ ...prev, kk: true }));
      const response = await ipcRenderer.invoke("get-inventory-records", {
        nameWareHouse,
        ID: idWareHouse,
        filePath: result.filePath,
        startTime: selectTime.startTime,
        endTime: selectTime.endTime,
      });
      if (response === "error") {
        message.error("Xuất file không thành công");
      } else {
        message.success("Xuất file thành công");
      }
      setSelectTime({ endTime: "", startTime: "", show: false });
      setLoading((prev) => ({ ...prev, kk: false }));
    }
  };

  return (
    <Row
      className="filter-bar"
      style={{ marginTop: "30px" }}
      gutter={12}
      justify={"end"}
      align={"top"}
    >
      <Col span={5}>
        <Space direction="vertical" align="start">
          <Button
            className="default"
            onClick={() =>
              setSelectTimeRemain((prev) => ({ ...prev, show: !prev.show }))
            }
            type="primary"
          >
            Xuất báo cáo hàng tồn
          </Button>
          {selectTimeRemain.show ? (
            <>
              <RangePicker
                onChange={(value) => handleChangeDateRemain(value)}
              />
              <Button
                type="primary"
                onClick={handleExportReport}
                loading={loading.remain}
              >
                Xuất báo cáo
              </Button>
            </>
          ) : (
            <></>
          )}
        </Space>
      </Col>
      <Col span={6}>
        <Button
          className="default"
          onClick={handleExportNewItem}
          type="primary"
        >
          Xuất báo cáo mặt hàng mới
        </Button>
      </Col>
      <Col span={6}>
        <Space direction="vertical" align="start">
          <Button
            type="primary"
            onClick={() =>
              setSelectTime((prev) => ({
                ...prev,
                show: !prev.show,
              }))
            }
          >
            Biên bản kiểm kê
          </Button>
          {selectTime.show ? (
            <>
              <RangePicker onChange={(value) => handleChangeDate(value)} />
              <Button
                type="primary"
                onClick={handleExportReportKK}
                loading={loading.kk}
              >
                Xuất báo cáo
              </Button>
            </>
          ) : (
            <></>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default ExportFiles;
