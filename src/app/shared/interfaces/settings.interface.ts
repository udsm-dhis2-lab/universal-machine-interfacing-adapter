// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

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
