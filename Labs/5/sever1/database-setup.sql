CREATE DATABASE IF NOT EXISTS server1;
USE server1;

CREATE TABLE IF NOT EXISTS records (
  patientid INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dateOfBirth DATETIME NOT NULL
);

CREATE USER IF NOT EXISTS 'server1_writer'@'%'
  IDENTIFIED BY 'writerPassword';
CREATE USER IF NOT EXISTS 'server1_reader'@'%'
  IDENTIFIED BY 'readerPassword';

ALTER USER 'server1_writer'@'%'
  IDENTIFIED BY 'writerPassword';
ALTER USER 'server1_reader'@'%'
  IDENTIFIED BY 'readerPassword';

REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'server1_writer'@'%';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'server1_reader'@'%';

GRANT CREATE ON server1.* TO 'server1_writer'@'%';
GRANT INSERT ON server1.records TO 'server1_writer'@'%';
GRANT SELECT ON server1.records TO 'server1_reader'@'%';
