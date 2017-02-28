export default class Aggregation {
    data: {};
    url: string;
    options: { [option: string]: boolean };


    constructor(data: {}, url: string, options: { [option: string]: boolean }) {
        this.data = data;
        this.url = url;
        this.options = options;
    }
}
