import {AxiosResponse} from "axios";

export class ClientError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ServerError extends Error {
  public readonly body: any;
  public readonly detail: any;
  public readonly status: number;

  constructor(response: AxiosResponse<any>, message?: string) {
    super(message || response.statusText);

    if (response.data) {
      this.message = response.data.error || response.data;
    }

    this.status = response.status;
    this.body = response.data;

    try {
      this.detail = JSON.parse(this.body).error;
    } catch (e) {
      this.detail = null;
    }

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
