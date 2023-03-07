const fs = require("fs");
const os = require("os");
const platform = os.platform();
const createFile = function (filepath: string, size: number, callback: Function) {
  const cb = function (err) {
    callback && callback(err);
  };
  if (fs.existsSync(filepath)) {
    cb("file existed.");
  } else {
    var cmd;
    switch (platform) {
      case "win32":
        cmd = "fsutil file createnew " + filepath + " " + size;
        break;
      case "darwin":
      case "linux":
        cmd = "dd if=/dev/zero of=" + filepath + " count=1 bs=" + size;
        break;
    }
    var exec = require("child_process").exec;
    exec(cmd, function (err, stdout, stderr) {
      cb(err);
    });
  }
};

export { createFile };
