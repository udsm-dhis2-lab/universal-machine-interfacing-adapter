import { UbuDate } from "./ubu-date";
const crypto = require("crypto");
import { Buffer } from "buffer";
export default class HLSevenMsg {
  public vt: any;
  public cr: any;
  public fs: any;
  public hexSymbolTable: any;
  public asciiSymbolTable: any;

  constructor() {
    // this.vt = Buffer.from("0B", "HEX");
    this.vt = Buffer.from("0B");
    this.cr = Buffer.from("0D");
    this.fs = Buffer.from("1C");
    this.hexSymbolTable = {
      "00": "NULL",
      "01": "SOH",
      "02": "STX",
      "03": "ETX",
      "04": "EOT",
      "05": "ENQ",
      "06": "ACK",
      "07": "BEL",
      "08": "BS",
      "09": "TAB",
      "0A": "LF",
      "0B": "VT",
      "0C": "FF",
      "0D": "CR",
      "0E": "SO",
      "0F": "SI",
      10: "DLE",
      11: "DC1",
      12: "DC2",
      13: "DC3",
      14: "DC4",
      15: "NAK",
      16: "SYN",
      17: "ETB",
      18: "CAN",
      19: "EM",
      "1A": "SUB",
      "1B": "ESC",
      "1C": "FS",
      "1D": "GS",
      "1E": "RS",
      "1F": "US",
      20: " ",
      21: "!",
      22: '"',
      23: "#",
      24: "$",
      25: "%",
      26: "&",
      27: "'",
      28: "(",
      29: ")",
      "2A": "*",
      "2B": "+",
      "2C": ",",
      "2D": "-",
      "2E": ".",
      "2F": "/",
      30: "0",
      31: "1",
      32: "2",
      33: "3",
      34: "4",
      35: "5",
      36: "6",
      37: "7",
      38: "8",
      39: "9",
      "3A": ":",
      "3B": ";",
      "3C": "<",
      "3D": "=",
      "3E": ">",
      "3F": "?",
      40: "@",
      41: "A",
      42: "B",
      43: "C",
      44: "D",
      45: "E",
      46: "F",
      47: "G",
      48: "H",
      49: "I",
      "4A": "J",
      "4B": "K",
      "4C": "L",
      "4D": "M",
      "4E": "N",
      "4F": "O",
      50: "P",
      51: "Q",
      52: "R",
      53: "S",
      54: "T",
      55: "U",
      56: "V",
      57: "W",
      58: "X",
      59: "Y",
      "5A": "Z",
      "5B": "[",
      "5C": "]",
      "5D": "\\",
      "5E": "^",
      "5F": "_",
      60: "`",
      61: "a",
      62: "b",
      63: "c",
      64: "d",
      65: "e",
      66: "f",
      67: "g",
      68: "h",
      69: "i",
      "6A": "j",
      "6B": "k",
      "6C": "l",
      "6D": "m",
      "6E": "n",
      "6F": "o",
      70: "p",
      71: "q",
      72: "r",
      73: "s",
      74: "t",
      75: "u",
      76: "v",
      77: "w",
      78: "x",
      79: "y",
      "7A": "z",
      "7B": "{",
      "7C": "|",
      "7D": "}",
      "7E": "~",
      "7F": "DEL",
    };

    this.asciiSymbolTable = {
      "00": "NULL",
      "01": "SOH",
      "02": "STX",
      "03": "ETX",
      "04": "EOT",
      "05": "ENQ",
      "06": "ACK",
      "07": "BEL",
      "08": "BS",
      "09": "TAB",
      10: "LF",
      11: "VT",
      12: "FF",
      13: "CR",
      14: "SO",
      15: "SI",
      16: "DLE",
      17: "DC1",
      18: "DC2",
      19: "DC3",
      20: "DC4",
      21: "NAK",
      22: "SYN",
      23: "ETB",
      24: "CAN",
      25: "EM",
      26: "SUB",
      27: "ESC",
      28: "FS",
      29: "GS",
      30: "RS",
      31: "US",
      32: " ",
      33: "!",
      34: '"',
      35: "#",
      36: "$",
      37: "%",
      38: "&",
      39: "'",
      40: "(",
      41: ")",
      42: "*",
      43: "+",
      44: ",",
      45: "-",
      46: ".",
      47: "/",
      48: "0",
      49: "1",
      50: "2",
      51: "3",
      52: "4",
      53: "5",
      54: "6",
      55: "7",
      56: "8",
      57: "9",
      58: ":",
      59: ";",
      60: "<",
      61: "=",
      62: ">",
      63: "?",
      64: "@",
      65: "A",
      66: "B",
      67: "C",
      68: "D",
      69: "E",
      70: "F",
      71: "G",
      72: "H",
      73: "I",
      74: "J",
      75: "K",
      76: "L",
      77: "M",
      78: "N",
      79: "O",
      80: "P",
      81: "Q",
      82: "R",
      83: "S",
      84: "T",
      85: "U",
      86: "V",
      87: "W",
      88: "X",
      89: "Y",
      90: "Z",
      91: "[",
      92: "]",
      93: "\\",
      94: "^",
      95: "_",
      96: "`",
      97: "a",
      98: "b",
      99: "c",
      100: "d",
      101: "e",
      102: "f",
      103: "g",
      104: "h",
      105: "i",
      106: "j",
      107: "k",
      108: "l",
      109: "m",
      110: "n",
      111: "o",
      112: "p",
      113: "q",
      114: "r",
      115: "s",
      116: "t",
      117: "u",
      118: "v",
      119: "w",
      120: "x",
      121: "y",
      122: "z",
      123: "{",
      124: "|",
      125: "}",
      126: "~",
      127: "DEL",
    };
  }

