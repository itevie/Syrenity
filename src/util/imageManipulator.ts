//import sharp from "sharp";
import Logger from "../Logger";

const logger = new Logger("images");

export async function cropToAvatar(base64: string): Promise<string> {
  return base64;
  /*logger.log("Cropping image to size of avatar...");

  const buffer = Buffer.from(base64, "base64");

  const data = await sharp(buffer)
    .resize({
      width: 256,
      height: 256,
      fit: "cover"
    })
    .toBuffer()
  
  return data.toString("base64");*/
}