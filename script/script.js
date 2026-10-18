
// ChatGPT was used to help write this code.

class PatientApp {
    constructor() {
        this.apiBaseUrl = "https://cmorris.xyz/COMP4537/labs/5";
        this.strings = new Strings();

        this.insertButton = document.getElementById("insert-button");
        this.insertResponse = document.getElementById("insert-response");
        this.queryButton = document.getElementById("query-button");
        this.queryResponse = document.getElementById("query-response");
        this.sqlInput = document.getElementById("sql-query");

        // Set the text displayed on the page
        this.setPageText();

        // Set up button event listeners
        this.insertButton.addEventListener("click", () => {
            this.insertPatients();
        });

        this.queryButton.addEventListener("click", () => {
            this.runQuery();
        });
    }

    // Populate HTML elements with user-facing text
    setPageText() {
        document.title = this.strings.PAGE_TITLE;

        document.getElementById("page-heading").textContent =
            this.strings.PAGE_TITLE;

        document.getElementById("insert-heading").textContent =
            this.strings.INSERT_HEADING;

        document.getElementById("insert-description").textContent =
            this.strings.INSERT_DESCRIPTION;

        this.insertButton.textContent = this.strings.INSERT_BUTTON;
        this.insertResponse.textContent = this.strings.INSERT_DEFAULT;

        document.getElementById("query-heading").textContent =
            this.strings.QUERY_HEADING;

        document.getElementById("query-label").textContent =
            this.strings.QUERY_LABEL;

        this.sqlInput.value = this.strings.DEFAULT_QUERY;
        this.queryButton.textContent = this.strings.QUERY_BUTTON;
        this.queryResponse.textContent = this.strings.QUERY_DEFAULT;
    }

    // Send POST request to insert patients
    async insertPatients() {
        this.insertResponse.textContent = this.strings.INSERTING;

        try {
            const response = await fetch(
                `${this.apiBaseUrl}/api/v1/patients`,
                { method: "POST" }
            );

            const result = await response.json();

            this.insertResponse.textContent =
                JSON.stringify(result, null, 2);

        } catch (error) {
            this.insertResponse.textContent =
                this.strings.REQUEST_FAILED + error.message;
        }
    }

    // Send GET request to execute a SELECT query
    async runQuery() {
        const sql = this.sqlInput.value.trim();

        if (!sql) {
            this.queryResponse.textContent = this.strings.EMPTY_QUERY;
            return;
        }

        this.queryResponse.textContent = this.strings.RUNNING_QUERY;

        try {
            const response = await fetch(
                `${this.apiBaseUrl}/api/v1/sql/${encodeURIComponent(sql)}`
            );

            const result = await response.json();

            this.queryResponse.textContent =
                JSON.stringify(result, null, 2);

        } catch (error) {
            this.queryResponse.textContent =
                this.strings.REQUEST_FAILED + error.message;
        }
    }
}

// Create an instance of the application
const app = new PatientApp();
