import { Injectable } from "@angular/core";
import axios from "axios";
import { Pool } from "pg";
import { ElectronService } from "../core/services";
import {
  DatabaseResponse,
  ErrorOf,
  Success,
} from "../shared/interfaces/db.interface";
import {
  FxPayload,
  FxRequest,
  PageDetails,
  SecretPayload,
} from "../shared/interfaces/fx.interface";
import { ElectronStoreService } from "./electron-store.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private mysqlPool = null;
  private dbConfig = null;
  public appSettings = null;
  private dbConnected: boolean;

  constructor(
    private electronService: ElectronService,
    private store: ElectronStoreService
  ) {
    const that = this;
    that.appSettings = that.store.get("appSettings");

    // Initialize DB connection pool only if settings are available
    if (
      that.appSettings.dbHost != null &&
      that.appSettings.dbHost != "" &&
      that.appSettings.dbUser != null &&
      that.appSettings.dbUser != "" &&
      that.appSettings.dbName != null &&
      that.appSettings.dbName != ""
    ) {
      this.dbConfig = {
        connectionLimit: 1000,
        host: that.appSettings.dbHost,
        user: that.appSettings.dbUser,
        password: that.appSettings.dbPassword,
        database: that.appSettings.dbName,
        port: that.appSettings.dbPort,
        dateStrings: "date",
      };
    }

    this.query("SELECT * FROM current_catalog;")
      .then(() => {
        this.dbConnected = true;
      })
      .catch(() => {
        this.dbConnected = false;
      });
  }

  private query(
    text: string,
    params: unknown[] = [],
    success?: Success,
    errorf?: ErrorOf,
    summary?: boolean
  ): Promise<DatabaseResponse> {
    return new Promise((resolve, reject) => {
      new this.electronService.postgres({
        connectionString: `postgres://${this.dbConfig.user}:${this.dbConfig.password}@${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`,
      })
        .query(text, params)
        .then((res: DatabaseResponse) => {
          if (success) {
            success(summary ? res : res.rows);
          } else {
            resolve(res);
          }
        })
        .catch((err: any) => {
          if (errorf) {
            errorf(err);
          } else {
            reject(err);
          }
        });
    });
  }

  private functionsQuery({ query, params = [], settings }): Promise<any[]> {
    return new Promise((resolve, reject) => {
      new Pool({
        connectionString: `postgres://${settings.user}:${settings.password}@${settings.host}:${settings.port}/${settings.database}`,
      })
        .query(query, params)
        .then((res: DatabaseResponse) => {
          resolve(res.rows);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  createNewSecret = async (secret: SecretPayload) => {
    const query = `INSERT INTO SECRET(${Object.keys(secret).join(
      ","
    )}) VALUES(${Object.keys(secret)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    return await this.query(query, Object.values(secret));
  };

  run = async (id: number): Promise<string> => {
    const process = await this.query(`SELECT * FROM PROCESS WHERE ID=${id}`);
    const secret = process.rows[0].secret_id
      ? (
          await this.query(
            `SELECT * FROM SECRET WHERE ID=${process.rows[0].secret_id}`
          )
        ).rows[0].value
      : null;
    const runFunc = Function("context", process.rows[0].code);
    await runFunc(
      secret
        ? {
            ...secret,
            db: this.functionsQuery,
            settings: this.dbConfig,
            http: axios,
          }
        : null
    );
    return `Process started`;
  };

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
  getSecrets = async (search?: string): Promise<any> => {
    const query = search
      ? `SELECT * FROM SECRET WHERE NAME ILIKE %${search}% OR DESCRIPTION ILIKE %${search}%`
      : "SELECT * FROM SECRET";
    const results = await this.query(query);
    return results.rows;
  };
  deleteProcesses = async (
    id: number
  ): Promise<{ message: string; success: boolean }> => {
    try {
      const query = `DELETE FROM PROCESS WHERE ID= ${id};`;
      const res = await this.query(query);
      return {
        success: res.rowCount === 1,
        message:
          res.rowCount === 1
            ? "Function deleted successfully"
            : "Function not found",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  runCron = () => {
    console.log("HERE CRON");
    this.electronService.scheduler.schedule("* * * * *", () => {
      console.log("running a task every minute");
    });
  };

  execQuery(query: string, data: unknown[], success: Success, errorf: ErrorOf) {
    if (this.dbConnected) {
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
    if (this.dbConnected) {
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

  createFunction = async (data: FxRequest): Promise<any> => {
    const bufferArray = await data.file.arrayBuffer();
    const fileData = Buffer.from(bufferArray).toString();
    const query = `INSERT INTO PROCESS (CODE, NAME, DESCRIPTION, FREQUENCY) VALUES($1, $2, $3, $4);`;
    await this.query(query, [
      fileData.split("'").join('"'),
      data.name,
      data.description,
      data.frequency,
    ]);
    return data;
  };
  updateFunction = async (
    data: FxPayload
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await this.updateFx(data);
      return {
        success: updated.rowCount === 1,
        message: "Updated successfully",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  private updateFx = async (data: FxPayload) => {
    const id = data.id;
    if (data.file) {
      const bufferArray = await data.file.arrayBuffer();
      data.code = Buffer.from(bufferArray).toString().split("'").join('"');
    }
    delete data.file;
    delete data.count;
    delete data.id;
    const query = `UPDATE PROCESS SET ${Object.keys(data)
      .map((key) => key + "=" + `'${data[key]}'`)
      .join(",")} WHERE ID=${id};`;
    return await this.query(query, []);
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
    const t = `INSERT INTO ORDERS(${Object.keys(data).join(
      ","
    )}) VALUES(${Object.keys(data)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    if (this.dbConnected) {
      this.query(t, Object.values(data), success, errorf);
    }

    this.electronService
      .execSqliteQuery(t, Object.values(data))
      .then((results: any) => {
        success(results);
      });
  }

  fetchLastOrders(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void,
    summary: boolean
  ) {
    const t = "SELECT * FROM orders ORDER BY added_on";
    if (this.dbConnected) {
      this.query(t, null, success, errorf, summary);
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
      "SELECT MAX(lims_sync_date_time) as lastLimsSync, MAX(added_on) as lastResultReceived FROM orders";

    if (this.dbConnected) {
      this.query(t, null, success, errorf);
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
    if (this.dbConnected) {
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
    const t = `INSERT INTO RAW_DATA(${Object.keys(data).join(
      ","
    )}) VALUES(${Object.keys(data)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;

    if (this.dbConnected) {
      this.execQuery(t, Object.values(data), success, errorf);
    } else {
      this.electronService
        .execSqliteQuery(t, Object.values(data))
        .then((results: any) => {
          success(results);
        });
    }
  }

  addApplicationLog(
    data: { [s: string]: unknown } | ArrayLike<unknown>,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = `INSERT INTO APP_LOG(${Object.keys(data).join(
      ","
    )}) VALUES(${Object.keys(data)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    if (this.dbConnected) {
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
    if (this.dbConnected) {
      this.query(t, null, success, errorf);
    }
    // Fetching from SQLITE
    this.electronService.execSqliteQuery(t, null).then((results: any) => {
      success(results);
    });
  }
}
