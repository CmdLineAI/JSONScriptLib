const fs = require("fs").promises;
const { exec } = require("child_process");
const axios = require("axios");

class JSONScript {
  constructor(jsonScript) {
    this.jsonScript = jsonScript;
    this.executionDescription = [];
    this.executionPlan = [];
    this.results = [];
    this.error = null;

    this.validateJSONScript();
    this.createExecutionPlan();
  }

  validateJSONScript() {
    if (!Array.isArray(this.jsonScript)) {
      throw new Error("JSONScript must be an array of objects.");
    }
    this.jsonScript.forEach((step, index) => {
      if (typeof step !== "object" || step === null) {
        throw new Error(`Step ${index + 1} is not a valid object.`);
      }
    });
  }

  createExecutionPlan() {
    this.jsonScript.forEach((step, index) => {
      if (step.comment) {
        this.executionDescription.push(`${step.comment}`);
      }
      if (step.cmd) {
        this.executionPlan.push(`Execute command: ${step.cmd}`);
      }
      if (step.file) {
        this.executionPlan.push(`Create file: ${step.file.name}`);
      }
    });
  }

  async executeCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  async execute() {
    for (const [index, step] of this.jsonScript.entries()) {
      try {
        if (step.cmd) {
          const result = await this.executeCommand(step.cmd);
          this.results.push({ step: index + 1, type: "cmd", result });
        } else if (step.file) {
          await fs.writeFile(step.file.name, step.file.data);
          this.results.push({
            step: index + 1,
            type: "file",
            result: `File ${step.file.name} created successfully.`,
          });
        }
      } catch (error) {
        this.error = error;
        return { results: this.results, error };
      }
    }
    return { results: this.results, error: this.error };
  }
}

module.exports = JSONScript;
