const util = require('util');

export interface ConnectionError extends Error {
  message: string;
  code?: string;
  isTransient?: boolean;
}

interface ConnectionErrorConstructor {
  (message: ConnectionError): ConnectionError;
  (message: string, code?: string): ConnectionError;
  new (message: string, code?: string): ConnectionError;
}

export interface RequestError extends Error {
  message: string;
  code?: string;

  number?: number;
  state?: number;
  class?: number;
  serverName?: string;
  procName?: string;
  lineNumber?: number;
}

interface RequestErrorConstructor {
  (message: RequestError): RequestError;
  (message: string, code?: string): RequestError;
  new (message: string, code?: string): RequestError;
}

export const ConnectionError = connectionError as ConnectionErrorConstructor;
function connectionError(this: ConnectionError, message: string | ConnectionError, code: string) {
  if (!(this instanceof ConnectionError)) {
    if (message instanceof ConnectionError) {
      return message;
    }

    return new ConnectionError(message, code);
  }

  Error.call(this);

  this.message = message as string;
  this.code = code;

  Error.captureStackTrace(this, this.constructor);
}

util.inherits(connectionError, Error);

connectionError.prototype.name = 'ConnectionError';

export const RequestError = requestError as RequestErrorConstructor;
function requestError(this: RequestError, message: string | RequestError, code: string) {
  if (!(this instanceof RequestError)) {
    if (message instanceof RequestError) {
      return message;
    }

    return new RequestError(message, code);
  }

  Error.call(this);

  this.message = message as string;
  this.code = code;

  Error.captureStackTrace(this, this.constructor);
}

util.inherits(requestError, Error);

requestError.prototype.name = 'RequestError';
