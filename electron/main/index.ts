import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
import sqlite3 from "sqlite3";
import { Moment } from "moment";
sqlite3.verbose();

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

ipcMain.on("close", () => app.quit());

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let db;

type ProductItem = {
  id_wareHouse: number;
  id_nguonHang: number;
  name: string;
  price: number;
  unit: string;
  quality: number;
  date_expried: Moment | null;
  date_created_at: Moment | null;
  date_updated_at: Moment | null;
  quantity_plane: number;
  quantity_real: number;
  status: number;
  note: string;
};

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
    // resizable: false
  });
  win.maximize();
  win.setMenuBarVisibility(false);
  db = new sqlite3.Database("./inventory.sqlite", (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log("Connect to Database success!");
  });

  const createTable = () => {
    db.run(
      "CREATE TABLE IF NOT EXISTS warehouse (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(255))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS nguonHang (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phone VARCHAR(20))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS warehouseitem (ID INTEGER PRIMARY KEY AUTOINCREMENT, id_wareHouse INTEGER NOT NULL, id_nguonHang INTEGER NOT NULL, name VARCHAR (255), price REAL, unit VARCHAR(10) NOT NULL, quality INTEGER, date_expried DATE, date_create_at DATE, date_updated_at DATE, note VARCHAR(255), quantity_plane INTEGER, quantity_real INTEGER, status INTEGER, FOREIGN KEY (id_wareHouse) REFERENCES wareHouse(ID), FOREIGN KEY (id_nguonHang) REFERENCES nguonHang(ID))"
    );
  };

  const getAllWarehouse = () => {
    db.all("SELECT * FROM warehouse", (err, rows) => {
      if (err) {
        console.log(err);
      }
      console.log(rows);

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-warehouse", rows);
      }
    });
  };

  const getAllItemSource = () => {
    db.all("SELECT * FROM itemsource", (err, rows) => {
      if (err) {
        console.log(err);
      }
      console.log(rows);

      const mainWindow = BrowserWindow.getFocusedWindow();
      if (mainWindow) {
        mainWindow.webContents.send("all-itemsource", rows);
      }
    });
  };

  const getAllProductInWarehouse = (id: string) => {
    db.all(
      "SELECT warehouseitem.ID, warehouseitem.unit,warehouseitem.quality,warehouseitem.numplan,warehouseitem.numreal,warehouseitem.confirm,warehouseitem.expiry,warehouseitem.confirmed_date, product.name, product.price FROM warehouseitem JOIN product ON warehouseitem.product_id = product.ID WHERE warehouseitem.warehouse_id = ?",
      [id],
      (err, rows) => {
        if (err) {
          console.log(err);
        }
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("all-warehouseitem", rows);
        }
      }
    );
  };

  const login = (data: { username: string; password: string }) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const {username,password}= data;
    if(username!="admin"){
      if (mainWindow) {
        mainWindow.webContents.send("wrong-username", {
          message: "Tài khoản không tồn tại",
        });
      }

    }
    else if(password!="123456789"){
      if (mainWindow) {
        mainWindow.webContents.send("wrong-password", {
          message: "Mật khẩu sai",
        });
      }
    }
    else {
      if (mainWindow) {
        mainWindow.webContents.send("login-success", {
          message: "Đăng nhập thành công",
        });
      }
    } 

  };
  const createWareHouseItem = (data: ProductItem) => {
    const {
      id_wareHouse,
      id_nguonHang,
      name,
      price,
      unit,
      quality,
      date_expried,
      date_created_at,
      date_updated_at,
      quantity_plane,
      quantity_real,
      note,
      status,
    } = data;
    db.run(
      "INSERT INTO warehouseitem (id_wareHouse, name, price, unit, quality, id_nguonHang, date_expried, date_create_at, date_updated_at, note, quantity_plane, quantity_real, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id_wareHouse,
        id_nguonHang,
        name,
        price,
        unit,
        quality,
        date_expried,
        date_created_at,
        date_updated_at,
        note,
        quantity_plane,
        quantity_real,
        status,
      ],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ID = this.lastID;
          const newData = {
            ID,
            id_wareHouse,
            id_nguonHang,
            name,
            price,
            unit,
            quality,
            date_expried,
            date_created_at,
            date_updated_at,
            note,
            quantity_plane,
            quantity_real,
            status,
          };
          const mainWindow = BrowserWindow.getFocusedWindow();
          if (mainWindow) {
            mainWindow.webContents.send("append-warehouseitem", newData);
          }
        }
      }
    );
  };

  ipcMain.on(
    "login-request",
    (event, data: { username: string; password: string }) => {
      login({ username: data.username, password: data.password });
    }
  );

  ipcMain.on("create-new-warehouse", (event, name: string,description: string) => {
    db.run("INSERT INTO warehouse (name, description) VALUES (?,?)", [name,description], function (err) {
      if (err) {
        console.log(err.message);
      } else {
        const ID = this.lastID;
        const newData = { ID, name,description};
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("append-warehouse", newData);
        }
      }
    });
  });

  ipcMain.on(
    "create-new-nguonHang",
    (event, data: { name: string; address: string; phonenumber: string }) => {
      const { name, address, phonenumber } = data;
      db.run(
        "INSERT INTO nguonHang (name,address,phone) VALUES (?,?,?)",
        [name, address, phonenumber],
        function (err) {
          if (err) {
            console.log(err.message);
          } else {
            const ID = this.lastID;
            const newData = { ID, name, address, phonenumber };
            const mainWindow = BrowserWindow.getFocusedWindow();
            if (mainWindow) {
              mainWindow.webContents.send("append-itemsource", newData);
            }
          }
        }
      );
    }
  );

  ipcMain.on("create-product-item", (event, data: string) => {
    const newData = JSON.parse(data)
    console.log(newData)
    createWareHouseItem(newData);
  });

  ipcMain.on("itemsource-request-read", () => {
    getAllItemSource();
  });

  ipcMain.on("warehouse-request-read", () => {
    getAllWarehouse();
  });

  ipcMain.on("warehouseitem-request-read", (event, data: string) => {
    getAllProductInWarehouse(data);
  });

  createTable();
  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
