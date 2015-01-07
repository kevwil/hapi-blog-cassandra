var util = require('util'),
    assert = require('assert'),
    Joi = require('joi'),
    Boom = require('boom'),
    Hapi = require('hapi'),
    server = new Hapi.Server({connections: {routes: {cors: true}}}),
    cassandra = require('cassandra-driver'),
    client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'mykeyspace'});

server.connection({port:8080});
server.views({
    engines: { html: require('handlebars')},
    path: 'templates'
});

server.register({register: require('lout'), options: { endpoint: '/docs' }}, function (err) {
  if (err) {
    console.error('Failed loading plugin: lout');
  }
});

server.route([{
  method: 'GET',
  path: '/status',
  handler: function(request,reply) {
    reply('ok');
  }
}, {
  method: 'GET',
  path: '/favicon.ico',
  handler: function(request,reply) {
    reply(Boom.notFound());
  }
}, {
  method: 'GET',
  path: '/blog',
  handler: function(request,reply) {
    client.execute("SELECT * FROM posts", function(err,results){
      assert.ifError(err);
      reply.view('posts.html', {results: results});
    });
  }
}, {
  method: 'GET',
  path: '/blog/{title}',
  config: {
    handler: function(request,reply) {
      client.execute("SELECT * FROM posts WHERE title = ?", [request.params.title], function(err,result){
          assert.ifError(err);
          if(result.length < 1){
            reply(new Error('no results'));
          }else{
            reply.view('post.html', result[0]);
          }
      });
    },
    validate: {
      params: {
        title: Joi.string().required()
      }
    }
  }
}, {
  method: 'GET',
  path: '/{name}',
  config: {
    handler: function(request,reply) {
      var greet = 'nice' in request.query && request.query.nice === 'true' ? 'Hello ' : 'Piss off ';
      reply.view('index.html', {greeting: greet + request.params.name});
    },
    validate: {
      params: {
        name: Joi.string().required()
      },
      query: {
        nice: Joi.boolean().allow(null)
      }
    }
  }
}, {
  method: 'GET',
  path: '/',
  handler: function(request,reply) {
      reply.view('index.html', {greeting: 'Hello Anonymous Coward!'});
  }
}]);

server.start( function() {
  console.log('Hapi server started at: ' + server.info.uri);
});
