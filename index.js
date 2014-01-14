var helenus = require('helenus'),
    pool = new helenus.ConnectionPool({
      hosts: ['localhost:9160'],
      keyspace: 'mykeyspace',
      timeout: 3000
    });

var util = require('util');

pool.on('error', function(err){
  console.error(err.name, err.message);
});

var Hapi = require('hapi');
var serverOpts = {
  views: {
    path: 'templates',
    engines: {
      html: 'handlebars'
    }
  },
  cors: true
};

function row2object(row){
  return {
    id: row.get('id').value,
    title: row.get('title').value,
    tags: row.get('tags').value,
    content: row.get('content').value,
    date: row.get('date').value
  };
}

function results2array(results){
  var output = [];
  results.forEach(function(row){
    output.push(row2object(row));
  });
  return output;
}

var server = Hapi.createServer('localhost', 8080, serverOpts);
server.pack.require('lout', { endpoint: '/docs' }, function (err) {
  if (err) {
    console.error('Failed loading plugin: lout');
  }
});

server.route([{
  method: 'GET',
  path: '/status',
  handler: function() {
    reply('ok');
  }
}, {
  method: 'GET',
  path: '/favicon.ico',
  handler: function() {
    this.reply().code(404);
  }
}, {
  method: 'GET',
  path: '/blog',
  handler: function(request) {
    pool.connect(function(err,keyspace){
      if(err){
        throw(err);
      }else{
        // ORDER BY date DESC
        pool.cql("SELECT * FROM posts", function(err,results){
          if(err){
            throw(err);
          }else{
            request.reply.view('posts.html', {results: results2array(results)});
          }
        });
      }
    });
  }
}, {
  method: 'GET',
  path: '/blog/{title}',
  config: {
    handler: function(request) {
      pool.connect(function(err,keyspace){
        if(err){
          throw(err);
        }else{
          pool.cql("SELECT * FROM posts WHERE title = ?", [request.params.title], function(err,result){
            if(err){
              throw(err);
            }else{
              if(result.length < 1){
                request.reply(new Error('no results'));
              }else{
                request.reply.view('post.html', row2object(result[0]));
              }
            }
          });
        }
      });
    },
    validate: {
      path: {
        title: Hapi.types.String().required()
      }
    }
  }
}, {
  method: 'GET',
  path: '/{name}',
  config: {
    handler: function(request) {
      var greet = 'nice' in request.query && request.query.nice === 'true' ? 'Hello ' : 'Piss off ';
      request.reply.view('index.html', {greeting: greet + request.params.name});
    },
    validate: {
      path: {
        name: Hapi.types.String().required()
      },
      query: {
        nice: Hapi.types.Boolean().allow(null)
      }
    }
  }
}, {
  method: 'GET',
  path: '/',
  handler: function(request) {
    request.reply.view('index.html', {greeting: 'Hello Anonymous Coward!'});
  }
}]);

server.start( function() {
  console.log('Hapi server started at: ' + server.info.uri);
});

