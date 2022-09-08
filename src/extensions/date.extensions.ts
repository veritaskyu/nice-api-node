declare interface Date {
  YYYYMMDDHHmmss(): string;
}

function pad(number: number, length: number) {
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

Date.prototype.YYYYMMDDHHmmss = function () {
  const yyyy = this.getFullYear().toString();
  const MM = pad(this.getMonth() + 1, 2);
  const dd = pad(this.getDate(), 2);
  const hh = pad(this.getHours(), 2);
  const mm = pad(this.getMinutes(), 2);
  const ss = pad(this.getSeconds(), 2);
  return yyyy + MM + dd + hh + mm + ss;
};
