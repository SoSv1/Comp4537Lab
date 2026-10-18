const API_BASE_URL = 'https://cmorris.xyz/COMP4537/labs/5';
const insertButton = document.getElementById('insert-button');
const insertResponse = document.getElementById('insert-response');
const queryButton = document.getElementById('query-button');
const queryResponse = document.getElementById('query-response');
const sqlInput = document.getElementById('sql-query');

insertButton.addEventListener('click', async () => {
  insertResponse.textContent = 'Inserting rows...';
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients`, { method: 'POST' });
    const result = await response.json();
    insertResponse.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    insertResponse.textContent = `Request failed: ${error.message}`;
  }
});

queryButton.addEventListener('click', async () => {
  queryResponse.textContent = 'Running query...';
  try {
    const sql = sqlInput.value.trim();
    if (!sql) {
      queryResponse.textContent = 'Enter a SQL query to run.';
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/sql/${encodeURIComponent(sql)}`
    );
    const result = await response.json();
    queryResponse.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    queryResponse.textContent = `Request failed: ${error.message}`;
  }
});
