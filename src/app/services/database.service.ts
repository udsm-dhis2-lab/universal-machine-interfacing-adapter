import { Injectable } from "@angular/core";
import axios from "axios";
import * as fs from "fs";
import { Pool } from "pg";
import { ElectronService } from "../core/services";
import { MachineData } from "../shared/interfaces/data.interface";
import {
  DatabaseResponse,
  ErrorOf,
  OrderDataInterface,
  ResultInterface,
  Success,
} from "../shared/interfaces/db.interface";
import {
  FxPayload,
  FxRequest,
  PageDetails,
  SecretPayload,
} from "../shared/interfaces/fx.interface";
import { ElectronStoreService } from "./electron-store.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private mysqlPool = null;
  private dbConfig = null;
  public appSettings = null;
  private dbConnected: boolean;
  protected log = null;
  protected logtext = [];
  protected liveLogSubject = new BehaviorSubject([]);
  liveLog = this.liveLogSubject.asObservable();
  constructor(
    private electronService: ElectronService,
    private store: ElectronStoreService
  ) {
    const that = this;
    that.appSettings = that.store.get("appSettings");
    this.log = this.electronService.log;

    // Initialize DB connection pool only if settings are available
    if (
      that.appSettings?.dbHost != null &&
      that.appSettings?.dbHost != "" &&
      that.appSettings?.dbUser != null &&
      that.appSettings?.dbUser != "" &&
      that.appSettings?.dbName != null &&
      that.appSettings?.dbName != ""
    ) {
      this.dbConfig = {
        ...that.appSettings,
        connectionLimit: 1000,
        host: that.appSettings.dbHost,
        user: that.appSettings.dbUser,
        password: that.appSettings.dbPassword,
        database: that.appSettings.dbName,
        port: that.appSettings.dbPort,
        dateStrings: "date",
        hasExternalDB: that.appSettings?.hasExternalDB,
      };
    }

    if (that.appSettings?.hasExternalDB) {
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
    if (this.dbConfig?.hasExternalDB) {
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
    const result = await this.electronService.execSqliteQuery(query, newParams);
    return result;
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
    if (secret.id) {
      return await this.updateSecret(secret);
    }
    const query = `INSERT INTO SECRET(${Object.keys(secret).join(
      ","
    )}) VALUES(${Object.keys(secret)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    return await this.query(query, Object.values(secret));
  };

  updateSecret = async (secret: SecretPayload) => {
    const secretId = secret?.id;
    const query = `UPDATE SECRET SET ${Object.keys(secret)
      .map((key) => key + "=" + `'${secret[key]}'`)
      .join(",")} WHERE ID=${secretId} RETURNING *;`;
    return await this.query(query, []);
  };

  logger(logType: string, message: string) {
    const moment = require("moment");
    const date = moment(new Date()).format("DD-MMM-YYYY HH:mm:ss");

    let logMessage = "";

    this.log.transports.file.fileName = `${moment().format("YYYY-MM-DD")}.log`;

    if (logType === "info") {
      this.log.info(message);
      logMessage =
        '<span class="text-info">[info]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    } else if (logType === "error") {
      this.log.error(message);
      logMessage =
        '<span class="text-danger">[error]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    } else if (logType === "success") {
      this.log.info(message);
      logMessage =
        '<span class="text-success">[success]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    }

    return logMessage;
  }

  run = async (id: number, params?: any): Promise<any> => {
    try {
      const process = await this.query(`SELECT * FROM PROCESS WHERE ID=${id}`);
      const secret = await this.getSecret(process);
      const runFunc = Function(
        "context",
        this.appSettings?.hasExternalDB
          ? process?.rows[0]?.code
          : process[0].code
      );
      await this.query(`UPDATE PROCESS SET RUNNING=${true} WHERE ID=${id}`);
      const runResults = await runFunc({
        secret,
        db: this.functionsQuery,
        raw: this.processRawData,
        parseSecret: this.parseSecret,
        settings: this.dbConfig,
        liveLogSubject: this.liveLogSubject,
        liveLog: this.liveLog,
        logtext: this.logtext,
        http: axios,
        sqlite: this.electronService.sqlite,
        dbPath: this.store.get("appPath"),
        log: this.electronService.log,
        logger: this.logger,
        id,
        secret_id: this.appSettings?.hasExternalDB
          ? process?.rows[0]?.secret_id
          : process[0].secret_id,
        fs,
        externalParams: params,
      });
      await this.query(`UPDATE PROCESS SET RUNNING=${false} WHERE ID=${id}`);
      return runResults;
    } catch (e) {}
  };

  private getSecret = async (process: any) => {
    const secret = this.appSettings?.hasExternalDB
      ? process.rows[0]?.secret_id
      : process[0]?.secret_id;
    if (secret) {
      const secretData = await this.query(
        `SELECT * FROM SECRET WHERE ID=${secret}`
      );
      return this.appSettings?.hasExternalDB
        ? this.parseSecret(secretData.rows[0].value)
        : this.parseSecret(secretData[0].value);
    }
    return {};
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
      await this.getCron(id);
      const query = `DELETE FROM PROCESS WHERE ID= ${id};`;
      const res = await this.query(query);
      return {
        success: Array.isArray(res) ? res.length === 0 : res.rowCount === 1,
        message: "Function deleted successfully",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };
  deleteOrder = async (
    id: number
  ): Promise<{ message: string; success: boolean }> => {
    try {
      const query = `DELETE FROM ORDERS WHERE ID= ${id};`;
      const res = await this.query(query);
      return {
        success: Array.isArray(res) ? res.length === 0 : res.rowCount === 1,
        message: "Order deleted successfully",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };
  deleteSecret = async (
    value: number
  ): Promise<{ message: string; success: boolean }> => {
    try {
      const process = await this.customQuery({
        table: "PROCESS",
        column: "SECRET_ID",
        value,
      });
      if (process && Array.isArray(process) && process.length > 0) {
        return {
          success: false,
          message: "Secret can not be delete because it belongs to a function",
        };
      }
      const res = await this.query(`DELETE FROM SECRET WHERE ID=${value}`);
      return {
        success: Array.isArray(res) ? res.length === 0 : res.rowCount === 1,
        message: "Function deleted successfully",
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  private customQuery = async ({ column, value, table }) => {
    const query = `SELECT * FROM ${table} WHERE ${column}=${value}`;
    return await this.query(query);
  };

  private getCron = async (id: number) => {
    try {
      const process = await this.query(`SELECT * FROM PROCESS WHERE ID=${id}`);
      (Array.isArray(process) ? process.length === 0 : process.rowCount === 1)
        ? this.throwError("Function not found")
        : this.getAndStopCron(process);
    } catch (e) {
      throw new Error(e.message);
    }
  };

  private throwError = (error: string) => {
    throw new Error(error);
  };

  private getAndStopCron = (process: any) => {
    try {
      const schedule = this.electronService.scheduler.schedule(
        `${process.name}_${process.id}`
      );
    } catch (e) {}
  };

  execQuery(query: string, data: unknown[], success: Success, errorf: ErrorOf) {
    if (this.dbConnected) {
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
        success:
          typeof updated === "string"
            ? false
            : Array.isArray(updated)
            ? updated.length === 1
            : updated.rowCount === 1,
        message: typeof updated === "string" ? updated : "Updated successfully",
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
      .join(",")} WHERE ID=${id} RETURNING *;`;
    const process = await this.query(query, []);
    if (data.frequency) {
      await this.scheduleFunction(process, data);
    }
    return process;
  };

  scheduleFunction = async (data: any, orgData: FxPayload) => {
    try {
      const process: FxPayload =
        Array.isArray(data) && data.length === 1 ? data[0] : data.rows[0];
      const tasks = this.electronService.scheduler.getTasks();
      const task = tasks.get(`${orgData.name}_${process.id}`);
      await this.updateCron(process, task);
    } catch (e) {}
  };

  updateCron = async (process: FxPayload, schedule: any) => {
    const secret = await this.getSecret([process]);
    try {
      if (schedule) {
        schedule.stop();
        this.scheduleFx(process, secret);
      } else {
        this.scheduleFx(process, secret);
      }
    } catch (e) {}
  };

  scheduleFunctions = () => {
    const query = "SELECT * FROM PROCESS";
    this.query(query).then(async (res) => {
      if (Array.isArray(res)) {
        for (const fx of res) {
          const tasks = this.electronService.scheduler.getTasks();
          const task = tasks.get(`${fx.name}_${fx.id}`);
          await this.updateCron(fx, task);
        }
      }
    });
  };

  private logs = (message: string): void => {
    this.logtext.unshift(this.logger("info", message));
    this.liveLogSubject.next(this.logtext);
  };

  private scheduleFx = (process: FxPayload, secret: SecretPayload) => {
    this.electronService.scheduler.schedule(
      process.frequency,
      async () => {
        try {
          const time = new Date();
          this.logs(
            `⏱️ SCHEDULE RUNNING STARTED __** ${process?.name?.toUpperCase()} **__ ${time} ⏱️`
          );
          const runFunc = Function("context", process.code);
          await runFunc({
            secret,
            db: this.functionsQuery,
            raw: this.processRawData,
            settings: this.dbConfig,
            http: axios,
            log: this.electronService.log,
            sqlite: this.electronService.sqlite,
            dbPath: this.store.get("appPath"),
            logtext: this.logtext,
            liveLogSubject: this.liveLogSubject,
            id: process.id,
            logger: this.logger,
            secret_id: process?.secret_id,
            parseSecret: this.parseSecret,
            fs,
            externalParams: {},
          });
          const finishTime = new Date();
          this.logs(`✅ SCHEDULE RUNNING FINISHED ${finishTime} ✅`);
          this.logs(
            `⏳ TIME TAKEN TO RUN ${(
              (finishTime.valueOf() - time.valueOf()) /
              60000
            ).toFixed(4)} MINUTES ⏳`
          );
        } catch (e) {
          this.logs(`🚫 ERROR OCCURED  ${e.message.toUpperCase()} 🚫`);
        }
      },
      {
        name: `${process.name}_${process.id}`,
      }
    );
  };
  updateOrder = async (data: any) => {
    const id = data.id;
    const query = `UPDATE ORDERS SET ${Object.keys(data)
      .map((key) => key + "=" + `'${data[key]}'`)
      .join(",")} WHERE ID=${id};`;
    return await this.query(query, []);
  };

  addOrderTest = async (
    data: MachineData,
    success?: Success,
    errorf?: ErrorOf
  ) => {
    if (data.patient_id && data.patient_id !== "") {
      console.log('CHECKING EXISTING DATA', )
      await this.checkExistingOrder(data, success, errorf);
    }
    this.addNewTest(data, success, errorf);
  };

  fetchLastOrders(success: Success, errorOf: ErrorOf, summary: boolean) {
    const t = "SELECT * FROM orders ORDER BY id DESC";
    if (this.dbConnected) {
      this.query(t, null, success, errorOf, summary);
    } else {
      // Fetching from SQLITE
      this.electronService.execSqliteQuery(t, null).then((results: any) => {
        if (!results || typeof results === "string") {
          errorOf(results ? results : "");
        } else {
          success(results);
        }
      });
    }
  }

  private checkExistingOrder = async (
    data: MachineData,
    success: Success,
    errorOf: ErrorOf
  ) => {
    const sql = `SELECT patient_id FROM orders WHERE patient_id='${data.patient_id}' LIMIT 1`;
    const results = await this.electronService.execSqliteQuery (sql);
    console.log('RESULTS', JSON.stringify(results))
    if (Array.isArray(results) && results.length > 0) {
      this.updateOrderSqlite(data, success, errorOf, results[0].id);
    } else {
      this.addNewTest(data, success, errorOf);
    }
  };

  private updateOrderSqlite = (
    data: MachineData,
    success: Success,
    errorOf: ErrorOf,
    id: number
  ): void => {
    const sql = `UPDATE ORDERS SET ${Object.keys(data)
      .map((key) => key + "=" + `'${data[key]}'`)
      .join(",")} WHERE ID=${id};`;

    this.electronService
      .execSqliteQuery(sql, [])
      .then((results: any) => {
        success(results);
      })
      .catch((e: any) => errorOf(e));
  };

  private addNewTest = (
    data: MachineData,
    success: Success,
    errorOf: ErrorOf
  ) => {
    const t = `INSERT INTO ORDERS(${Object.keys(data).join(
      ","
    )}) VALUES(${Object.keys(data)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;

    const sql = `INSERT INTO ORDERS(${Object.keys(data).join(
      ","
    )}) VALUES(${Object.values(data)
      .map((d) => '"' + d + '"')
      .join(",")}) RETURNING *`;

    if (this.dbConnected) {
      this.query(t, Object.values(data), success, errorOf);
    }
    this.electronService
      .execSqliteQuery(sql, [])
      .then((results: any) => {
        success(results);
      })
      .catch((e: any) => errorOf(e));
  };

  getRawData(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const q = "SELECT * FROM raw_data limit 1";
    if (this.dbConnected) {
      this.query(q, null, success, errorf);
    } else {
      // Fetching from SQLITE
      this.electronService.execSqliteQuery(q, null).then((results: any) => {
        success(results);
      });
    }
  }

  fetchLastSyncTimes(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t =
      "SELECT MAX(lims_sync_date_time) as lastLimsSync, MAX(added_on) as lastResultReceived FROM orders ORDER BY added_on 'DESC'";

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
    data: MachineData,
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
    data: MachineData,
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
    const t = "SELECT * FROM app_log ORDER BY id DESC, id DESC LIMIT 500";
    if (this.dbConnected) {
      this.query(t, null, success, errorf);
    }
    // Fetching from SQLITE
    this.electronService.execSqliteQuery(t, null).then((results: any) => {
      success(results);
    });
  }

  setDefaultDatabaseData(): void {
    const privileges = [
      {
        id: 1,
        name: "DO_AUTHORIZE",
        description: "For authorization access",
      },
      {
        id: 2,
        name: "DO_FINAL_AUTHORIZATION",
        description: "For one who does final authorization",
      },
      {
        id: 3,
        name: "ADD_FUNCTION",
        description: "For add function access",
      },
      {
        id: 4,
        name: "ADD_SECRET",
        description: "For add secret access",
      },
      {
        id: 5,
        name: "ADD_SETTINGS",
        description: "For add settings access",
      },
      {
        id: 6,
        name: "ALL",
        description: "Full Access",
      },
    ];

    const roles = [
      {
        id: 1,
        name: "Initial Authorization",
        description: "Authorize",
      },
      {
        id: 2,
        name: "Final Authorization",
        description: "Authorize",
      },
      {
        id: 3,
        name: "Settings",
        description: "Settings",
      },
      {
        id: 4,
        name: "Superuser",
        description: "Has all accesses",
      },
    ];

    const rolesAndPriveleges = [
      {
        id: 1,
        role_id: 1,
        privilege_id: 1,
      },
      {
        id: 2,
        role_id: 3,
        privilege_id: 1,
      },
      {
        id: 3,
        role_id: 3,
        privilege_id: 2,
      },
      {
        id: 4,
        role_id: 3,
        privilege_id: 3,
      },
      {
        id: 5,
        role_id: 3,
        privilege_id: 4,
      },
      {
        id: 6,
        role_id: 3,
        privilege_id: 5,
      },
      {
        id: 7,
        role_id: 2,
        privilege_id: 2,
      },
      {
        id: 8,
        role_id: 4,
        privilege_id: 6,
      },
    ];

    const users = [
      {
        id: 1,
        username: "admin",
        password: "admin",
        firstname: "Admin",
        middlename: "",
        lastname: "Admin",
        title: "Admin",
      },
    ];

    const userAndRoles = [
      {
        id: 1,
        user_id: 1,
        role_id: 1,
      },
      {
        id: 2,
        user_id: 1,
        role_id: 2,
      },
      {
        id: 3,
        user_id: 1,
        role_id: 3,
      },
      {
        id: 4,
        user_id: 1,
        role_id: 4,
      },
    ];
    for (const privilege of privileges) {
      const t = `INSERT INTO privilege(${Object.keys(privilege).join(
        ","
      )}) VALUES(${Object.keys(privilege)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(privilege), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(privilege))
        .then((results: any) => {
          this.logs(results);
        });
    }

    for (const role of roles) {
      const t = `INSERT INTO role(${Object.keys(role).join(
        ","
      )}) VALUES(${Object.keys(role)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(role), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(role))
        .then((results: any) => {
          this.logs(results);
        });
    }

    for (const user of users) {
      const t = `INSERT INTO user(${Object.keys(user).join(
        ","
      )}) VALUES(${Object.keys(user)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(user), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(user))
        .then((results: any) => {
          this.logs(results);
        });
    }

    for (const roleAndPrivilege of rolesAndPriveleges) {
      const t = `INSERT INTO role_privilege(${Object.keys(
        roleAndPrivilege
      ).join(",")}) VALUES(${Object.keys(roleAndPrivilege)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(roleAndPrivilege), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(roleAndPrivilege))
        .then((results: any) => {
          this.logs(results);
        });
    }

    for (const userAndRole of userAndRoles) {
      const t = `INSERT INTO user_role(${Object.keys(userAndRole).join(
        ","
      )}) VALUES(${Object.keys(userAndRole)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(userAndRole), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(userAndRole))
        .then((results: any) => {
          this.logs(results);
        });
    }
  }

  getUserDetails(
    username: string,
    password: string,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const userQuery = `SELECT * FROM user LEFT JOIN user_role ON user.id =user_role.user_id LEFT JOIN role ON role.id = user_role.role_id WHERE username="${username}" AND password="${password}"`;
    if (this.dbConnected) {
      this.query(userQuery, null, success, errorf);
    }
    // Fetching from SQLITE
    this.electronService
      .execSqliteQuery(userQuery, null)
      .then((results: any) => {
        success(results);
      });
  }

  getPrivilegesByRolesDetails(
    roleIds: number[],
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const privilegeQuery = `SELECT DISTINCT * FROM privilege LEFT JOIN role_privilege ON role_privilege.privilege_id =privilege.id WHERE role_privilege.role_id IN (${roleIds.join(
      ","
    )})`;
    if (this.dbConnected) {
      this.query(privilegeQuery, null, success, errorf);
    }
    // Fetching from SQLITE
    this.electronService
      .execSqliteQuery(privilegeQuery, null)
      .then((results: any) => {
        success(results);
      });
  }

  setApprovalStatus(
    status: any,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = `INSERT INTO order_status(${Object.keys(status).join(
      ","
    )}) VALUES(${Object.keys(status)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    if (this.dbConnected) {
      this.execQuery(t, Object.values(status), null, null);
    }

    this.electronService
      .execSqliteQuery(t, Object.values(status))
      .then((results: any) => {
        success(results);
      });
  }

  getApprovalStatuses(
    order_id: number,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const query = `SELECT * FROM order_status WHERE order_id = ${order_id}`;
    if (this.dbConnected) {
      this.execQuery(query, null, success, errorf);
    }

    this.electronService.execSqliteQuery(query, []).then((results: any) => {
      success(results);
    });
  }

  getPrivileges(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const query = `SELECT * FROM privilege`;
    if (this.dbConnected) {
      this.execQuery(query, null, success, errorf);
    }

    this.electronService.execSqliteQuery(query, []).then((results: any) => {
      success(results);
    });
  }

  getRoles(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const query = `SELECT * FROM role`;
    if (this.dbConnected) {
      this.execQuery(query, null, success, errorf);
    }

    this.electronService.execSqliteQuery(query, []).then((results: any) => {
      success(results);
    });
  }

  getUsers(
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const query = `SELECT * FROM user`;
    if (this.dbConnected) {
      this.execQuery(query, null, success, errorf);
    }

    this.electronService.execSqliteQuery(query, []).then((results: any) => {
      success(results);
    });
  }

  addUser(
    user: any,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = `INSERT INTO user(${Object.keys(user).join(
      ","
    )}) VALUES(${Object.keys(user)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    if (this.dbConnected) {
      this.execQuery(t, Object.values(user), null, null);
    }

    this.electronService
      .execSqliteQuery(t, Object.values(user))
      .then((results: any) => {
        success(results);
      });
  }

  updateUser = async (user: any) => {
    const userId = user?.id;
    const query = `UPDATE user SET ${Object.keys(user)
      .map((key) => key + "=" + `'${user[key]}'`)
      .join(",")} WHERE ID=${userId} RETURNING *;`;
    return await this.query(query, []);
  };

  addRole(
    role: any,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const t = `INSERT INTO role(${Object.keys(role).join(
      ","
    )}) VALUES(${Object.keys(role)
      .map((key, index) => "$" + (index + 1))
      .join(",")}) RETURNING *`;
    if (this.dbConnected) {
      this.execQuery(t, Object.values(role), null, null);
    }

    this.electronService
      .execSqliteQuery(t, Object.values(role))
      .then((results: any) => {
        success(results);
      });
  }

  addUserRolesRelationship(
    roles: any[],
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    for (const role of roles) {
      const t = `INSERT INTO user_role(${Object.keys(role).join(
        ","
      )}) VALUES(${Object.keys(role)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(role), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(role))
        .then((results: any) => {
          success(results);
        });
    }
  }

  deleteUserRoleRelationship = async (userId: number) => {
    const query = `DELETE FROM user_role WHERE user_id= ${userId};`;
    const res = await this.query(query);
  };

  getUserAndRoleRelationship(
    user_id: number,
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    const query = `SELECT * FROM user_role WHERE user_id =${user_id}`;
    if (this.dbConnected) {
      this.execQuery(query, null, success, errorf);
    }

    this.electronService.execSqliteQuery(query, []).then((results: any) => {
      success(results);
    });
  }

  addRolesPrivilegeRelationship(
    rolePrivileges: any[],
    success: { (res: any): void; (arg0: any): void },
    errorf: (err: any) => void
  ) {
    for (const roleAndPrivilege of rolePrivileges) {
      const t = `INSERT INTO role_privilege(${Object.keys(
        roleAndPrivilege
      ).join(",")}) VALUES(${Object.keys(roleAndPrivilege)
        .map((key, index) => "$" + (index + 1))
        .join(",")}) RETURNING *`;
      if (this.dbConnected) {
        this.execQuery(t, Object.values(roleAndPrivilege), null, null);
      }

      this.electronService
        .execSqliteQuery(t, Object.values(roleAndPrivilege))
        .then((results: any) => {
          success(results);
        });
    }
  }

  private processRawData = (data: string) => {
    if (data) {
      let part1 = data?.split("H|\\");

      if (part1.length < 2) {
        part1 = data?.split("H|");
      }
      const outputData = [];
      for (let j = 1; j < part1.length; j++) {
        let orderData: OrderDataInterface = {} as any;
        const resultData = [];

        //order info
        let part3 = part1[j].split("O|1|");
        if (!part3[1]) part3 = part1[j].split("38|1|");

        const header = part3[0].split("|");
        if (header[3]) {
          const device = header[3].split("^");
          orderData.senderName = device[0];
          orderData.versionNumber = device[1];
          orderData.serialNumber = device[2];
        }
        orderData.processingID = header[10];
        orderData.versionLevelCSLSI = header[11];
        orderData.messageDateTime = header[12];

        if (part3[1]) {
          const order = part3[1].split("|");
          const samp = order[0].split("^");
          orderData.sampleID = samp[0];
          if (order[1]) {
            const orP = order[1].split("^");
            orderData.specimenID = orP[0];
            orderData.rackID = orP[1];
            orderData.position = orP[2];
            orderData.bayID = orP[3];
            orderData.RSMPosition = orP[4];
          }

          if (order[2]) {
            const orU = order[2].split("^");
            orderData.assayNumber = orU[3];
            orderData.assayName = orU[4];
            orderData.sampleDilution = orU[5];
          }
          orderData.priority = order[3];
          orderData.actionCode = order[9];
          orderData.reportType = order[23];
        }

        //result info
        for (let i = 1; i < 100; i++) {
          let result: ResultInterface = {} as any;
          const part5 = part1[j].split("R|" + i + "|");
          const part6 = part1[j].split("M|" + i + "|");

          //resultPart
          if (part5[1]) {
            const resl = part5[1].split("|");
            if (resl[0]) {
              const assy = resl[0].split("^");

              result.assayNumber = assy[3];
              result.assayName = assy[4];
              result.assayDilutionType = assy[5];
              result.resultType = assy[6];
              if (assy[10]) result.resultType = assy[10];
            }
            result.sequenceNumber = i;
            const presult = resl[1] ? resl[1] : "";
            result.result = presult;

            if (presult.toLowerCase() == "nonreactive") {
              result.interpreted = "Negative";
              result.interpretedAlias = "N";
            }
            if (presult.toLowerCase() == "reactive") {
              result.interpreted = "Positive";
              result.interpretedAlias = "P";
            }

            result.unit = resl[2] ? resl[2] : "";
            result.referenceRange = resl[3] ? resl[3] : "";
            result.abnormalFlag = resl[4] ? resl[4] : "";
            result.resultStatus = resl[6] ? resl[6] : "";
            if (resl[8]) {
              const user = resl[8].split("^");
              result.testedBy = user[0] ? user[0] : "";
              result.releasedBy = user[1] ? user[1] : "";
            }
            result.analysisDateTime = resl[10] ? resl[10] : "";
            if (resl[11]) {
              const instr = resl[11].split("^");
              result.instrumentSerial = instr[0];
              result.processPathID = instr[1];
              result.processLaneID = instr[2];
            }
          }

          //manufacture record
          if (part6[1]) {
            const resM = part6[1].split("|");
            result.mRecordType = resM[0];
            result.mSequence = i;
            result.mSubstanceIdentifier = resM[1];
            result.mSubstanceType = resM[2];
            result.mInventoryContainer = resM[3];
            result.mExpireDate = resM[4];
            result.mCalibrationDate = resM[5];
            result.mLotNumber = resM[6];
          }
          if (result.result || result.mRecordType) {
            resultData.push(result);
          }
        }
        orderData.resultData = resultData;
        outputData.push(orderData);
      }

      return outputData;
    } else {
      return [];
    }
  };
}
