export interface Field {
  name: string;
  tableID: number;
  columnID: number;
  dataTypeID: number;
  dataTypeSize: number;
  dataTypeModifier: number;
  format: string;
}

export interface ArrayParser {}

export interface Builtins {
  BOOL: number;
  BYTEA: number;
  CHAR: number;
  INT8: number;
  INT2: number;
  INT4: number;
  REGPROC: number;
  TEXT: number;
  OID: number;
  TID: number;
  XID: number;
  CID: number;
  JSON: number;
  XML: number;
  PG_NODE_TREE: number;
  SMGR: number;
  PATH: number;
  POLYGON: number;
  CIDR: number;
  FLOAT4: number;
  FLOAT8: number;
  ABSTIME: number;
  RELTIME: number;
  TINTERVAL: number;
  CIRCLE: number;
  MACADDR8: number;
  MONEY: number;
  MACADDR: number;
  INET: number;
  ACLITEM: number;
  BPCHAR: number;
  VARCHAR: number;
  DATE: number;
  TIME: number;
  TIMESTAMP: number;
  TIMESTAMPTZ: number;
  INTERVAL: number;
  TIMETZ: number;
  BIT: number;
  VARBIT: number;
  NUMERIC: number;
  REFCURSOR: number;
  REGPROCEDURE: number;
  REGOPER: number;
  REGOPERATOR: number;
  REGCLASS: number;
  REGTYPE: number;
  UUID: number;
  TXID_SNAPSHOT: number;
  PG_LSN: number;
  PG_NDISTINCT: number;
  PG_DEPENDENCIES: number;
  TSVECTOR: number;
  TSQUERY: number;
  GTSVECTOR: number;
  REGCONFIG: number;
  REGDICTIONARY: number;
  JSONB: number;
  REGNAMESPACE: number;
  REGROLE: number;
}

export interface Types2 {
  arrayParser: ArrayParser;
  builtins: Builtins;
}

export interface Text {}

export interface Binary {}

export interface Types {
  _types: Types2;
  text: Text;
  binary: Binary;
}

export interface DatabaseResponse {
  command: string;
  rowCount: number;
  oid?: any;
  rows: any[];
  fields: Field[];
  _parsers: any[];
  _types: Types;
  RowCtor?: any;
  rowAsArray: boolean;
}

export interface Success {
  (res: any): void;
  (res: any): void;
  (res: any): void;
  (res: any): void;
  (res: any): void;
  (arg0: any): void;
}

export interface ErrorOf {
  (err: any): void;
  (err: any): void;
  (err: any): void;
  (err: any): void;
  (err: any): void;
  (arg0: { error: string }): void;
}

export interface SettingsDB {
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}
