# my Hapi/Cassandra demo blog app

### Learning Hapi and Cassandra, not making a good blogging app.

### Cassandra Schema used:

    CREATE KEYSPACE mykeyspace WITH replication = {
      'class': 'SimpleStrategy',
      'replication_factor': '1'
    };

    USE mykeyspace;

    CREATE TABLE posts (
      id int,
      content text,
      date timestamp,
      tags text,
      title text,
      PRIMARY KEY (id)
    ) WITH
      comment='Blog posts';

    CREATE INDEX posts_title ON posts (title);

    INSERT INTO posts (id, content, date, tags, title)
    VALUES (1, 'hello world', '2014-01-14 10:00-0600', '#demo #revel #go', 'First Post');

### Setup / Dependencies

Just run `npm install .` from the root of the app - this assumes you have Node.js installed and a running Cassandra instance.

#### LICENSE

Copyright © 2014 Kevin Williams

MIT License

