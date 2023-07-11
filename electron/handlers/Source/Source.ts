import { ipcMain } from "electron";
import SourceDB from "../../database/Source/Source";
import { Source } from "../../types";
const Source = () => {
  const { createItemSource, getAllItemSource, updateSource, deleteItemSource,getAllItemSourceNoPagination } =
    SourceDB;

  // listen create Source request
  ipcMain.handle("create-new-source", async (event, data: Source) => {
    const response = await createItemSource(data);
    return response;
  });

  ipcMain.handle("get-all-no-pagination", async(event) =>{
    const response = await getAllItemSourceNoPagination();
    return response;
  })

  // listen get all Source request
  ipcMain.handle(
    "source-request-read",
    async (
      event,
      data: { pageSize: number; currentPage: number; id?: string } = {
        pageSize: 10,
        currentPage: 1,
      }
    ) => {
      const { pageSize, currentPage } = data;
      const response = await getAllItemSource(pageSize, currentPage);
      return response;
    }
  );

  // listen update event
  ipcMain.handle(
    "update-itemSource",
    async (event, data: Source, id: number) => {
      const response = await updateSource(data, id);
      return response;
    }
  );

  // listen delete event
  ipcMain.handle("delete-itemsource", async (event, id: number) => {
    const response = await deleteItemSource(id);
    return response;
  });

  // ipcMain.on("get-product-nguonHang")
};
export default Source;
