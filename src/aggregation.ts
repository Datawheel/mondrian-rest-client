export default class Aggregation {
    data: any;
    url: string;
    options: { [option: string]: boolean };

    constructor(data: any, url: string, options: { [option: string]: boolean }) {
        this.data = data;
        this.url = url;
        this.options = options;
    }
}
