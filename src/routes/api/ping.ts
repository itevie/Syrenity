import { RouteDetails } from "../../types/route";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/ping",
    handler: (req, res) => {
        return res.status(200).send("Pong!");
    }
};

export default handler;