  hl7arch(
    receiver,
    eventName,
    messageID,
    ackStatus,
    senderFacility = "",
    receiverFacility = ""
  ) {
    let ack = "";
    //"-"+UbuDate.timeStamp()+
    let tm = UbuDate.timeStamp();
    //let ms="MSH|^~\&|LIS|"+senderFacility+"|"+receiver+"|"+receiverFacility+"|"+UbuDate.rawDateTime()+"||"+eventName+"|"+tm+tm+"|P|2.5.1||||||UNICODE UTF-8";
    let ms =
      "MSH|^~&|" +
      receiver +
      "|" +
      receiverFacility +
      "||" +
      senderFacility +
      "|" +
      UbuDate.rawDateTime() +
      "||" +
      eventName +
      "|" +
      this.uuidv4() +
      "|P|2.5.1||||||UNICODE UTF-8";

    let tt = 'SFT|ADD|9.2|LIS|""';
    let ma = "MSA|" + ackStatus + "|" + messageID;
    let msh = Buffer.from(ms, "utf8"); //.toString("HEX");
    // msh+="||ASCII";
    let msa = Buffer.from(ma, "utf8"); //.toString("HEX");

    let sft = Buffer.from(tt, "utf8"); //.toString("HEX");

    let f = [
      this.vt,
      Buffer.from(msh),
      this.cr,
      Buffer.from(msa),
      this.cr,
      this.fs,
      this.cr,
    ];
    if (eventName.indexOf("N02") != -1) {
      f = [
        this.vt,
        Buffer.from(msh),
        this.cr,
        Buffer.from(msa),
        this.cr,
        this.fs,
        this.cr,
      ];
    }
    let p = Buffer.concat(f);
    //  let p=Buffer.from(f,"ASCII").toString("HEX");
    // let p=Buffer.from(f,"ASCII");
    console.log(p.toString("utf8"));
    //console.log(Buffer.from(f,"ASCII"));
    return p;
  }
  hl7ACk(receiver, eventName, messageID, ackStatus) {
    let ack = "";
    //"-"+UbuDate.timeStamp()+
    let tm = UbuDate.timeStamp();
    let ms =
      "MSH|^~&|LIS||" +
      receiver +
      "||" +
      UbuDate.rawDateTime() +
      "||" +
      eventName +
      "|" +
      tm +
      tm +
      "|P|2.5.1||||||UNICODE UTF-8";
    let ma = "MSA|" + ackStatus + "|" + messageID;
    let msh = Buffer.from(ms, "utf8").toString();
    // msh+="||ASCII";
    let msa = Buffer.from(ma, "utf8").toString();

    let f = [
      this.vt,
      Buffer.from(msh),
      this.cr,
      Buffer.from(msa),
      this.cr,
      this.fs,
      this.cr,
    ];
    let p = Buffer.concat(f);
    //  let p=Buffer.from(f,"ASCII").toString("HEX");
    // let p=Buffer.from(f,"ASCII");
    return p;
  }

