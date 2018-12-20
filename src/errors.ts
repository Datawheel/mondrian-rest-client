import { AxiosResponse } from "axios";

export class MondrianClientError extends Error {}

export class MondrianRestError extends Error {
    public readonly status: number;
    public readonly body: any;
    public readonly error: any;

    constructor(response: AxiosResponse<any>) {
        super();

        this.status = response.status;
        this.message = response.statusText;
        this.body = response.data;

        try {
            this.error = JSON.parse(this.body).error;
        }
        catch (e) {
            this.error = null;
        }

        // Set the prototype explicitly.
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MondrianRestError.prototype);
    }
}

export class ClientError extends Error {}

export class MultiClientError extends Error {
    public readonly body: any;
    public readonly error: any;

    constructor(message: string) {
        super();
        this.message = message;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, MultiClientError.prototype);
    }
}
