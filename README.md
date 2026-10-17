# Server 1

Deploy `client/` as a Render Static Site and the project root as a separate Render Web Service. Set `API_BASE_URL` in `client/index.html` to the Web Service's HTTPS URL and set `CLIENT_ORIGIN` on the Web Service to the Static Site's exact HTTPS origin. The page's Insert button sends a bodyless `POST` to `/insert`; its SQL form sends a `GET` to `/query?sql=...`.

## Database permissions

Run `database-setup.sql` as a MySQL/MariaDB administrator. Replace each `replace-with-a-strong-...-password` value with a strong password, then use the matching values in the API's `.env`. The setup creates:

- `server1_writer`: `CREATE` on the database so the API can ensure its table exists, and `INSERT` on `records` only. It has no `DELETE`, `DROP`, or `UPDATE` privileges.
- `server1_reader`: `SELECT` on `server1.records` only. Visitor queries execute using this account, so MySQL itself rejects statements that require modification privileges.

The setup script initializes the schema and table so that the reader's table-level `SELECT` grant can be applied. If the table is later removed by an administrator, the insert endpoint can recreate it with its restricted writer account.

This setup file uses MySQL/MariaDB SQL, not Microsoft SQL Server (T-SQL). The workspace associates it with the MySQL language mode and recommends Oracle's MySQL Shell for VS Code. SQL Server IntelliSense diagnostics for this file are false positives caused by parsing the wrong dialect.

## Deploy on Render

1. Push this project to a GitHub repository.
2. Create a Render **Web Service** from that repository. Leave **Root Directory** blank (repository root), set **Build Command** to `npm install`, and set **Start Command** to `npm start`.
3. Add these environment variables in the Web Service's Render dashboard:

   - `CLIENT_ORIGIN`: the exact HTTPS origin Render assigns to the Static Site, e.g. `https://server1-client.onrender.com`
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`: connection details for a hosted MySQL/MariaDB database reachable from Render
   - `MYSQL_WRITER_USER`, `MYSQL_WRITER_PASSWORD`, `MYSQL_READER_USER`, `MYSQL_READER_PASSWORD`: the two restricted database accounts created by `database-setup.sql`

   Do not set `MYSQL_HOST=localhost`: on Render that means the Web Service container, not your computer or a separate database. Render's managed database offering is PostgreSQL, so use a MySQL/MariaDB provider accessible from Render or adapt the backend for PostgreSQL.
4. Create a Render **Static Site** from the same repository. Set **Root Directory** to `client`, leave **Build Command** empty, and set **Publish Directory** to `.`.
5. Copy the deployed Web Service's HTTPS URL into `API_BASE_URL` in `client/index.html`, commit and push the change, then redeploy the Static Site. Copy the Static Site's HTTPS origin into `CLIENT_ORIGIN` in the Web Service's environment variables and redeploy the Web Service.
6. Open the Static Site's HTTPS URL to test the page.

For local development, run `node server.js` in the project root and serve `client/` with VS Code Live Server. Set `CLIENT_ORIGIN=http://localhost:5500` in `.env`. Configure valid MySQL credentials before testing database requests.