  hl7ProcessResultMult(result) {
    let obj = [];
    let h = "";

    let resultData = {};

    if (result) {
      let ob = result.split("OBR|");
      let hPart = result.split("CRSPM");

      for (let i = 0; i < hPart.length; i++) {
        let parts = {};
        if (i == 0) {
          //header
          h = ob[i].split("|");
        } else {
          let y = hPart[i].split("CR");
          let obr = [];
          let obx = [];
          let spm = {};
          for (let j = 0; j < y.length; j++) {
            if (j == 0) {
              //  spm.push();
              spm = this.hl7SPM(y[j].split("|"));
            }
            if (y[j].indexOf("OBR") != -1)
              obr.push(this.hl7OBR(y[j].split("|")));
            if (y[j].indexOf("OBX") != -1)
              obx.push(this.hl7OBX(y[j].split("|")));
          }
          parts["spm"] = spm;
          parts["obr"] = obr;
          parts["obx"] = obx;
          obj.push(parts);
        }
      }
    }

    let msgType = "";
    let msgID = h[9] ? h[9] : 0;
    resultData["msgID"] = msgID;
    let results = [];

    for (let k = 0; k < obj.length; k++) {
      let obxi = obj[k].obx;
      let spmi = obj[k].spm;
      let result = {};
      for (let m = 0; m < obxi.length; m++) {
        let o = obxi[m];

        if (o.obResultStatus == "F" || o.obResultStatus == "X") {
          switch (o.obSubID) {
            case "1/2":
              if (o.obValue != "") {
                result["intResult"] = o.obValue;
                result["intUnit"] = o.unitIdentifier;
              }

              break;
            case "1/1":
              if (o.obValue != "") {
                result["overResult"] = o.obValue;
                result["overUnit"] = o.unitIdentifier;
              }

              break;
            case "":
              let obRes = o.obValue;
              let uniti = "";
              let uni = o.unitIdentifier ? o.unitIdentifier.split(".") : [];
              if (uni[1]) {
                let un = uni[1].split("^");
                uniti = un[0];
              }
              if (uni[0] && uni[0] != "" && parseInt(obRes) > 0) {
                let u = uni[0].split("*");
                let ex = 1;
                let b = 1;
                if (u[1]) ex = parseInt(u[1]);
                if (u[0]) b = parseInt(u[0]);

                obRes = obRes * ex;
              }
              result["channelResult"] = obRes;
              result["channelUnitFull"] = o.unitIdentifier;

              result["channelUnit"] = uniti;
              break;
          }
          result["results"] = o.obValue;
          if (o.obValue.toLowerCase() == "invalid") {
            //force to override invalid results to failed
            result["results"] = "Failed";
            //all invalid results from cobas6800/8800 is set to failed
          }

          result["operator"] = o.resObserver;
          result["unit"] = o.unitIdentifier;
          result["sampleID"] = spmi.sampleID;
          result["test"] = o.test;
          result["rotNo"] = "";

          result["orderDate"] = UbuDate.formatRawDate(o.analysisDateTime);
          result["timestamp"] = result["orderDate"];
          //result.uploadDate=o.
        }
      }
      if (result["results"]) {
        if (parseInt(result["channelResult"]) > 0) {
          let rest = parseFloat(result["channelResult"]);
          if (rest) Math.round(rest);
          result["results"] = rest;
          result["unit"] = "copies/mL"; //result.channelUnit; //we need to encode varies unit
        } else {
          let iRes = result["intResult"];
          let fRes = result["intResult"];
          //interprete titer min/max results to its required results
          if (iRes && iRes.toLowerCase().indexOf("titer") != -1) {
            if (
              iRes &&
              (iRes.toLowerCase().indexOf("min") != -1 ||
                iRes.toLowerCase().indexOf("<") != -1)
            )
              fRes = "<20";
            if (
              iRes &&
              (iRes.toLowerCase().indexOf("max") != -1 ||
                iRes.toLowerCase().indexOf(">") != -1)
            )
              fRes = ">10000000";
          } //result="<20";
          result["results"] = fRes;
        }
        results.push(result);
      }
    }

    if (h[8]) {
      let n = h[8].split("^");
      if (n[1]) msgType = n[1];
      resultData["msgType"] = msgType;
    }
    return {
      msh: this.hl7MSH(h),
      msgType: msgType,
      msgID: msgID,
      data: obj,
      result: results,
    };
  }

