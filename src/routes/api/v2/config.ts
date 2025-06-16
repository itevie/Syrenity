import { promisify } from "util";
import { RouteDetails } from "../../../types/route";
import { exec } from "child_process";

const handler: RouteDetails = {
  path: "/",
  method: "GET",

  handler: async (_, res) => {
    let { stdout: commitId } = await promisify(exec)("git log -1 --pretty=%H");
    let { stdout: commitMessage } = await promisify(exec)(
      "git log -1 --pretty=%B",
    );
    let { stdout: commitAbbrId } = await promisify(exec)(
      "git log -1 --pretty=%h",
    );

    return res.status(200).send({
      version: {
        git: {
          id: commitId.trim(),
          abbrId: commitAbbrId.trim(),
          message: commitMessage.trim(),
        },
      },
    });
  },
};

export default handler;
