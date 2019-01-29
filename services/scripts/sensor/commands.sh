#!/bin/bash

EMAIL=$1
FILE=$2
ENCRYPTED=$2.gpg

gpg --output $ENCRYPTED --encrypt --recipient $EMAIL $FILE

gpg --import $1
gpg --edit-key $2
send trust
