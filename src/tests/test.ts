import { Axios, AxiosResponse } from "axios";
import Logger from "../client/src/dawn-ui/Logger";

export default interface Test {
  name: string;
  group: string;
  run: () => Promise<true | string | (true | string)[]>;
}

export const axiosClient = new Axios({
  headers: {
    Authorization: `Token normal-user`,
  },
  baseURL: `http://localhost:3000`,
});

const httpLogger = new Logger("test:http");
export function expectHTTP(method: "get", url: string) {
  return {
    toBeStatus: async (code: number) => {
      httpLogger.log(`${method} ${url}, expecting status ${code}`);
      try {
        const result = (await axiosClient[method](url)) as AxiosResponse;
        if (result.status !== code)
          return `expected status code ${code} but got ${result.status}`;
        return true;
      } catch (e) {
        return `expected status code ${code} but got exception ${e.toString()}`;
      }
    },
  };
}
