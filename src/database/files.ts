// import { createWriteStream, mkdirSync, WriteStream } from "fs";
// import { query } from "./database";
// import path from "path";
// import { fileStoreLocation } from "..";
// import { randomID } from "../util/util";
// import { extension } from "mime-types";
// import fixupURLForProxy from "../util/proxyFixup";
// import axios from "axios";
// import { PassThrough } from "stream";
// import config from "../config";
// import { uploadFileToS3 } from "./s3";

// const _actions = {
//   downloadAndCreate: async (url: string): Promise<SyFile> => {
//     return await _actions.downloadTo(url)[0];
//   },

//   downloadTo: async (
//     url: string,
//     fileObject: SyFile | null = null,
//   ): Promise<[SyFile, PassThrough, string]> => {
//     const headers = fixupURLForProxy(url);

//     const response = await axios.get(url, {
//       headers,
//       responseType: "stream",
//     });

//     if (fileObject === null)
//       fileObject = await _actions.create(
//         `proxied-${randomID(10)}.${extension(response.headers["content-type"])}`,
//         url,
//         response.headers["content-type"],
//       );

//     const folder = path.resolve(
//       path.join(
//         fileStoreLocation + "/",
//         fileObject.created_at.toLocaleDateString().replace(/\//g, "-"),
//       ),
//     );
//     mkdirSync(folder, { recursive: true });
//     const actualPath = path.join(
//       folder,
//       `${fileObject.id}-${fileObject.file_name}`,
//     );

//     const passthrough = new PassThrough();

//     response.data.pipe(passthrough);

//     const fileStream = createWriteStream(actualPath);
//     const s3Stream = new PassThrough();
//     const returnStream = new PassThrough();

//     passthrough.pipe(fileStream);
//     passthrough.pipe(s3Stream);
//     passthrough.pipe(returnStream);

//     (async () => {
//       let buffer = await streamToBuffer(s3Stream);
//       if (config.proxy.saveToS3) await uploadFileToS3(fileObject, buffer);
//     })();

//     return [fileObject, returnStream, response.headers["content-type"]];
//   },
// } as const;

// export default _actions;
