#!/bin/bash
lockfile=/tmp/npm-run-start.lock
if [ -f "$lockfile" ]; then
  echo "Already running."
  exit
else
  echo $$ > "$lockfile"
  # 这里修改为您的 npm 运行命令
  npm run start
  rm -f "$lockfile"
fi