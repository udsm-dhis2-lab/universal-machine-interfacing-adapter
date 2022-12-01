import { Injectable } from "@angular/core";
import { ElectronService } from "../core/services";
import { ElectronStoreService } from "./electron-store.service";
import { Pool } from "pg";
import { FxRequest, PageDetails } from "../shared/interfaces/fx.interface";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private mysqlPool = null;
  private dbConfig = null;
  public appSettings = null;

  constructor(
    private electronService: ElectronService,
    private store: ElectronStoreService
  ) {
    const mysql = this.electronService.mysql;
    const that = this;
    that.appSettings = that.store.get("appSettings");

    // Initialize mysql connection pool only if settings are available
    if (
      that.appSettings.mysqlHost != null &&
      that.appSettings.mysqlHost != "" &&
      that.appSettings.mysqlUser != null &&
      that.appSettings.mysqlUser != "" &&
      that.appSettings.mysqlDb != null &&
      that.appSettings.mysqlDb != ""
    ) {
      this.dbConfig = {
        connectionLimit: 1000,
        host: that.appSettings.mysqlHost,
        user: that.appSettings.mysqlUser,
        password: that.appSettings.mysqlPassword,
        database: that.appSettings.mysqlDb,
        port: that.appSettings.mysqlPort,
        dateStrings: "date",
      };

      that.mysqlPool = mysql.createPool(that.dbConfig);

      that.execQuery(
        'SET GLOBAL sql_mode = \
                        (SELECT REPLACE(@@sql_mode, "ONLY_FULL_GROUP_BY", ""))',
        [],
        (res: any) => {
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
      that.execQuery(
        "SET GLOBAL CONNECT_TIMEOUT=28800",
        [],
        (res: any) => {
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
      that.execQuery(
        "SET SESSION INTERACTIVE_TIMEOUT = 28800",
        [],
        (res: any) => {
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
      that.execQuery(
        "SET SESSION WAIT_TIMEOUT = 28800",
        [],
        (res: any) => {
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
      that.execQuery(
        "SET SESSION MAX_EXECUTION_TIME = 28800",
        [],
        (res: any) => {
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
    }
  }

  private query(text: string, params: unknown[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      new Pool({
        connectionString: "postgres://postgres:postgres@localhost:5432/test",
      })
        .query(text, params)
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  getProcesses = async (pager: PageDetails): Promise<any> => {
    const query = ` SELECT *, count(*) OVER() AS count FROM (SELECT * FROM PROCESS) AS PROCESS LIMIT ${
      pager.pageSize
    } OFFSET ${pager.page * pager.pageSize}`;
    const results = await this.query(query);
    return {
      data: results.rows,
      count: results.rows.length > 0 ? results.rows[0].count : 0,
    };
  };

  execQuery(
    query: string,
    data: unknown[],
    success: {
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (arg0: any): void;
    },
    errorf: {
      (err: any): void;
      (err: any): void;
      (err: any): void;
      (err: any): void;
      (err: any): void;
      (arg0: { error: string }): void;
    }
  ) {
    if (this.mysqlPool != null) {
      this.mysqlPool.getConnection(
        (
          err: any,
          connection: {
            release: () => void;
            query: (
              arg0: { sql: any },
              arg1: any,
              arg2: (errors: any, results: any, fields: any) => void
            ) => void;
          }
        ) => {
          if (err) {
            try {
              connection.release();
            } catch (ex) {}
            errorf(err);
            return;
          }

          connection.query(
            { sql: query },
            data,
            (errors: any, results: any, fields: any) => {
              if (!errors) {
                success(results);
                connection.release();
              } else {
                errorf(errors);
                connection.release();
              }
            }
          );
        }
      );
    } else {
      errorf({ error: "Please check your database connection" });
    }
  }
  execWithCallback(
    query: any,
    data: any,
    success: (arg0: any) => void,
    errorf: (arg0: { error: string }) => void,
    callback: () => void
  ) {
    if (this.mysqlPool != null) {
      this.mysqlPool.getConnection(
        (
          err: any,
          connection: {
            release: () => void;
            query: (arg0: { sql: any }, arg1: any) => any;
            destroy: () => void;
          }
        ) => {
          if (err) {
            try {
              connection.release();
            } catch (ex) {}
            errorf(err);
            return;
          }
          const sql = connection.query({ sql: query }, data);
          sql.on("result", (result: any, index: any) => {
            success(result);
          });
          sql.on("error", (err: any) => {
            connection.destroy();
            errorf(err);
          });
          sql.on("end", () => {
            if (callback != null) {
              callback();
            }
            if (connection) {
              connection.destroy();
            }
          });
        }
      );
    } else {
      errorf({ error: "database not found" });
    }
  }

  saveFile = async (data: FxRequest): Promise<any> => {
    const bufferArray = await data.file.arrayBuffer();
    const fileData = Buffer.from(bufferArray).toString();
    const runFunc = Function("context", fileData);
    const query = `INSERT INTO PROCESS (CODE, NAME, DESCRIPTION, FREQUENCY) VALUES($1, $2, $3, $4);`;
    await this.query(query, [
      fileData,
      `'${data.name}'`,
      `'${data.description}'`,
      `'${data.frequency}'`,
    ]);
    await runFunc({ name: "Bennett" });

    return data;
  };

  addOrderTest(
    data: { [s: string]: unknown } | ArrayLike<unknown>,
    success: {
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (arg0: any): void;
    },
    errorf: {
      (err: any): void;
      (err: any): void;
      (err: any): void;
      (err: any): void;
    }
  ) {
    const t =
      "INSERT INTO orders (" +
      Object.keys(data).join(",") +
      ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    if (this.mysqlPool != null) {
      this.execQuery(t, Object.values(data), success, errorf);
    }

    this.electronService
      .execSqliteQuery(t, Object.values(data))
      .then((results: any) => {
        success(results);
      });
  }

  fetchLastOrders(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = "SELECT * FROM orders ORDER BY added_on DESC LIMIT 1000";
    if (this.mysqlPool != null) {
      this.execQuery(t, null, success, errorf);
    } else {
      // Fetching from SQLITE
      this.electronService.execSqliteQuery(t, null).then((results: any) => {
        success(results);
      });
    }
  }

  fetchLastSyncTimes(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t =
      "SELECT MAX(lims_sync_date_time) as lastLimsSync, MAX(added_on) as lastResultReceived FROM `orders`";

    if (this.mysqlPool != null) {
      this.execQuery(t, null, success, errorf);
    } else {
      // Fetching from SQLITE
      this.electronService.execSqliteQuery(t, null).then((results: any) => {
        success(results);
      });
    }
  }

  addResults(data: any, success: (arg0: any) => void, errorf: any) {
    const t =
      "UPDATE orders SET tested_by = ?,test_unit = ?,results = ?,analysed_date_time = ?,specimen_date_time = ? " +
      ",result_accepted_date_time = ?,machine_used = ?,test_location = ?,result_status = ? " +
      " WHERE test_id = ? AND result_status < 1";
    if (this.mysqlPool != null) {
      this.execQuery(t, data, success, errorf);
    }

    this.electronService.execSqliteQuery(t, data).then((results: any) => {
      success(results);
    });
  }

  addRawData(
    data: { [s: string]: unknown } | ArrayLike<unknown>,
    success: {
      (res: any): void;
      (res: any): void;
      (res: any): void;
      (arg0: any): void;
    },
    errorf: { (err: any): void; (err: any): void; (err: any): void }
  ) {
    // console.log("======Raw Data=======");
    // console.log(data);
    // console.log(Object.keys(data));
    // console.log(Object.values(data));
    // console.log("=============");
    const t =
      "INSERT INTO raw_data (" + Object.keys(data).join(",") + ") VALUES (?,?)";

    if (this.mysqlPool != null) {
      this.execQuery(t, Object.values(data), success, errorf);
    }
    this.electronService
      .execSqliteQuery(t, Object.values(data))
      .then((results: any) => {
        success(results);
      });
  }

  addApplicationLog(
    data: { [s: string]: unknown } | ArrayLike<unknown>,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t =
      "INSERT INTO app_log (" + Object.keys(data).join(",") + ") VALUES (?)";
    if (this.mysqlPool != null) {
      this.execQuery(t, Object.values(data), success, errorf);
    }
    this.electronService
      .execSqliteQuery(t, Object.values(data))
      .then((results: any) => {
        success(results);
      });
  }

  fetchRecentLogs(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = "SELECT * FROM app_log ORDER BY added_on DESC, id DESC LIMIT 500";
    if (this.mysqlPool != null) {
      this.execQuery(t, null, success, errorf);
    } else {
      // Fetching from SQLITE
      this.electronService.execSqliteQuery(t, null).then((results: any) => {
        success(results);
      });
    }
  }
}
