import { Row, Col, Button, message } from "antd";
import { ipcRenderer } from "electron";
import { formatDate } from "@/utils";

const ExportFiles = ({nameWareHouse, idWareHouse} : {nameWareHouse: string, idWareHouse: number}) =>{

    const handleExportReport = async() => {
        try {
            const result = await ipcRenderer.invoke('export-request-xlsx', nameWareHouse);
    
        if (result.filePath) {
          const response = await ipcRenderer.invoke('export-report-warehouseitem', { nameWareHouse:nameWareHouse, data: idWareHouse, filePath: result.filePath });
    
          if(response === 'error'){
            message.error('Xuất file không thành công');
          } else {
            message.success('Xuất file thành công');
          }
        }
        } catch (error) {
            message.error('Không thể xuất file');
        }
    }
    
    const handleExportNewItem = async() =>{
        let dateRanger = {
            start: formatDate("", true, "no_date"),
            end : formatDate(new Date(),true, "no_date")
        }

        try {
            const result = await ipcRenderer.invoke('export-request-xlsx', nameWareHouse);
    
        if (result.filePath) {
          const response = await ipcRenderer.invoke('export-report-new-item', { date: dateRanger, idWareHouse: idWareHouse, filePath: result.filePath });
    
          if(response === 'error'){
            message.error('Xuất file không thành công');
          } else {
            message.success('Xuất file thành công');
          }
        }
        } catch (error) {
            message.error('Không thể xuất file');
            
        }
      }

    return (
        <Row className="filter-bar" style={{ marginTop : '30px'}} gutter={12}>
        <Col span={5}>
        <Button className="default" onClick={handleExportReport} type="primary">Xuất báo cáo hàng tồn</Button>
        </Col>
        <Col span={6}>
        <Button className="default" onClick={handleExportNewItem} type="primary">Xuất báo cáo mặt hàng mới</Button>
          
        </Col>

        
        
      </Row>
    )
}

export default ExportFiles;