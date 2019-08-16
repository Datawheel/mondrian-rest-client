import axios, {AxiosError, AxiosResponse} from "axios";
import urljoin from "url-join";
import {AllowedFormat, FORMATS, MAX_GET_URI_LENGTH} from "./common";
import Cube from "./cube";
import {ClientError, ServerError} from "./errors";
import {Aggregation, Annotations, ServerStatus} from "./interfaces";
import Level from "./level";
import Member from "./member";
import Query from "./query";

class Client {
  public annotations: Annotations = {};
  public baseUrl: string = "";
  public serverOnline: string = "";
  public serverSoftware: string = "mondrian";
  public serverVersion: string = "";

  private cacheCube: {[key: string]: Promise<Cube>} = {};
  private cacheCubes: Promise<Cube[]>;

  constructor(url: string) {
    if (!url) {
      throw new ClientError(`Please specify a valid mondrian-rest server URL.`);
    }
    this.baseUrl = url;
  }

  checkStatus(): Promise<ServerStatus> {
    return this.cubes().then(
      _ => {
        this.serverOnline = "ok";
        this.serverVersion = "";
        return {
          software: this.serverSoftware,
          status: this.serverOnline,
          url: this.baseUrl,
          version: this.serverVersion
        };
      },
      (err: AxiosError) => {
        this.serverOnline = "unavailable";
        throw err;
      }
    );
  }

  cube(cubeName: string): Promise<Cube> {
    const url = urljoin(this.baseUrl, "cubes", cubeName);
    const cubePromise =
      this.cacheCube[cubeName] ||
      axios.get(url).then((response: AxiosResponse<any>) => {
        const protoCube = response.data;
        if (typeof protoCube.name === "string") {
          const cube = Cube.fromJSON(protoCube);
          cube.server = this.baseUrl;
          this.cacheCube[cube.name] = Promise.resolve(cube);
          return cube;
        }

        throw new ServerError(response);
      });
    this.cacheCube[cubeName] = cubePromise;
    return cubePromise;
  }

  cubes(): Promise<Cube[]> {
    const url = urljoin(this.baseUrl, "cubes");
    const cubePromises =
      this.cacheCubes ||
      axios.get(url).then((response: AxiosResponse<any>) => {
        const data = response.data;
        if (Array.isArray(data.cubes)) {
          const cubePromises = data.cubes.map((protoCube: any) => {
            if (protoCube.name in this.cacheCube) {
              return this.cacheCube[protoCube.name];
            }
            else {
              const cube = Cube.fromJSON(protoCube);
              cube.server = this.baseUrl;
              const cubePromise = Promise.resolve(cube);
              this.cacheCube[cube.name] = cubePromise;
              return cubePromise;
            }
          });
          return Promise.all(cubePromises);
        }

        throw new ServerError(response);
      });
    this.cacheCubes = cubePromises;
    return cubePromises;
  }

  execQuery(
    query: Query,
    format: AllowedFormat = AllowedFormat.jsonrecords,
    method: string = "AUTO"
  ): Promise<Aggregation> {
    const url = query.getAggregateUrl(format);

    if (method == "AUTO") {
      method = url.length > MAX_GET_URI_LENGTH ? "POST" : "GET";
    }

    const headers: any = {Accept: FORMATS[format]};
    const request: any = {url, method, headers};
    if (method == "POST") {
      headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
      const splitter = url.indexOf("?");
      request.data = url.substr(splitter + 1);
      request.method = "POST";
      request.url = url.substr(0, splitter);
    }

    return axios(request).then((response: AxiosResponse<any>) => {
      if (response.status > 199 && response.status < 300) {
        const aggregation = response.data;
        return {
          data: "data" in aggregation ? aggregation.data : aggregation,
          url,
          options: query.getOptions()
        };
      }
      throw new ServerError(response);
    });
  }

  member(
    level: Level,
    key: string,
    getChildren: boolean = false,
    caption: string = null
  ): Promise<Member> {
    // TODO: Check this after implementing checkStatus()
    const legacyServer = this.serverVersion.startsWith("0.");
    const url: string = urljoin(
      level.cube.toString(),
      `/dimensions/${level.dimension.name}`,
      legacyServer ? "/" : `/hierarchies/${level.hierarchy.name}`,
      `/levels/${level.name}`,
      "/members",
      key
    );
    const params: any = {};

    if (getChildren) params["children"] = true;

    if (caption !== null && !level.hasProperty(caption)) {
      throw new Error(`Property ${caption} does not exist in level ${level.fullname}`);
    }

    if (caption !== null) params["caption"] = caption;

    return axios({url, params}).then((response: AxiosResponse<any>) => {
      const member = Member.fromJSON(response.data);
      member.level = level;
      return member;
    });
  }

  members(
    level: Level,
    getChildren: boolean = false,
    caption: string = null
  ): Promise<Member[]> {
    // TODO: Check this after implementing checkStatus()
    const legacyServer = this.serverVersion.startsWith("0.");
    const url: string = urljoin(
      level.cube.toString(),
      `/dimensions/${level.dimension.name}`,
      legacyServer ? "/" : `/hierarchies/${level.hierarchy.name}`,
      `/levels/${level.name}`,
      "/members"
    );
    const params: any = {};

    if (getChildren) {
      params["children"] = true;
    }

    if (caption) {
      if (!level.hasProperty(caption)) {
        throw new ClientError(`Property ${caption} does not exist in level ${level.fullname}`);
      }
      params["caption"] = caption;
    }

    return axios({url, params}).then((response: AxiosResponse<any>) =>
      response.data["members"].map((protoMember: any) => {
        const member = Member.fromJSON(protoMember);
        member.level = level;
        return member;
      })
    );
  }

  toString(): string {
    return this.baseUrl;
  }
}

export default Client;
