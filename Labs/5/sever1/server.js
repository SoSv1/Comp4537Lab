const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const port = Number(process.env.PORT) || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5500';
const databaseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE || 'server1',
  waitForConnections: true,
  connectionLimit: 5,
  multipleStatements: false
};

const insertRows = [
  { name: 'Sara Brown', dateOfBirth: '1901-01-01' },
  { name: 'John Smith', dateOfBirth: '1941-01-01' },
  { name: 'Jack Ma', dateOfBirth: '1961-01-30' },
  { name: 'Elon Musk', dateOfBirth: '1999-01-01' }
];

const writerPool = mysql.createPool({
  ...databaseConfig,
  user: process.env.MYSQL_WRITER_USER || 'server1_writer',
  password: process.env.MYSQL_WRITER_PASSWORD || ''
});
const readerPool = mysql.createPool({
  ...databaseConfig,
  user: process.env.MYSQL_READER_USER || 'server1_reader',
  password: process.env.MYSQL_READER_PASSWORD || ''
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && origin !== clientOrigin) {
    return false;
  }

  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', clientOrigin);
    response.setHeader('Vary', 'Origin');
  }
  return true;
}

async function insertRecords() {
  const connection = await writerPool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS records (
        patientid INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dateOfBirth DATETIME NOT NULL
      )
    `);

    await connection.beginTransaction();
    const ids = [];
    for (const row of insertRows) {
      const [result] = await connection.execute(
        'INSERT INTO records (name, dateOfBirth) VALUES (?, ?)',
        [row.name, row.dateOfBirth]
      );
      ids.push(result.insertId);
    }
    await connection.commit();
    return ids;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Insert rollback failed:', rollbackError);
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function handleRequest(request, response) {
  if (!setCorsHeaders(request, response)) {
    sendJson(response, 403, { error: 'Origin is not allowed.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, 'http://localhost');

  if (request.method === 'POST' && requestUrl.pathname === '/insert') {
    try {
      const ids = await insertRecords();
      sendJson(response, 201, { message: `Inserted ${ids.length} rows.`, ids });
    } catch (error) {
      console.error('Insert failed:', error);
      sendJson(response, 500, { error: 'The rows could not be inserted.' });
    }
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/query') {
    const sql = requestUrl.searchParams.get('sql');
    if (!sql || !sql.trim()) {
      sendJson(response, 400, { error: 'Enter a SQL query to run.' });
      return;
    }

    try {
      const [rows] = await readerPool.execute(sql);
      sendJson(response, 200, { rows });
    } catch (error) {
      console.error('Query failed:', error.message);
      sendJson(response, 400, { error: `Query failed: ${error.message}` });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found.' });
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error('Request failed:', error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'The request could not be completed.' });
    } else {
      response.destroy();
    }
  });
});

server.listen(port, () => {
  console.log(`Server 1 API is listening on port ${port}`);
  if (!process.env.MYSQL_WRITER_PASSWORD || !process.env.MYSQL_READER_PASSWORD) {
    console.warn('Configure both MySQL account passwords in .env before using the database endpoints.');
  }
  if (!process.env.CLIENT_ORIGIN) {
    console.warn(`Using default client origin ${clientOrigin}; set CLIENT_ORIGIN in .env for your deployed frontend.`);
  }
});

function closeServer() {
  server.close(() => {
    Promise.all([writerPool.end(), readerPool.end()]).catch((error) => {
      console.error('Database pools could not close cleanly:', error);
    });
  });
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
