#!/bin/bash
cd /home/kavia/workspace/code-generation/cyclist-connect-325111-325121/bike_connect_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