  //single or one by one results
  hl7ProcessResultSingle(result) {
    let obj = [];
    let h = "";

    let resultData = {};

    if (result) {
      let ob = result.split("SPM|");
      let hPart = result.split("CRSPM");

      for (let i = 0; i < hPart.length; i++) {
        let parts = {};
        if (i == 0) {
          //header
          h = ob[i].split("|");
        } else {
          let y = hPart[i].split("CR");
          let obr = {};
          let obx = [];
          let spm = {};
          for (let j = 0; j < y.length; j++) {
            if (j == 0) {
              //  spm.push();
              spm = this.hl7SPM(y[j].split("|"));
            }
            if (y[j].indexOf("OBR") != -1) obr = this.hl7OBR(y[j].split("|"));
            if (y[j].indexOf("OBX") != -1)
              obx.push(this.hl7OBX(y[j].split("|")));
          }
          parts["spm"] = spm;
          parts["obr"] = obr;
          parts["obx"] = obx;
          obj.push(parts);
        }
      }
    }

    let msgType = "";
    let msgID = h[9] ? h[9] : 0;
    resultData["msgID"] = msgID;
    let results = [];

    for (let k = 0; k < obj.length; k++) {
      let obxi = obj[k].obx;
      let spmi = obj[k].spm;
      let result = {};
      for (let m = 0; m < obxi.length; m++) {
        let o = obxi[m];

        if (o.obResultStatus == "F" || o.obResultStatus == "X") {
          switch (o.obSubID) {
            case "1/2":
              if (o.obValue != "") {
                result["intResult"] = o.obValue;
                result["intUnit"] = o.unitIdentifier;
              }

              break;
            case "1/1":
              if (o.obValue != "") {
                result["overResult"] = o.obValue;
                result["overUnit"] = o.unitIdentifier;
              }

              break;
            case "":
              let obRes = o.obValue;
              let uniti = "";
              let uni = o.unitIdentifier ? o.unitIdentifier.split(".") : [];
              if (uni[1]) {
                let un = uni[1].split("^");
                uniti = un[0];
              }
              if (uni[0] && uni[0] != "" && parseInt(obRes) > 0) {
                let u = uni[0].split("*");
                let ex = 1;
                let b = 1;
                if (u[1]) ex = parseInt(u[1]);
                if (u[0]) b = parseInt(u[0]);

                obRes = obRes * ex;
              }
              result["channelResult"] = obRes;
              result["channelUnitFull"] = o.unitIdentifier;

              result["channelUnit"] = uniti;
              break;
          }
          result["results"] = o.obValue;
          if (o.obValue.toLowerCase() == "invalid") {
            //force to override invalid results to failed
            result["results"] = "Failed";
            //all invalid results from cobas6800/8800 is set to failed
          }

          result["operator"] = o.resObserver;
          result["unit"] = o.unitIdentifier;
          result["sampleID"] = spmi.sampleID;
          result["test"] = o.test;
          result["rotNo"] = "";

          result["orderDate"] = UbuDate.formatRawDate(o.analysisDateTime);
          result["timestamp"] = (result as any)?.orderDate;
          //result.uploadDate=o.
        }
      }
      if (result["results"]) {
        if (parseInt(result["channelResult"]) > 0) {
          let rest = parseFloat(result["channelResult"]);
          if (rest) Math.round(rest);
          result["results"] = rest;
          result["unit"] = "copies/mL"; //result.channelUnit; //we need to encode varies unit
        } else {
          let iRes = result["intResult"];
          let fRes = result["intResult"];
          //interprete titer min/max results to its required results
          if (iRes && iRes.toLowerCase().indexOf("titer") != -1) {
            if (
              iRes &&
              (iRes.toLowerCase().indexOf("min") != -1 ||
                iRes.toLowerCase().indexOf("<") != -1)
            )
              fRes = "<20";
            if (
              iRes &&
              (iRes.toLowerCase().indexOf("max") != -1 ||
                iRes.toLowerCase().indexOf(">") != -1)
            )
              fRes = ">10000000";
          } //result="<20";
          result["results"] = fRes;
        }
        results.push(result);
      }
    }

    if (h[8]) {
      let n = h[8].split("^");
      if (n[1]) msgType = n[1];
      resultData["msgType"] = msgType;
    }
    var mergeData = {};
    if (obj[0]) {
      mergeData = Object.assign({}, this.hl7MSH(h), obj[0].spm, obj[0].obr);
      mergeData["resultData"] = obj[0].obx;
    }

    return {
      msh: this.hl7MSH(h),
      msgType: msgType,
      msgID: msgID,
      data: obj,
      result: results,
      lisData: [mergeData],
    };
  }

