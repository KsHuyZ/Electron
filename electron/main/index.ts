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
  name: string;
  price: number;
  unit: string;
  wareHouse: string;
  quality: number;
  numplan: number;
  numreal: number;
  confirm: boolean;
  expiry: Moment | null;
  imported_date: Moment | null;
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
      "CREATE TABLE IF NOT EXISTS admin (ID INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(100) NOT NULL, password CHAR NOT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS itemsource (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phonenumber VARCHAR(255))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS recipients (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, address VARCHAR(255), phonenumber VARCHAR(255))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS warehouse (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS product (ID INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, price REAL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS warehouseitem (ID INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, warehouse_id INTEGER NOT NULL, unit VARCHAR(10) NOT NULL, quality INTEGER, numplan INTEGER, numreal INTEGER, confirm BOOLEAN, expiry DATE, itemsource_id INTEGER, imported_date DATE, confirmed_date DATE,FOREIGN KEY (product_id) REFERENCES product(ID), FOREIGN KEY (warehouse_id) REFERENCES warehouse(ID),FOREIGN KEY (itemsource_id) REFERENCES itemsource(ID))"
    );
    // db.run("CREATE TABLE IF NOT EXISTS product (ID INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, warehouse_id INTEGER NOT NULL, unit VARCHAR(10) NOT NULL, quality INTEGER, numplan INTEGER, numreal INTEGER,price REAL, confirm BOOLEAN, imported_date DATE, confirmed_date DATE,FOREIGN KEY (product_id) REFERENCES product(ID), FOREIGN KEY (warehouse_id) REFERENCES warehouse(ID))")
  };

  const createAdmin = () => {
    db.run(
      "INSERT INTO admin (username,password) VALUES (?,?)",
      ["admin", "123456789"],
      (err) => {
        if (err) {
          return console.log(err.message);
        }
        console.log("Create admin success");
      }
    );
  };

  const getAdmin = () => {
    db.all("SELECT * FROM admin", (err, rows) => {
      if (err) {
        return console.log(err);
      }
      console.log(rows);
    });
    db.all("SELECT * FROM product", (err, rows) => {
      if (err) {
        return console.log(err);
      }
      console.log(rows);
    });
    db.all("SELECT * FROM warehouseitem", (err, rows) => {
      if (err) {
        return console.log(err);
      }
      console.log(rows);
    });
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
    console.log(data);

    const sql = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    db.all(sql, [data.username, data.password], (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      if (rows.length > 0) {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("login-success", {
            message: "Login-success",
          });
        }
      } else {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("login-failed", {
            message: "Login-success",
          });
        }
      }
    });
  };

  const createProduct = (data: ProductItem) => {
    const { name, price } = data;

    db.run(
      "INSERT INTO product (name,price) VALUES (?,?)",
      [name, price],
      function (err) {
        if (err) {
          console.log(err.message);
          return null;
        } else {
          const id = this.lastID;
          createWareHouseItem(data, id);
        }
      }
    );
  };

  const createWareHouseItem = (data: ProductItem, idProduct: number | null) => {
    const {
      name,
      price,
      unit,
      wareHouse,
      quality,
      numplan,
      numreal,
      confirm,
      expiry,
      imported_date,
    } = data;
    db.run(
      "INSERT INTO warehouseitem (product_id,warehouse_id,unit,quality, numplan, numreal, confirm,expiry, imported_date) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        idProduct,
        wareHouse,
        unit,
        quality,
        numplan,
        numreal,
        confirm,
        expiry,
        imported_date,
      ],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ID = this.lastID;
          const newData = {
            ID,
            name,
            price,
            unit,
            quality,
            numplan,
            numreal,
            confirm,
            expiry,
            imported_date,
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

  ipcMain.on("create-new-warehouse", (event, data: string) => {
    db.run("INSERT INTO warehouse (name) VALUES (?)", [data], function (err) {
      if (err) {
        console.log(err.message);
      } else {
        const ID = this.lastID;
        const newData = { ID, name: data };
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.webContents.send("append-warehouse", newData);
        }
      }
    });
  });

  ipcMain.on(
    "create-new-itemsource",
    (event, data: { name: string; address: string; phonenumber: string }) => {
      const { name, address, phonenumber } = data;
      db.run(
        "INSERT INTO itemsource (name,address,phonenumber) VALUES (?,?,?)",
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
    const newData = JSON.parse(data);
    createProduct(newData);
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

  // db.run("DROP TABLE warehouseitem");
  // db.run("DROP TABLE product");
  createTable();
  getAdmin();
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
