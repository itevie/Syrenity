import fs from "fs";
import axios from 'axios';
import Logger from '../Logger';
import FormData from 'form-data';
import { cropToAvatar } from './imageManipulator';
import ServerError from '../ServerError';
const logger = new Logger('attachments');

let imgur_token = "";
try { imgur_token = fs.readFileSync("../imgur_token.txt", "utf-8") } catch {}

export default function (
  imageData: string,
  createFile = true
): Promise<SyrenityFile> {
  return new Promise<SyrenityFile>(async (resolve, reject) => {
    // Try to resize
    try {
      imageData = await cropToAvatar(imageData);
    } catch (err) {
      console.log(err);
      throw new ServerError({
        message: "Failed to crop image",
        error: err,
        statusCode: 500
      });
    }

    // Create form data for imgur
    const formData = new FormData();
    formData.append('image', imageData);

    // Create axios data
    const config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: 'https://api.imgur.com/3/image',
      headers: {
        Authorization: 'Client-ID ' + imgur_token,
        ...formData.getHeaders(),
      },
      data: formData,
    };

    logger.log('Generating new imgur image...');

    // Perform axios request
    axios(config)
      .then(async axiosRes => {
        // Get returned data
        const imgData = axiosRes.data.data;
        logger.log(`Created imgur image: ${imgData.link}`);

        // Create database file data
        const fileData: SyrenityFile = {
          id: -1,
          type: 'img/imgur',
          content: imgData.link,
          name: 'file',
          created_at: new Date(),
        };

        // Check if the file should even be made
        if (createFile !== true) return resolve(fileData);

        // Create the file
        //const file = await database.quick.files.create(fileData);

        //resolve(file);
      })
      .catch(err => {
        console.log(err.response.data);
        logger.log('Failed to upload imgur image!');
        //reject(err);
      });
  });
}