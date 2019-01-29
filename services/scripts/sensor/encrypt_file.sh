#!/bin/bash

EMAIL=$1
FILE=$2
ENCRYPTED=$2.gpg

gpg --output $ENCRYPTED --encrypt --recipient $EMAIL $FILE
