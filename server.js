const http = require("node:http");
const { URL } = require("node:url");
const { DateMessage, TextFileStore } = require("./modules/utils");

class ApiServer {
  constructor(port = Number(process.env.PORT) || 3000) {
    this.port = port;
    this.basePath = "/COMP4537/labs/4";
    this.fileStore = new TextFileStore();
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  async handleRequest(request, response) {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );

    if (request.method !== "GET") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (requestUrl.pathname === `${this.basePath}/getDate/`) {
      this.handleGetDate(requestUrl, response);
      return;
    }

    if (requestUrl.pathname === `${this.basePath}/writeFile/`) {
      await this.handleWriteFile(requestUrl, response);
      return;
    }

    const readFilePrefix = `${this.basePath}/readFile/`;
    if (requestUrl.pathname.startsWith(readFilePrefix)) {
      await this.handleReadFile(requestUrl.pathname, readFilePrefix, response);
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }

  handleGetDate(requestUrl, response) {
    const name = requestUrl.searchParams.get("name");
    if (!name) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Please provide a name using the name query parameter.");
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(DateMessage.getDate(name));
  }

  async handleWriteFile(requestUrl, response) {
    const text = requestUrl.searchParams.get("text");
    if (text === null) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Please provide text using the text query parameter.");
      return;
    }

    try {
      await this.fileStore.appendLine("file.txt", text);
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Text appended to file.txt");
    } catch (error) {
      console.error("Unable to append to file.txt:", error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unable to write to file.txt");
    }
  }

  async handleReadFile(pathname, prefix, response) {
    let filename;
    try {
      filename = decodeURIComponent(pathname.slice(prefix.length));
    } catch {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid file name.");
      return;
    }

    if (!filename || filename.includes("/") || filename.includes("\\")) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Invalid file name: ${filename || "(empty)"}`);
      return;
    }

    try {
      const contents = await this.fileStore.readFile(filename);
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(contents);
    } catch (error) {
      if (error.code === "ENOENT") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(`File not found: ${filename}`);
        return;
      }

      console.error(`Unable to read ${filename}:`, error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Unable to read file: ${filename}`);
    }
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

new ApiServer().start();
