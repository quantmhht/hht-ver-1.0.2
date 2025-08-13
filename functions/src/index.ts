import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
// Sửa lại cách import Busboy ở đây
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Busboy = require("busboy");
import cors from "cors";
import {logger} from "firebase-functions";

export type BusboyFileInfo = {
  filename: string;
  mimeType: string;
};
admin.initializeApp();
const corsHandler = cors({origin: true});

export const uploadImage = onRequest(
  {region: "asia-southeast1", memory: "1GiB"},
  (req, res) => {
    corsHandler(req, res, () => {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const busboy = new Busboy({headers: req.headers});
      const tmpdir = os.tmpdir();
      const uploads:
      { [key: string]: { filepath: string; mimetype: string } } = {};

      busboy.on(
        "file",
        (
          fieldname: string,
          file: NodeJS.ReadableStream,
          info: BusboyFileInfo,
        ) => {
          const {filename, mimeType} = info;
          const filepath = path.join(tmpdir, filename);
          uploads[fieldname] = {filepath, mimetype: mimeType};
          const writeStream = fs.createWriteStream(filepath);
          file.pipe(writeStream);
        });

      busboy.on("finish", async () => {
        const bucket = admin.storage().bucket();
        const uploadedImages: string[] = [];

        try {
          for (const name in uploads) {
            if (Object.prototype.hasOwnProperty.call(uploads, name)) {
              const file = uploads[name];
              const destination =
                `images/${Date.now()}-${path.basename(file.filepath)}`;
              await bucket.upload(file.filepath, {
                destination: destination,
                metadata: {
                  contentType: file.mimetype,
                },
              });
              uploadedImages.push(destination);
              fs.unlinkSync(file.filepath);
            }
          }

          res.status(200).json({
            "data": {
              "domain": `https://storage.googleapis.com/${bucket.name}/`,
              "images": uploadedImages,
            },
            "err": 0,
            "message": "Success",
          });
          return;
        } catch (error) {
          logger.error("Upload failed", error);
          res.status(500).send("Upload failed");
          return;
        }
      });

      busboy.end(req.rawBody);
    });
  }
);
