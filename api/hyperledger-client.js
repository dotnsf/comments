//. hyperledger-client.js

//. Run following commands to create BNC(Business Network Card) for PeerAdmin
//. $ cd /fabric
//. $ ./createPeerAdminCard.sh

var settings = require( './settings' );

const NS = 'me.juge.comments.network';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const HyperledgerClient = function() {
  var vm = this;
  vm.businessNetworkConnection = null;
  vm.businessNetworkDefinition = null;

  vm.prepare = (resolved, rejected) => {
    if (vm.businessNetworkConnection != null && vm.businessNetworkDefinition != null) {
      resolved();
    } else {
      console.log('HyperLedgerClient.prepare(): create new business network connection');
      vm.businessNetworkConnection = new BusinessNetworkConnection();
      const cardName = settings.cardName;
      return vm.businessNetworkConnection.connect(cardName)
      .then(result => {
        vm.businessNetworkDefinition = result;

        //. Events Subscription
        vm.businessNetworkConnection.on( 'event', ( evt ) => {
          var event = {
            type: evt['$type'],
            eventId: evt.eventId,
            timestamp: evt.timestamp,
            id: evt.id,
            name: evt.name,
            body: evt.body
          };
          //. event: { '$class': '***', 'eventId': 'xxxx-xxxx-xxxx-xxxxxx#x' }
          console.log( event );
        });

        resolved();
      }).catch(error => {
        console.log('HyperLedgerClient.prepare(): reject');
        rejected(error);
      });
    }
  };


  vm.createCommentTx = (comment, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'CreateCommentTx');
      //console.log( transaction );
      transaction.id = comment.id;
      transaction.category = comment.category;
      transaction.name = comment.name;
      transaction.body = comment.body;
      transaction.source = ( comment.source ? comment.source : null );
      transaction.url = ( comment.url ? comment.url : null );
      transaction.hash = ( comment.hash ? comment.hash : null );
      transaction.modified = comment.modified;

      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log('HyperLedgerClient.createCommentTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.updateItemTx = (comment, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'UpdateCommentTx');
      //console.log( transaction );
      transaction.id = comment.id;
      transaction.category = ( comment.category ? comment.category : null );
      transaction.name = ( comment.name ? comment.name : null );
      transaction.body = ( comment.body ? comment.body : null );
      transaction.source = ( comment.source ? comment.source : null );
      transaction.url = ( comment.url ? comment.url : null );
      transaction.hash = ( comment.hash ? comment.hash : null );
      transaction.modified = ( comment.modified ? comment.modified : null );

      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        //resolved(result);
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log('HyperLedgerClient.updateCommentTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteCommentTx = (id, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'DeleteCommentTx');
      transaction.id = id;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.deleteCommentTx(): reject');
        rejected(error);
      });
    }, rejected);
  };



  vm.getComment = (id, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.Comment')
      .then(registry => {
        return registry.resolve(id);
      }).then(comment => {
        resolved(comment);
      }).catch(error => {
        console.log('HyperLedgerClient.getComment(): reject');
        rejected(null);
      });
    }, rejected);
  };

  vm.getAllComments = (resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.Comment')
      .then(registry => {
        return registry.getAll();
      })
      .then(comments0 => {
        var comments = [];
        comments0.forEach( function( comment0 ){
          comments.push( comment0 );
        });
        resolved(comments);
      }).catch(error => {
        console.log('HyperLedgerClient.getAllComments(): reject');
        rejected(error);
      });
    }, rejected);
  };

  //. Not sophisticated enough yet ..
  vm.queryComments = ( keyword, resolved, rejected ) => {
    vm.getAllComments((comments0) => {
      var comments = [];
      comments0.forEach( function( comment0 ){
        if( comment0.id.indexOf( keyword ) > -1 || comment0.name.indexOf( keyword ) > -1 || comment0.body.indexOf( keyword ) > -1 ){
          comments.push( comment0 );
        }
      });
      resolved(comments);
    }, rejected);
  };

  vm.queryCommentsByCategory = ( category, resolved, rejected ) => {
    var where = 'category == _$category';
    var params = { category: category };
    vm.prepare(() => {
      var select = 'SELECT ' + NS + '.Comment WHERE (' + where + ')';
      var query = vm.businessNetworkConnection.buildQuery( select );

      return vm.businessNetworkConnection.query(query, params)
      .then(comments => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        var result = [];
        comments.forEach(comment => {
          //result.push(serializer.toJSON(item));
          //result.push( { id: item.id, name: item.name, type: item.type, body: item.body, amount: item.amout } );
          result.push(comment);
        });
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.queryCommentsByCategory(): reject');
        console.log( error );
        rejected(error);
      });
    }, rejected);
  };
}

module.exports = HyperledgerClient;
