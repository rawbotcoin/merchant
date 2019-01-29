#!/usr/bin/expect -f
 
set timeout -1

set pgp_key [lindex $argv 0]
set email [lindex $argv 1]

spawn ./commands.sh $pgp_key $email

expect "gpg>"

send -- "trust\r"

expect "Your decision?"

send -- "5\r"

expect "Do you really want to set this key to ultimate trust? (y/N)"

send -- "y\r"

expect "<$email>"

exit 1

expect eof