  hl7MSH(data) {
    let res = {};
    res["fieldSeparator"] = data[0];
    res["dataEncoding"] = data[1];
    res["senderName"] = data[2];
    res["sender"] = data[2];
    res["senderFacility"] = data[3];
    res["receiver"] = data[4];
    res["receiverFacility"] = data[5];
    res["messageDateTime"] = data[6];
    res["msgDateTime"] = data[6];
    let mT = data[8].split("^");
    res["msgType"] = mT[0];
    res["eventType"] = mT[1];
    res["msgStructure"] = mT[2];
    res["msgControlID"] = data[9];
    res["processingID"] = data[10];
    res["versionID"] = data[11];
    res["charset"] = data[17];
    let mP = data[20] ? data[20].split("^") : [];
    res["msgProfileID1"] = mP[0];
    res["msgControlID2"] = mP[1];
    return res;
  }

  hl7SPM(data) {
    let res = {};
    res["sampleID"] = data[2];
    let sT = data[4] ? data[4].split("^") : [];
    res["sampleIdentifier"] = sT[0];
    res["sampleText"] = sT[1];
    res["sampleName"] = sT[2];
    res["sampleRole"] = data[11];
    return res;
  }

  hl7OBR(data) {
    let res = {};
    res["setID"] = data[1];
    res["placeOrderID"] = data[2];
    let uT = data[4] ? data[4].split("^") : [];

    if (uT[0]) {
      var etu = uT[0].split("&");
      res["assayNumber"] = etu[0] ? etu[0] : "";
      res["sampleDilution"] = etu[1] ? etu[1] : "";
    }
    res["assayName"] = uT[1];
    res["codingSystem"] = uT[2];
    res["sampleActionCode"] = data[11];
    return res;
  }

  hl7OBX(data) {
    console.log(data);
    let res = {};
    res["obxSetID"] = data[1];
    res["valueType"] = data[2];
    let uT = data[3] ? data[3].split("^") : [];
    //let uT=(data[4])?data[4].split("^"):[];

    if (uT[0]) {
      var etu = uT[0].split("&");
      res["assayNumber"] = etu[0] ? etu[0] : "";
      res["sampleDilution"] = etu[1] ? etu[1] : "";
      res["resultType"] = etu[2] ? etu[2] : "";
    }
    res["identifier"] = uT[0];
    res["assayName"] = uT[1];
    res["result"] = data[5];

    res["codingSystem"] = uT[2];
    res["obSubID"] = data[4];
    res["obValue"] = data[5];
    let un = data[6] ? data[6].split("^") : [];
    res["unitIdentifier"] = un[0];
    res["unit"] = un[0];
    res["unitCodingSystem"] = un[2];
    res["interpretationCode"] = data[8];
    res["obResultStatus"] = data[11];
    res["resultStatus"] = data[11];
    res["resObserver"] = data[16];
    if (data[16]) {
      var usrt = data[16].split("~");
      res["testedBy"] = usrt[0] ? usrt[0] : "";
      res["releasedBy"] = usrt[1] ? usrt[0] : "";
    }
    let eq = data[18] ? data[18].split("~") : [];
    let eqF = eq[0] ? eq[0].split("^") : [];
    let eqS = eq[1] ? eq[1].split("^") : [];
    let eqT = eq[2] ? eq[2].split("^") : [];
    res["equipModelName"] = eqF[0];
    res["equipManufacturer"] = eqF[1];
    res["equipSerialID"] = eqS[0];
    res["equipManufacturer1"] = eqS[1];
    res["clusterID"] = eqT[0];
    res["instrumentID"] = eqT[1] ? eqT[1] : "";
    res["analysisDateTime"] = data[19];
    let bCo = data[28] ? data[28].split("^") : [];
    res["controlIdentifier"] = bCo[0];
    res["controlCodeSystem"] = bCo[2];

    return res;
  }

