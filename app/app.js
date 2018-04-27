//. app.js

var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    i18n = require( 'i18n' ),
    jwt = require( 'jsonwebtoken' ),
    request = require( 'request' ),
    session = require( 'express-session' ),
    app = express();
var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

var port = appEnv.port || 3000;

app.set( 'superSecret', settings.superSecret );

app.use( multer( { dest: './tmp/' } ).single( 'data' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

app.use( session({
  secret: settings.superSecret,
  resave: false,
  saveUnitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,  //. https で使う場合は true
    maxage: 1000 * 60 * 60   //.  60min
  }
}) );

app.all( '/*', basicAuth( function( user, pass ){
  return ( user === settings.basic_username && pass === settings.basic_password );
}));

app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/public' );
app.set( 'view engine', 'ejs' );

/* i18n */
i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales'
});
app.use( i18n.init );

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

app.get( '/comments', function( req, res ){
  var limit = ( req.query.limit ? req.query.limit : 0 );
  var skip = ( req.query.skip ? req.query.skip : 0 );

  var json1 = {};
  if( limit ){ json1['limit'] = limit; }
  if( skip ){ json1['skip'] = skip; }
  var options1 = {
    url: settings.api_url + '/comments',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    json: json1
  };
  request( options1, ( err1, res1, comments1 ) => {
    res.contentType( 'application/json' );
    if( err1 ){
      console.log( err1 );
      res.status( 403 );
      res.write( JSON.stringify( err1, 2, null ) );
      res.end();
    }else{
      res.write( JSON.stringify( comments1, 2, null ) );
      res.end();
    }
  });
});

app.post( '/comment', function( req, res ){
  var json1 = {};
  if( req.body.id ){ json1['id'] = req.body.id; }
  if( req.body.category ){ json1['category'] = req.body.category; }
  if( req.body.name ){ json1['name'] = req.body.name; }
  if( req.body.body ){ json1['body'] = req.body.body; }
  if( req.body.source ){ json1['source'] = req.body.source; }
  if( req.body.url ){ json1['url'] = req.body.url; }
  if( req.body.hash ){ json1['hash'] = req.body.hash; }
  if( req.body.modified ){ json1['modified'] = new Date( req.body.modified ); }
  var options1 = {
    url: settings.api_url + '/comment',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: json1
  };
  request( options1, ( err1, res1, comment1 ) => {
    res.contentType( 'application/json' );
    if( err1 ){
      console.log( err1 );
      res.status( 403 );
      res.write( JSON.stringify( err1, 2, null ) );
      res.end();
    }else{
      //console.log( comment1 );
      res.write( JSON.stringify( comment1, 2, null ) );
      res.end();
    }
  });
});

app.delete( '/comment', function( req, res ){
  var json1 = {};
  if( req.body.id ){ json1['id'] = req.body.id; }
  var options1 = {
    url: settings.api_url + '/comment',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    json: json1
  };
  request( options1, ( err1, res1, comment1 ) => {
    res.contentType( 'application/json' );
    if( err1 ){
      console.log( err1 );
      res.status( 403 );
      res.write( JSON.stringify( err1, 2, null ) );
      res.end();
    }else{
      //console.log( comment1 );
      res.write( JSON.stringify( comment1, 2, null ) );
      res.end();
    }
  });
});



app.listen( port );
console.log( "server starting on " + port + " ..." );
