import { app, BrowserWindow, dialog, ipcMain, screen, shell } from "electron";
import * as Store from "electron-store";
import * as fs from "fs";
import * as path from "path";
//import { Sqlite3Helper } from '../src/app/core/sqlite3helper.main';

// const isMac = process.platform === "darwin";
const items = [
  {
    label: "Help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

// const menu = Menu.buildFromTemplate(items);
// Menu.setApplicationMenu(menu);

let win: BrowserWindow = null;
let store: Store = null;
let sqlitePath: string = null;
let sqliteDbName: string = "database.db";
const args = process.argv.slice(1),
  serve = args.some((val) => val === "--serve");

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  if (!fs.existsSync(app.getPath("userData") + "/data")) {
    fs.mkdirSync(app.getPath("userData") + "/data");
  }

  try {
    Store.initRenderer();
    store = new Store();
    sqlitePath = path.join(app.getPath("userData"), "/data/", sqliteDbName);
    store.set("appPath", sqlitePath);
    store.set("isDev", `${app.isPackaged}`);
  } catch (e) {
    store.set("isDev", `${app.isPackaged}`);
  }

  // Create the browser window.
  win = new BrowserWindow({
    disableAutoHideCursor: true,
    autoHideMenuBar: true,
    title: "Machine Interfacing Module",
    x: 0,
    y: 0,
    fullscreenable: true,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    const debug = require("electron-debug");
    debug();

    require("electron-reloader")(module);
    win.loadURL("http://localhost:4200");
  } else {
    // Path when running electron executable
    let pathIndex = "./index.html";

    if (fs.existsSync(path.join(__dirname, "../dist/index.html"))) {
      // Path when running electron in local folder
      pathIndex = "../dist/index.html";
    }
    const url = new URL(path.join("file:", __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on("ready", () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
  app.whenReady().then(() => {
    // Register a 'dialog' event listener.
    ipcMain.handle("dialog", (event, method, params) => {
      dialog[method](params);
    });
    //new Sqlite3Helper(appUserDataPath);
    const sqlite3 = require("sqlite3");

    sqlitePath = path.join(app.getPath("userData"), "/data/", sqliteDbName);
    const database = new sqlite3.Database(sqlitePath, (err) => {
      if (err) {
        store.set(
          "appPath",
          path.join(app.getPath("userData"), "/data/", sqliteDbName)
        );
        console.error("Database opening error: ", err);
      }
    });

    database.run(
      'CREATE TABLE IF NOT EXISTS `orders` ( \
      `id` INTEGER NOT NULL, \
      `order_id` TEXT NOT NULL, \
      `patient_id` TEXT NOT NULL, \
      `test_id` TEXT DEFAULT NULL, \
      `test_type` TEXT NOT NULL, \
      `raw_json` TEXT DEFAULT NULL, \
      `created_date` date DEFAULT NULL, \
      `test_unit` TEXT DEFAULT NULL, \
      `results` TEXT DEFAULT NULL, \
      `tested_by` TEXT DEFAULT NULL, \
      `analysed_date_time` datetime DEFAULT NULL, \
      `specimen_date_time` datetime DEFAULT NULL, \
      `authorised_date_time` datetime DEFAULT NULL, \
      `result_accepted_date_time` datetime DEFAULT NULL, \
      `machine_used` TEXT DEFAULT NULL, \
      `test_location` TEXT DEFAULT NULL, \
      `created_at` INTEGER NOT NULL DEFAULT "0", \
      `can_sync` BOOLEAN NOT NULL DEFAULT "FALSE", \
      `result_status` INTEGER NOT NULL DEFAULT "0", \
      `lims_sync_status` INTEGER DEFAULT "0", \
      `lims_sync_date_time` datetime DEFAULT NULL, \
      `repeated` INTEGER DEFAULT "0", \
      `test_description` TEXT DEFAULT NULL, \
      `is_printed` INTEGER DEFAULT NULL, \
      `printed_at` INTEGER DEFAULT NULL, \
      `raw_text` mediumtext, \
      `sync_status` TEXT\
      `reference_uuid` TEXT\
      `added_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
      PRIMARY KEY("id" AUTOINCREMENT) \
      );'
    );

    database.run(
      'CREATE TABLE IF NOT EXISTS `raw_data` ( \
      `id` INTEGER NOT NULL, \
      `data` mediumtext NOT NULL, \
      `machine` TEXT NOT NULL, \
      `added_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
      PRIMARY KEY("id" AUTOINCREMENT) \
      );'
    );

    database.run(
      'CREATE TABLE IF NOT EXISTS `order_status` ( \
      `id` INTEGER NOT NULL, \
      `order_id` INTEGER NOT NULL, \
      `category` text NOT NULL, \
      `status` text NOT NULL, \
      `remarks` text NOT NULL, \
      `added_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
      `user_id` INTEGER,\
      PRIMARY KEY("id" AUTOINCREMENT), \
      FOREIGN KEY(order_id) REFERENCES orders(id),\
      FOREIGN KEY(user_id) REFERENCES user(id)\
      );'
    );

    database.run(
      'CREATE TABLE IF NOT EXISTS `app_log` ( \
      `id` INTEGER NOT NULL, \
      `log` TEXT NOT NULL, \
      `added_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
      PRIMARY KEY("id" AUTOINCREMENT) \
      );'
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS user ( id integer, username text, password text, firstname text, middlename text, lastname text, title, added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT) );
      `
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS role ( id integer, name text, description text, added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT) );
      `
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS privilege ( id integer, name text, description text,added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT) );
      `
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS role_privilege ( id integer, role_id integer, privilege_id integer,added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT),FOREIGN KEY(role_id) REFERENCES role(id),FOREIGN KEY(privilege_id) REFERENCES privilege(id) );
      `
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS user_role ( id integer, user_id integer, role_id integer,added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT),FOREIGN KEY(user_id) REFERENCES user(id),FOREIGN KEY(role_id) REFERENCES role(id) );
      `
    );

    database.run(
      `
     CREATE TABLE IF NOT EXISTS process ( id integer, code text, name text, description text, frequency text, secret_id integer, PRIMARY KEY("id" AUTOINCREMENT) );
      `
    );
    database.run(
      `
     CREATE TABLE IF NOT EXISTS secret (id integer NOT NULL, name text  NOT NULL, description text, value mediumtext  NOT NULL, PRIMARY KEY("id" AUTOINCREMENT) );
      `
    );

    database.run("PRAGMA journal_mode = WAL;");

    ipcMain.on("sqlite3-query", (event, sql, args) => {
      // event.reply('sqlite3-reply', sql);
      // event.reply('sqlite3-reply', database);
      if (args === null || args === undefined) {
        database.all(sql, (err, rows) => {
          event.reply("sqlite3-reply", (err && err.message) || rows);
        });
      } else {
        database.all(sql, args, (err, rows) => {
          event.reply("sqlite3-reply", (err && err.message) || rows);
        });
      }
    });
  });
} catch (e) {
  // Catch Error
  // throw e;
}