  hexConvertor(data) {
    var buf = Buffer.from(data, "hex");
    var l = Buffer.byteLength(buf, "hex");
    var msgArray = [];
    for (var i = 0; i < l; i++) {
      var char = buf.toString("hex", i, i + 1);
      msgArray.push(char);
    }
    var message = this.hexToAscii(msgArray.join(""));
    return message;
  }

  hexToAscii(str) {
    var hexString = str;
    var strOut = "";
    for (var x = 0; x < hexString.length; x += 2) {
      //parseInt(hexString.substr(x, 2), 16)+"#$$#"; //
      let chaInt = parseInt(hexString.substr(x, 2), 16);
      if (chaInt != 127)
        //ignore all special characters
        strOut += this.ascii2Symbol(chaInt + ""); //String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
    }
    strOut = strOut.replace(/ETB.*CRLF/g, "");
    strOut = strOut.replace(/undefined0/g, "");
    strOut = strOut.replace(/undefined1/g, "");
    strOut = strOut.replace(/undefined2/g, "");
    strOut = strOut.replace(/undefined3/g, "");
    strOut = strOut.replace(/undefined4/g, "");
    strOut = strOut.replace(/undefined5/g, "");
    strOut = strOut.replace(/undefined6/g, "");
    strOut = strOut.replace(/undefined7/g, "");
    strOut = strOut.replace(/undefined8/g, "");
    strOut = strOut.replace(/undefined9/g, "");
    strOut = strOut.replace(/undefined/g, "");
    return strOut;
  }

  hex2Symbol(hex) {
    let t = this.hexSymbolTable;
    return t[hex] ? t[hex] : "undefined";
  }
  ascii2Symbol(ascii) {
    let t = this.asciiSymbolTable;
    return t[ascii]; //(t[ascii])?t[ascii]:"undefined";
  }

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    /*return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );*/
  }
}

export class HL7ParserFromChartGPT {
  private message: string;
  private segments: string[];
  private fields: string[][];
  private delimiters: {
    field: string;
    component: string;
    repetition: string;
    escape: string;
    subcomponent: string;
  };

  constructor(message: string) {
    this.message = message;
    this.segments = message.split("\r");
    this.delimiters = {
      field: "|",
      component: "^",
      repetition: "~",
      escape: "\\",
      subcomponent: "&",
    };

    this.fields = this.segments.map((segment) => {
      return segment.split(this.delimiters.field);
    });
  }

  public getSegment(segmentName: string): string[] | null {
    for (let i = 0; i < this.fields.length; i++) {
      if (this.fields[i][0] === segmentName) {
        return this.fields[i];
      }
    }
    return null;
  }

  public getField(segmentName: string, fieldIndex: number): string {
    const segment = this.getSegment(segmentName);
    if (!segment) {
      return "";
    }
    return segment[fieldIndex];
  }

  public getComponent(
    segmentName: string,
    fieldIndex: number,
    componentIndex: number
  ): string {
    const field = this.getField(segmentName, fieldIndex);
    if (!field) {
      return "";
    }
    const components = field.split(this.delimiters.component);
    return components[componentIndex];
  }

  public getSubcomponent(
    segmentName: string,
    fieldIndex: number,
    componentIndex: number,
    subcomponentIndex: number
  ): string {
    const component = this.getComponent(
      segmentName,
      fieldIndex,
      componentIndex
    );
    if (!component) {
      return "";
    }
    const subcomponents = component.split(this.delimiters.subcomponent);
    return subcomponents[subcomponentIndex];
  }

  getSampleParameterResults(): { [key: string]: string } {
    const results: { [key: string]: string } = {};
    const obxSegments = this.getSegment("OBX");
    for (const obxSegment of obxSegments) {
      const observationId = this.getField(obxSegment, 3);
      const observationValue = this.getField(obxSegment, 5);
      results[observationId] = observationValue;
    }
    return results;
  }
}
