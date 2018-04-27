# comments


## Overview

**Comments** is one of public implementations of validation service using Hyperledger Fabric and Hyperledger Composer.

Comments supports simple CRUD API. These APIs would be run on port 3001(default).

## How to deploy business Network from API server.

- Prepare API server with Ubuntu 16.04.

- Login to that API Server(Ubuntu 16.04) with SSH or terminal

- (Once)Install Node.js(V6.x) and npm

    - `$ sudo apt-get install -y nodejs npm`

    - `$ sudo npm cache clean`

    - `$ sudo npm install n -g`

    - `$ sudo n list`

        - find latest 6.x.x version, for example 6.12.3

    - `$ sudo n 6.12.3`

    - `$ sudo apt-get purge nodejs npm`

- (Once)Install composer-cli

    - `$ npm install -g composer-cli`

- (Once)Prepare Hyperledger Fabric v1.

    - http://dotnsf.blog.jp/archives/1069641731.html

- (Once)Create BNC(Business Network Card) for PeerAdmin@hlfv1

    - `$ cd ~/fabric/; ./createPeerAdminCard.sh`

    - `$ cp /tmp/PeerAdmin@hlfv1.card ./`

- (Once)Import Created Business Network Card for PeerAdmin@hlfv1

    - `$ composer card import --file PeerAdmin@hlfv1.card`

- (Once)Import BNC for admin@comments-network

    - `$ cd **/comments/api`

    - `$ composer card import --file cards/admin@comments-network.card`

- (Everytime after starting Hyperledger Fabric)Install comments-network runtime

    - `$ composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName comments-network`

- (Everytime after starting Hyperledger Fabric)Start comments-network with BNA

    - `$ composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile comments-network.bna --file PeerAdmin@hlfv1.card`

- (Everytime after starting Hyperledger Fabric)Ping to Business Network with admin@comments-network(for confirmation)

    - `$ composer network ping --card admin@comments-network`

## How to install/run Platform API( and API Document) in API Server

- Prepare API Server with Ubuntu 16.04

- Login to that API Server(Ubuntu 16.04) with SSH or terminal

- Install Node.js(V6.x) and npm

    - See above for detailed commands

- Prepare for folowing composer commands

    - `$ cd **/comments/api`

- Install dependencies

    - `$ npm install`

- (Optional)Edit public/doc/swagger.yaml host value for Swagger API Document, if needed.

- (Optional)Edit setttings.js, if needed.

    - exports.cardName : Business Network Card name for Hyperledger Fabric access

    - exports.superSecret : Seed string for encryption

    - exports.basic_username : Username for Basic authentication

    - exports.basic_password : Password for Basic authentication

- Run app.js with Node.js

    - `$ node app`

- Basic authentication:

    - See api/settings.js : exports.basic_username and exports.basic_password


## How to setup sample web application under app/

- Prepare for folowing composer commands

    - `$ cd **/comments/app`

- Install dependencies

    - `$ npm install`

- (Optional)Edit setttings.js, if needed.

    - exports.api_url : URL for above API Platform

    - exports.superSecret : Seed string for encryption( this has to be same value with the ones of API)

    - exports.basic_username : Username for Basic authentication

    - exports.basic_password : Password for Basic authentication

- Run app.js with Node.js

    - `$ node app`






## Licensing

This code is licensed under MIT.

https://github.com/dotnsf/comments/blob/master/MIT-LICENSE.txt

## Copyright

2018 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
