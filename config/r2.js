const { R2 } = require("node-cloudflare-r2");
const dotenv = require("dotenv");
const fs = require("fs");
const util = require("util");
dotenv.config();

const readFile = util.promisify(fs.readFile);

const r2 = new R2({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  accountId: process.env.R2_ACCOUNT_ID,
});

const bucket = r2.bucket("cstore");

bucket.provideBucketPublicUrl(process.env.R2_ENDPOINT);

const test = async () => {
  const exists = await bucket.exists();
  console.log(`Bucket exists: ${exists}`);
};

async function saveFile(filePath) {
  try {
    const fileBuffer = await readFile(filePath); // Read file into a buffer
    const fileName = filePath.split("/").pop(); // Get the file name from the file path
    const result = await bucket.uploadFile(fileBuffer, fileName);

    const fileUrl = `${process.env.R2_ENDPOINT}/${fileName}`;
    console.log(`File uploaded successfully. URL: ${fileUrl}`);
    return fileUrl;
  } catch (e) {
    console.error(`Error uploading file: ${e.message}`);
    return false;
  }
}

module.exports = saveFile;
