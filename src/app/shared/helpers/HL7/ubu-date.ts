export class UbuDate {
  static timeStamp(dateTime = null) {
    let millis = new Date().valueOf();
    if (dateTime != null) millis = new Date(dateTime).valueOf();
    let unix = Math.floor(millis / 1000);
    return unix;
  }

  static time(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    let hh = h.toString(),
      mm = m.toString(),
      ss = s.toString();
    if (h < 10) hh = "0" + h;
    if (m < 10) mm = "0" + m;
    if (s < 10) {
      ss = "0" + s;
    }
    let time = hh + ":" + mm + ":" + ss;
    return time;
  }

  static watch(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    let hh = h.toString(),
      mm = m.toString(),
      ss = s.toString();
    if (h < 10) hh = "0" + h;
    if (m < 10) mm = "0" + m;
    if (s < 10) {
      ss = "0" + s;
    }
    let time = hh + ":" + mm;
    return time;
  }

  static dateHuman(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let mon = month.toString(),
      dai = day.toString();
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = dai + "/" + mon + "/" + d.getFullYear();

    return dat;
  }

  static timeDate(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let mon = month.toString(),
      dai = day.toString();
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = d.getFullYear() + "-" + mon + "-" + dai;
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    let hh = h.toString(),
      mm = m.toString(),
      ss = s.toString();
    if (h < 10) hh = "0" + h;
    if (m < 10) mm = "0" + m;
    if (s < 10) ss = "0" + s;
    var time = hh + ":" + mm + ":" + ss;
    return dat + " " + time;
  }

  static rawDateTime(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let mon = month.toString(),
      dai = day.toString();
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = d.getFullYear() + "" + mon + "" + dai;
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    let hh = h.toString(),
      mm = m.toString(),
      ss = s.toString();
    if (h < 10) hh = "0" + h;
    if (m < 10) mm = "0" + m;
    if (s < 10) ss = "0" + s;
    var time = hh + "" + mm + "";
    return dat + "" + time + "" + ss;
  }

  static date(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let mon = month.toString(),
      dai = day.toString();
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = d.getFullYear() + "-" + mon + "-" + dai;

    return dat;
  }
  static monthDate(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let mon = month.toString(),
      dai = day.toString();
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = d.getFullYear() + "-" + month;

    return dat;
  }

  static convertDotDate(date = null) {
    let goodDate = "";
    if (date != null) {
      let sp = date.split(".");
      goodDate = sp[2] + "-" + sp[1] + "-" + sp[0];
    }
    return goodDate;
  }

  static addDate(date = null, days = 0) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  static minusDate(date = null, days = 0) {
    let result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }
  static calculateDays(date = null, days = 0, operator = "-") {
    let givenMill = new Date().valueOf();
    if (date != null) givenMill = new Date(date).valueOf();
    let givenUnix = Math.floor(givenMill / 1000);
    let currentUnix = days * 24 * 60 * 60;
    let out = null;
    switch (operator) {
      case "-":
        out = currentUnix - givenUnix;
        break;
      case "+":
        out = currentUnix + givenUnix;
        break;
    }
    //console.log(out);
    return new Date(out * 1000);
  }
  static convertTwoDates(date = null, greaterDate = null, operator = "-") {
    let givenMill = new Date().valueOf();
    let secondMill = givenMill;
    if (date != null) givenMill = new Date(date).valueOf();
    if (greaterDate != null) secondMill = new Date(greaterDate).valueOf();

    let givenUnix = Math.floor(givenMill / 1000);
    let currentUnix = Math.floor(secondMill / 1000);
    let out = null;
    switch (operator) {
      case "-":
        out = currentUnix - givenUnix;
        break;
      case "+":
        out = currentUnix + givenUnix;
        break;
    }
    //console.log(out);
    let days = Math.floor(out / (24 * 60 * 60));
    let hours = Math.floor(out / (60 * 60));
    let min = Math.floor(out / 60);
    return { day: days, sec: out, hour: hours, minute: min };
  }

  static calculateDate(date = null, operator = "-") {
    let givenMill = new Date().valueOf();
    if (date != null) givenMill = new Date(date).valueOf();
    let givenUnix = Math.floor(givenMill / 1000);
    let currentUnix = Math.floor(new Date().valueOf() / 1000);
    let out = null;
    switch (operator) {
      case "-":
        out = currentUnix - givenUnix;
        break;
      case "+":
        out = currentUnix + givenUnix;
        break;
    }
    //var t=out/(3600*24);
    return out;
  }

  static getDatePeriods(timeStamp = 0) {
    let dateValue = "";
    let cal = timeStamp / 3600; //hours

    if (cal > 23) {
      cal = timeStamp / (3600 * 24); //days
      if (cal >= 365) {
        //years
        cal = timeStamp / (3600 * 24 * 365);
        dateValue = Math.floor(cal) + "Year(s)";
      } else {
        dateValue = Math.floor(cal) + "Day(s)";
      }
    } else {
      if (cal < 1) {
        cal = timeStamp / 60; //minute
        if (cal < 1) dateValue = timeStamp + "Seconds";
        else dateValue = Math.floor(cal) + "minutes";
      } else {
        dateValue = Math.floor(cal) + "hours";
      }
    }
    return dateValue;
  }

  static digitOnlyDate(dates = null, isStamp = false) {
    let d = new Date();
    if (dates != null) d = new Date(dates);
    if (isStamp) d = new Date(dates * 1000);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let dai = "",
      mon = "";
    if (month < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let date = dai + mon + d.getFullYear();

    return date;
  }
  static digitOnlyDateTime(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = "";
    let day = "";
    if (d.getMonth() + 1 < 10) month = "0" + month;
    if (d.getDate() < 10) day = "0" + day;
    let h = "";
    let m = "";
    if (d.getHours() < 10) h = "0" + h;
    if (d.getMinutes() < 10) m = "0" + m;
    let dates = day + "" + month + d.getFullYear() + h + m;
    return dates;
  }

  static formatRawDate(rawDate) {
    let d = rawDate;
    if (rawDate != null) {
      rawDate = rawDate.trim();
      let len = rawDate.length;

      let year = rawDate.substring(0, 4);
      let month = rawDate.substring(4, 6);
      let day = rawDate.substring(6, 8);
      d = year + "-" + month + "-" + day;
      if (len > 9) {
        let h = rawDate.substring(8, 10);
        let m = rawDate.substring(10, 12);
        let s = "00";
        if (len > 11) s = rawDate.substring(12, 14);
        d += " " + h + ":" + m + ":" + s;
      }
    }
    return d;
  }

  static formatRawTime(rawDate) {
    let d = rawDate;
    if (rawDate != null) {
      rawDate = rawDate.trim();
      let len = rawDate.length;

      let year = rawDate.substring(0, 4);
      let month = rawDate.substring(4, 6);
      let day = rawDate.substring(6, 8);
      d = "";
      if (len > 9) {
        let h = rawDate.substring(8, 10);
        let m = rawDate.substring(10, 12);
        let s = "00";
        if (len > 11) s = rawDate.substring(12, 14);
        d += h + ":" + m + ":" + s;
      }
    }
    return d;
  }

  static loginDate(date = null, isStamp = false) {
    let d = new Date();
    if (date != null) d = new Date(date);
    if (isStamp) d = new Date(date * 1000);
    let month = "";
    let day = d.getDate();
    let mon = month,
      dai = "";
    if (d.getMonth() + 1 < 10) mon = "0" + month;
    if (day < 10) dai = "0" + day;
    let dat = mon + "" + dai;

    return dat;
  }
}
