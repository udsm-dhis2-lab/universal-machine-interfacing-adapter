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
        hasExternalDB: that.appSettings.hasExternalDB,
      };
    }

    if (that.appSettings.hasExternalDB) {
      this.query("SELECT * FROM current_catalog;")
        .then(() => {
          this.dbConnected = true;
        })
        .catch(() => {
          this.dbConnected = false;
        });
    }
  }

  private async query(
    query: string,
    params: unknown[] = [],
    success?: Success,
    errorf?: ErrorOf,
    summary?: boolean
  ): Promise<DatabaseResponse> {
    if (this.dbConfig.hasExternalDB) {
      return await this.fetchFromPostgres(
        query,
        params,
        success,
        errorf,
        summary
      );
    }
    let newParams = [];
    params?.forEach((param) => {
      if (typeof param === "object") {
        newParams = [...newParams, JSON.stringify(param)];
      } else {
        newParams = [...newParams, param];
      }
    });
    return await this.electronService.execSqliteQuery(query, newParams);
  }

  fetchFromSqlite = (
    query: string,
    params: any[],
    success?: Success,
    errorOf?: ErrorOf
  ) => {
    return new Promise((resolve, reject) => {
      this.electronService
        .execSqliteQuery(query, params)
        .then((res) => {
          if (success) {
            success(res);
          } else {
            resolve(res);
          }
        })
        .catch((err: any) => {
          console.log(err);
          if (errorOf) {
            errorOf(err);
          } else {
            reject(err);
          }
        });
    });
  };

  private fetchFromPostgres = (
    query: string,
    params: unknown[] = [],
    success?: Success,
    errorf?: ErrorOf,
    summary?: boolean
  ): Promise<DatabaseResponse> => {
    return new Promise((resolve, reject) => {
      new this.electronService.postgres({
        connectionString: `postgres://${this.dbConfig.user}:${
          this.dbConfig.password
        }@${this.dbConfig.host}:${this.dbConfig.port || 5432}/${
          this.dbConfig.database
        }`,
      })
        .query(query, params)
        .then((res: any) => {
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
  };

  private functionsQuery({ query, params = [], settings }): Promise<any[]> {
    return new Promise((resolve, reject) => {
      new Pool({
        connectionString: `postgres://${settings.user}:${settings.password}@${
          settings.host
        }:${settings.port || 5432}/${settings.database}`,
      })
        .query(query, params)
        .then((res: any) => {
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
    const secret = await this.getSecret(process);
    const runFunc = Function(
      "context",
      this.appSettings.hasExternalDB ? process?.rows[0]?.code : process[0].code
    );
    await runFunc({
      secret,
      db: this.functionsQuery,
      settings: this.dbConfig,
      http: axios,
    });
    return `Process started`;
  };

  private getSecret = async (process: any) => {
    const secret = this.appSettings.hasExternalDB
      ? process.rows[0]?.secret_id
      : process[0]?.secret_id;
    if (secret) {
      const secretData = await this.query(
        `SELECT * FROM SECRET WHERE ID=${secret}`
      );
      return this.appSettings.hasExternalDB
        ? secretData.rows[0].value
        : this.parseSecret(secretData[0].value);
    }
    return null;
  };

  private parseSecret = (value: string) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  };
  getProcesses = async (pager: PageDetails): Promise<any> => {
    const query = ` SELECT *, count(*) OVER() AS count FROM (SELECT * FROM PROCESS) AS PROCESS LIMIT ${
      pager.pageSize
    } OFFSET ${pager.page * pager.pageSize}`;
    const results = await this.query(query);
    return {
      data: Array.isArray(results) ? results : results.rows,
      count: Array.isArray(results)
        ? results.length
        : results.rows.length > 0
        ? results.rows[0].count
        : 0,
    };
  };
  getSecrets = async (search?: string): Promise<any> => {
    const query = search
      ? `SELECT * FROM SECRET WHERE NAME ILIKE %${search}% OR DESCRIPTION ILIKE %${search}%`
      : "SELECT * FROM SECRET";
    const results = await this.query(query);
    return Array.isArray(results) ? results : results.rows;
  };
  deleteProcesses = async (
    id: number
  ): Promise<{ message: string; success: boolean }> => {
    try {
      const query = `DELETE FROM PROCESS WHERE ID= ${id};`;
      const res = await this.query(query);
      return {
        success: Array.isArray(res) ? res.length === 0 : res.rowCount === 1,
        message: (Array.isArray(res) ? res.length === 0 : res.rowCount === 1)
          ? "Function deleted successfully"
          : "Function not found",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  runCron = () => {
    this.electronService.scheduler.schedule("* * * * *", () => {
      console.log(new Date().valueOf(), " running a task");
    });
  };

  execQuery(query: string, data: unknown[], success: Success, errorf: ErrorOf) {
    if (this.dbConnected) {
      console.log(query, data);
      this.query(query, data, success, errorf);
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
    delete data.file;
    const payload = { ...data, code: fileData.split("'").join('"') };
    const query = `INSERT INTO PROCESS(${Object.keys(payload).join(
      ","
    )}) VALUES(${Object.keys(payload)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;

    await this.query(query, Object.values(payload));
    return data;
  };
  updateFunction = async (
    data: FxPayload
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await this.updateFx(data);
      return {
        success: Array.isArray(updated)
          ? updated.length === 0
          : updated.rowCount === 1,
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
  updateOrder = async (data: any) => {
    const id = data.id;
    const query = `UPDATE ORDERS SET ${Object.keys(data)
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
