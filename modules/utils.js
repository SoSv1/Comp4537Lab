const EnglishMessages = require("../lang/en/en");
const fs = require("node:fs/promises");
const path = require("node:path");

class DateMessage {
  static escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  }

  static getDate(name) {
    const greeting = EnglishMessages.getDateGreeting().replace(
      "%1",
      DateMessage.escapeHtml(name)
    );
    const serverDate = new Date().toString();
    return `<p style="color: blue;">${greeting} ${serverDate}</p>`;
  }
}

class TextFileStore {
  constructor(directory = path.join(__dirname, "..", "data")) {
    this.directory = directory;
  }

  getFilePath(filename) {
    if (
      !filename ||
      filename === "." ||
      filename === ".." ||
      filename !== path.basename(filename)
    ) {
      throw new Error("Invalid file name.");
    }
    return path.join(this.directory, filename);
  }

  async appendLine(filename, text) {
    await fs.mkdir(this.directory, { recursive: true });
    await fs.appendFile(this.getFilePath(filename), `${text}\n`, "utf8");
  }

  async readFile(filename) {
    return fs.readFile(this.getFilePath(filename), "utf8");
  }
}

module.exports = { DateMessage, TextFileStore };
