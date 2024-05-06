import { type DataType } from '../data-type';
import IntN from './intn';
import WritableTrackingBuffer from '../tracking-buffer/writable-tracking-buffer';

const DATA_LENGTH = Buffer.from([0x08]);
const NULL_LENGTH = Buffer.from([0x00]);
const MAX_SAFE_BIGINT = BigInt('9223372036854775807');
const MIN_SAFE_BIGINT = BigInt('-9223372036854775808');

const BigIntDataType: DataType = {
  id: 0x7F,
  type: 'INT8',
  name: 'BigInt',

  declaration: function() {
    return 'bigint';
  },

  generateTypeInfo() {
    return Buffer.from([IntN.id, 0x08]);
  },

  generateParameterLength(parameter, options) {
    if (parameter.value == null) {
      return NULL_LENGTH;
    }

    return DATA_LENGTH;
  },

  * generateParameterData(parameter, options) {
    if (parameter.value == null) {
      return;
    }

    const buffer = new WritableTrackingBuffer(8);
    buffer.writeInt64LE(Number(parameter.value));
    yield buffer.data;
  },

  validate: function(value): null | bigint {
    if (value == null) {
      return null;
    }

    if (typeof value !== 'bigint') {
      value = globalThis.BigInt(value);
    }

    if (value < MIN_SAFE_BIGINT || value > MAX_SAFE_BIGINT) {
      throw new TypeError(`Value must be between ${MIN_SAFE_BIGINT} and ${MAX_SAFE_BIGINT}, inclusive.`);
    }

    return value;
  }
};

export default BigIntDataType;
module.exports = BigIntDataType;
