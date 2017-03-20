#!/bin/bash

talk() {
  echo -e $1
}

hr() {
  echo -e "\n"
}

confirm() {
  read -n1 -rsp $'Press any key to continue or Ctrl+C to exit...\n'
}

debug() {
  if [ -n "$DEBUG" ]
  then
    echo -e "[DEBUG] $1"
  fi
}

clear

debug "Debug mode on"

cat << "EOF"

  /$$$$$$  /$$             /$$     /$$      
 /$$__  $$| $$            | $$    | $$      
| $$  \__/| $$  /$$$$$$  /$$$$$$  | $$$$$$$$ 
|  $$$$$$ | $$ /$$__  $$|_  $$_/  | $$__  $$
 \____  $$| $$| $$  \ $$  | $$    | $$  \ $$
 /$$  \ $$| $$| $$  | $$  | $$ /$$| $$  | $$
|  $$$$$$/| $$|  $$$$$$/  |  $$$$/| $$  | $$
 \______/ |__/ \______/    \___/  |__/  |__/


EOF

talk "In order to install software for you, we need administrator permissions\n"

debug "Caching sudo"
sudo ls /tmp > /dev/null

hr

debug "Installing brew"
brew --version > /dev/null
if [ $? -ne 0 ]
then
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null
fi

debug "Installing ansible"
brew install ansible

debug "Installing nodejs"
brew install node

debug "npm install"
npm install

clear

debug "Interactive console"
node index.js init

debug "Installing selected packages"
ansible-playbook -i inventory install.yml

if [ $? -eq 0 ]
then
  clear
  hr
  talk "(^_^) We're done here. Please check everything is in place."
else
  clear
  hr
  talk "Something went wrong, please try again."
fi

hr
