export interface Settings {
  labID: string;
  labName: string;
  analyzerMachinePort: string;
  analyzerMachineName: string;
  analyzerMachineHost: string;
  interfaceConnectionMode: string;
  interfaceAutoConnect: string;
  interfaceCommunicationProtocol: string;
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  hasExternalDB?: boolean;
  authorizationCount?: number;
  hasExternalLogin?: boolean;
  externalLoginUrl?: string;
  functionId?: number;
  httpMethod?: string;
  authType?: string;
  systemName?: string;
  moduleName?: string;
  identifier?: string;
}
