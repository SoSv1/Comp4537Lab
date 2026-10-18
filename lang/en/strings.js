
 // ChatGPT was used to help write this code.

class Strings {
    constructor() {
        // Page text
        this.PAGE_TITLE = "Server 1 — Database";

        // Insert section
        this.INSERT_HEADING = "Insert rows";
        this.INSERT_DESCRIPTION = "Each click inserts the sample rows again; existing rows are kept.";
        this.INSERT_BUTTON = "Insert";
        this.INSERT_DEFAULT = "No insert request yet.";

        // Query section
        this.QUERY_HEADING = "Read table data";
        this.QUERY_LABEL = "SQL query (read-only)";
        this.DEFAULT_QUERY = "SELECT * FROM patient";
        this.QUERY_BUTTON = "Submit query";
        this.QUERY_DEFAULT = "No query submitted yet.";

        // Response messages
        this.INSERTING = "Inserting rows...";
        this.RUNNING_QUERY = "Running query...";
        this.EMPTY_QUERY = "Enter a SQL query to run.";
        this.REQUEST_FAILED = "Request failed: ";
    }
}
