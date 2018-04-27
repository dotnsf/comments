//. app.js


var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    crypto = require( 'crypto' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    uuid = require( 'node-uuid' ),
    app = express();
var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

const HyperledgerClient = require( './hyperledger-client' );
const client = new HyperledgerClient();

app.set( 'superSecret', settings.superSecret );

var port = 3001; /*appEnv.port || 3000*/;

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

app.all( '/doc/*', basicAuth( function( user, pass ){
  return ( user === settings.basic_username && pass === settings.basic_password );
}));

app.use( express.static( __dirname + '/public' ) );

app.get( '/', function( req, res ){
  res.write( 'OK' );
  res.end();
});

var apiRoutes = express.Router();

apiRoutes.get( '/comment', function( req, res ){
  res.contentType( 'application/json' );
  var id = req.query.id;
  client.getComment( id, comment => {
    res.write( JSON.stringify( { status: true, comment: comment }, 2, null ) );
    res.end();
  }, error => {
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});


apiRoutes.post( '/comment', function( req, res ){
  res.contentType( 'application/json' );
  var id = req.body.id;
  var category = req.body.category;
  var name = req.body.name;
  var body = req.body.body;
  var source = req.body.source;
  var url = req.body.url;
  var hash = null; //req.body.hash;
  var modified = req.body.modified;

  generateHash( url ).then( function( value ){
    hash = value;

    client.getComment( id, comment0 => {
      //. 更新
      var comment1 = {
        id: id,
        category: ( category ? category : comment0.category ),
        name: ( name ? name : comment0.name ),
        body: ( body ? body : comment0.body ),
        source: ( source ? source : comment0.source ),
        url: ( url ? url : comment0.url ),
        hash: ( hash ? hash : comment0.hash ),
        modified: ( modified ? modified : comment0.modified )
      };
      client.updateCommentTx( comment1, result => {
        console.log( 'result(1)=' + JSON.stringify( result, 2, null ) );
        res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
        res.end();
      }, error => {
        console.log( error );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
        res.end();
      });
    }, error => {
      //. 新規作成
      if( category && name && body && modified ){
        var comment1 = {
          id: ( id ? id : uuid.v1() ),
          category: category,
          name: name,
          body: body,
          source: source,
          url: url,
          hash: hash,
          modified: modified
        };
        client.createCommentTx( comment1, result => {
          console.log( 'result(0)=' + JSON.stringify( result, 2, null ) );
          res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
          res.end();
        }, error => {
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
          res.end();
        });
      }else{
        //. 必須項目が足りない
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: 'Failed to create/update new comment.' }, 2, null ) );
        res.end();
      }
    });
  });
});

apiRoutes.get( '/comments', function( req, res ){
  res.contentType( 'application/json' );

  client.getAllComments( result => {
    var comments = [];
    var result0 = [];
    result.forEach( comment0 => {
      result0.push( { id: comment0.id, name: comment0.name, type: comment0.type, email: comment0.email, role: comment0.role, created: comment0.created, loggedin: comment0.loggedin } );
    });
    users = result0;

    res.write( JSON.stringify( users, 2, null ) );
    res.end();
  }, error => {
    res.status( 400 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

apiRoutes.post( '/queryComments', function( req, res ){
  res.contentType( 'application/json' );
  var keyword = req.body.keyword;
  client.queryComments( keyword, result => {
    var comments0 = [];
    result.forEach( comment0 => {
      comments0.push( { id: comment0.id, name: comment0.name, type: comment0.type, email: comment0.email, role: comment0.role, created: comment0.created, loggedin: comment0.loggedin } );
    });
    res.write( JSON.stringify( comments0, 2, null ) );
    res.end();
  });
});

apiRoutes.delete( '/comment', function( req, res ){
  res.contentType( 'application/json' );
  var id = req.body.id;

  client.deleteComment( id, result => {
    res.write( JSON.stringify( { status: true }, 2, null ) );
    res.end();
  }, error => {
    res.status( 404 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});


function generateHash( url ){
  return new Promise( function( resolve, reject ){
    if( url ){
      var options = {
        url: url,
        method: 'GET'
      };
      request( options, ( err, res, body ) => {
        if( err ){
          resolve( null );
        }else{
          //. hash 化
          var sha512 = crypto.createHash( 'sha512' );
          sha512.update( body );
          var hash = sha512.digest( 'hex' );
          resolve( hash );
        }
      });
    }else{
      resolve( null );
    }
  });
}


app.use( '/api', apiRoutes );

app.listen( port );
console.log( "server starting on " + port + " ..." );
