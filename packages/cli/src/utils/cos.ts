const COS = require("cos-nodejs-sdk-v5");
const bucket = "sophtest-1314005616";

const config = {
  Bucket: bucket,
  Region: "ap-shanghai",
};
const cos = new COS({
  SecretId: "AKID60lMmDPM4YnoY1ECwRFo9GAuQnulNn3H",
  SecretKey: "82gAXpw871kFXa9XigS1RehX9XgbIkz0",
});

function putObject(content: any, keyname: string) {
  // 调用方法
  const stream = Buffer.from(JSON.stringify(content, undefined, 2));
  cos.putObject(
    {
      Bucket: config.Bucket /* 必须 */,
      Region: config.Region,
      Key: keyname,
      Body: stream,
    },
    function (err, data) {
      console.log(err || data);
    }
  );
}

export { putObject };
