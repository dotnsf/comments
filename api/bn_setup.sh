#!/bin/bash

composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName comments-network

composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile comments-network.bna --file ~/PeerAdmin@hlfv1.card

composer network ping --card admin@comments-network
