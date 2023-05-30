export interface Settings {
  labID: string;
  labName: string;
  analyzerMachinePort: string;
  analyzerMachineName: string;
  analyzerMachineHost: string;
  interfaceConnectionMode: string;
  interfaceAutoConnect: string;
  interfaceCommunicationProtocol: string;
  authorizationCount?: number;
  hasExternalLogin?: boolean;
  externalLoginUrl?: string;
  functionId?: number;
  httpMethod?: string;
  authType?: string;
  systemName?: string;
  moduleName?: string;
  identifier?: string;
  externalLoginFunction?: number;
  id: number;
}
