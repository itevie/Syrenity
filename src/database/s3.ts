import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import SyFile from "../models/File";
import { Readable } from "stream";
import Logger from "../client/src/dawn-ui/Logger";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

const logger = new Logger("s3");

export async function uploadFileToS3(
  file: SyFile,
  fileStream: Buffer,
): Promise<void> {
  logger.log(`Uploading ${file.data.id} (${fileStream.length} bytes)`);
  const command = new PutObjectCommand({
    Bucket: "syrenity",
    Key: `${file.data.id}`,
    Body: fileStream,
    ContentType: file.data.mime || "application/octet-stream",
  });

  await s3.send(command);
  logger.log(`Uploaded ${file.data.id}`);
}

export async function getS3Object(fileId: string): Promise<Readable> {
  const command = new GetObjectCommand({
    Bucket: "syrenity",
    Key: fileId,
  });

  const response = await s3.send(command);
  logger.log(`Fetched ${fileId}`);

  if (!response.Body || !(response.Body instanceof Readable)) {
    throw new Error("Failed to get file stream");
  }

  return response.Body;
}
