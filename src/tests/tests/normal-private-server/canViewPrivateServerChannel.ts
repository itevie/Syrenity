import resources from "../../resources";
import Test, { axiosClient, expectHTTP } from "../../test";

const test: Test = {
  name: "normal-can-view-private-server-channel",
  group: "api-permissions",

  run() {
    return expectHTTP(
      axiosClient.get(`/api/channels/${resources.privateServerChannel.id}`)
    ).toBeStatus(401);
  },
};

export default test;
