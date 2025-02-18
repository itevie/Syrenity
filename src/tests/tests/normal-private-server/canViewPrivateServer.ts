import resources from "../../resources";
import Test, { axiosClient, expectHTTP } from "../../test";

const test: Test = {
  name: "normal-can-view-private-server",
  group: "api-permissions",

  run() {
    return expectHTTP(
      axiosClient.get(`/api/servers/${resources.normalUser.id}`)
    ).toBeStatus(401);
  },
};

export default test;
