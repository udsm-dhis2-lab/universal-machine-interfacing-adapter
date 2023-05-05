export const formatRawDate = (rawDate: any) => {
  if (
    rawDate === false ||
    rawDate === null ||
    rawDate === "" ||
    rawDate === undefined ||
    rawDate.length === 0
  ) {
    return null;
  }

  const len = rawDate.length;
  const year = rawDate.substring(0, 4);
  const month = rawDate.substring(4, 6);
  const day = rawDate.substring(6, 8);
  let d = year + "-" + month + "-" + day;
  if (len > 9) {
    const h = rawDate.substring(8, 10);
    const m = rawDate.substring(10, 12);
    let s = "00";
    if (len > 11) {
      s = rawDate.substring(12, 14);
    }
    d += " " + h + ":" + m + ":" + s;
  }
  return d;
};
