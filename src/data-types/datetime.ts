import { DataType } from '../data-type';
import DateTimeN from './datetimen';

const EPOCH_DATE = new Date(1900, 0, 1);
const UTC_EPOCH_DATE = new Date(Date.UTC(1900, 0, 1));

const DateTime: DataType = {
  id: 0x3D,
  type: 'DATETIME',
  name: 'DateTime',

  declaration: function() {
    return 'datetime';
  },

  generateTypeInfo() {
    return Buffer.from([DateTimeN.id, 0x08]);
  },

  generateParameterData: function*(parameter, options) {
    const value = parameter.value as any; // Temporary solution. Remove 'any' later.

    if (value != null) {
      let days, dstDiff, milliseconds, seconds, threeHundredthsOfSecond;
      if (options.useUTC) {
        days = Math.floor((parameter.value.getTime() - UTC_EPOCH_DATE.getTime()) / (1000 * 60 * 60 * 24));
        seconds = parameter.value.getUTCHours() * 60 * 60;
        seconds += parameter.value.getUTCMinutes() * 60;
        seconds += parameter.value.getUTCSeconds();
        milliseconds = (seconds * 1000) + parameter.value.getUTCMilliseconds();
      } else {
        dstDiff = -(parameter.value.getTimezoneOffset() - EPOCH_DATE.getTimezoneOffset()) * 60 * 1000;
        days = Math.floor((parameter.value.getTime() - EPOCH_DATE.getTime() + dstDiff) / (1000 * 60 * 60 * 24));
        seconds = parameter.value.getHours() * 60 * 60;
        seconds += parameter.value.getMinutes() * 60;
        seconds += parameter.value.getSeconds();
        milliseconds = (seconds * 1000) + parameter.value.getMilliseconds();
      }

      threeHundredthsOfSecond = milliseconds / (3 + (1 / 3));
      threeHundredthsOfSecond = Math.round(threeHundredthsOfSecond);

      // 25920000 equals one day
      if (threeHundredthsOfSecond === 25920000) {
        days += 1;
        threeHundredthsOfSecond = 0;
      }

      const buffer = Buffer.alloc(9);
      buffer.writeUInt8(8, 0);
      buffer.writeInt32LE(days, 1);
      buffer.writeUInt32LE(threeHundredthsOfSecond, 5);
      yield buffer;
    } else {
      yield Buffer.from([0x00]);
    }
  },

  // TODO: type 'any' needs to be revisited.
  validate: function(value): null | number | TypeError {
    if (value == null) {
      return null;
    }

    if (!(value instanceof Date)) {
      value = new Date(Date.parse(value));
    }

    if (isNaN(value)) {
      return new TypeError('Invalid date.');
    }

    return value;
  }
};

export default DateTime;
module.exports = DateTime;
