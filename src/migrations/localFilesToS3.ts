import { initialise, query } from "../database/database";
import "dotenv/config";
import SyFile, { DatabaseFile, streamToBuffer } from "../models/File";
import { createReadStream, existsSync } from "node:fs";
import { uploadFileToS3 } from "../database/s3";
import { PassThrough } from "node:stream";
import Logger from "../client/src/dawn-ui/Logger";

const logger = new Logger("s3-migrator");

(async () => {
  await initialise(process.env.DB_CONSTRING!);

  let files = (
    await query<DatabaseFile>({
      text: "SELECT * FROM files",
      values: [],
    })
  ).rows.map((x) => new SyFile(x));

  for await (const file of files) {
    if (existsSync(file.fileLocation)) {
      logger.log(`Attempting to upload ${file.data.id}: ${file.fileLocation}`);
      await uploadFileToS3(
        file,
        await streamToBuffer(
          createReadStream(file.fileLocation) as unknown as PassThrough,
        ),
      );
    }
  }
})();
