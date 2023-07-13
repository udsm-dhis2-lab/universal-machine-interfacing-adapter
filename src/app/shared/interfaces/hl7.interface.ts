// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export interface Hl7Interface {
  MSH: Msh;
  PID: PID;
  PV1: Pv1;
  OBR: Obr;
  OBX: Obx[];
}

export interface Msh {
  "Field Separator": string;
  "Encoding Characters": string;
  "Sending Application": string;
  "Sending Facility": string;
  "Receiving Application": string;
  "Receiving Facility": string;
  "Date/Time of Message": Date;
  Security: string;
  "Message Type": string;
  "Message Control ID": string;
  "Processing ID": string;
  "Version ID": string;
  "Sequence Number": string;
  "Continuation Pointer": string;
  "Accept Acknowledgment Type": string;
  "Application Acknowledgment Type": string;
  "Country Code": string;
}

export interface Obr {
  "Set ID": string;
  "Placer Order Number": string;
  "Filler Order Number": string;
  "Universal Service Identifier": string;
  Priority: string;
  "Requested Date/Time": Date;
  "Observation Date/Time #": Date;
  "Observation End Date/Time #": string;
  "Collection Volume *": string;
  "Collector Identifier *": string;
  "Specimen Action Code *": string;
  "Danger Code": string;
  "Relevant Clinical Information": string;
  "Specimen Received Date/Time": string;
  "Specimen Source": string;
  "Ordering Provider": string;
  "Order Callback Phone Number": string;
  "Placer Field 1": string;
  "Placer Field 2": string;
  "Filler Field 1 +": string;
  "Filler Field 2 +": string;
  "Results Rpt/Status Chng": string;
  "Charge to Practice +": string;
  "Diagnostic Serv Sect ID": string;
  "Result Status +": string;
  "Parent Result +": string;
  "Quantity/Timing": string;
  "Result Copies To": string;
  Parent: string;
  "Transportation Mode": string;
  "Reason for Study": string;
  "Principal Result Interpreter +": string;
}

export interface Obx {
  "Set ID": string;
  "Value Type": ValueType;
  "Observation Identifier": string;
  "Observation Sub": string;
  "Observation Value": string;
  Units: string;
  "References Range": string;
  "Abnormal Flags": AbnormalFlags;
  Probability: string;
  "Nature of Abnormal Test": string;
  "Observation Result Status": string;
}

export enum AbnormalFlags {
  Empty = "",
  N = "~N",
}

export enum ValueType {
  Is = "IS",
  Nm = "NM",
}

export interface PID {
  "Set ID": string;
  "Patient ID": string;
  "Patient Identifier List": string;
  "Alternate Patient ID": string;
  "Patient Name": string;
  "Mother's Maiden Name": string;
  "Date/Time of Birth": string;
  "Administrative Sex": string;
}

export interface Pv1 {
  "Set ID": string;
  "Patient Class": string;
  "Assigned Patient Location": string;
}
