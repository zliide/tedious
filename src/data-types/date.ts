import { DataType } from '../data-type';
import WritableTrackingBuffer from '../tracking-buffer/writable-tracking-buffer';

// globalDate is to be used for JavaScript's global 'Date' object to avoid name clashing with the 'Date' constant below
const globalDate = global.Date;
const YEAR_ONE = new globalDate(2000, 0, -730118);
const UTC_YEAR_ONE = globalDate.UTC(2000, 0, -730118);

const Date: DataType = {
  id: 0x28,
  type: 'DATEN',
  name: 'Date',

  declaration: function() {
    return 'date';
  },

  generateTypeInfo: function(buffer) {
    return Buffer.from([this.id]);
  },

  *generateParameterData(parameter, options) {
    const value = parameter.value as any; // Temporary solution. Remove 'any' later.

    if (value != null) {
      const buffer = new WritableTrackingBuffer(16);
      buffer.writeUInt8(3);

      if (options.useUTC) {
        buffer.writeUInt24LE(Math.floor((+parameter.value - UTC_YEAR_ONE) / 86400000));
      } else {
        const dstDiff = -(parameter.value.getTimezoneOffset() - YEAR_ONE.getTimezoneOffset()) * 60 * 1000;
        buffer.writeUInt24LE(Math.floor((+parameter.value - +YEAR_ONE + dstDiff) / 86400000));
      }
      yield buffer.data;
    } else {
      yield Buffer.from([0x00]);
    }
  },

  // TODO: value is techincally of type 'unknown'.
  validate: function(value): null | Date | TypeError {
    if (value == null) {
      return null;
    }

    if (!(value instanceof globalDate)) {
      value = new globalDate(globalDate.parse(value));
    }

    if (isNaN(value)) {
      return new TypeError('Invalid date.');
    }

    return value;
  }
};

export default Date;
module.exports = Date;
