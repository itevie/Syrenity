import { Axios, AxiosResponse } from "axios";

export default interface Test {
  name: string;
  group: string;
  run: () => Promise<true | string>;
}

export const axiosClient = new Axios({
  headers: {
    Authorization: `Token normal-user`,
  },
  baseURL: `http://localhost:3000`,
});

export function expectHTTP(promise: Promise<any>) {
  return {
    toBeStatus: async (code: number) => {
      try {
        const result = (await promise) as AxiosResponse;
        if (result.status !== code)
          return `expected status code ${code} but got ${result.status}`;
        return true;
      } catch (e) {
        return `expected status code ${code} but got exception ${e.toString()}`;
      }
    },
  };
}
