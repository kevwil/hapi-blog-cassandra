CREATE KEYSPACE IF NOT EXISTS mykeyspace WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};

USE mykeyspace;

CREATE TABLE IF NOT EXISTS posts (
  id int,
  content text,
  date timestamp,
  tags text,
  title text,
  PRIMARY KEY (id)
) WITH
  comment='Blog posts';

CREATE INDEX IF NOT EXISTS posts_title ON posts (title);

INSERT INTO posts (id, content, date, tags, title)
VALUES (1, 'hello world', '2014-01-14 10:00-0600', '#demo #hapi #nodejs', 'First Post');
