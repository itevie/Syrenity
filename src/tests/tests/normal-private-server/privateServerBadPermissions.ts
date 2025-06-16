import resources from "../../resources";
import Test, { axiosClient, expectHTTP } from "../../test";

let urlsToTest = [
  `/api/servers/${resources.normalUser.id}`,
  `/api/channels/${resources.privateServerChannel.id}`,
  `/api/channels/${resources.privateServerChannel.id}/messages`,
];

const test: Test = {
  name: "normal-can-view-private-server",
  group: "api-permissions",

  run() {
    return Promise.all(
      urlsToTest.map((x) => expectHTTP("get", x).toBeStatus(401)),
    );
  },
};

export default test;
