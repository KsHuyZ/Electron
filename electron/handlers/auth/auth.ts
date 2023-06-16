import { BrowserWindow, ipcMain } from "electron";

const auth = () =>  {
    // listen login request
    ipcMain.on(
      "login-request",
      (event, data: { username: string; password: string }) => {

        const mainWindow = BrowserWindow.getFocusedWindow();

        const { username, password } = data;

        if (username !== "admin") {
          if (mainWindow) {
            mainWindow.webContents.send("wrong-username", {
              message: "Tài khoản không tồn tại",
            });
          }
        } else if (password !== "123456789") {
          if (mainWindow) {
            mainWindow.webContents.send("wrong-password", {
              message: "Mật khẩu sai",
            });
          }
        } else {
          if (mainWindow) {
            mainWindow.webContents.send("login-success", {
              message: "Đăng nhập thành công",
            });
          }
        }
      }
    );
};
export default auth;
