const fs = require("fs").promises;
const { spawn } = require("child_process");
const path = require("path");

class JSONScript {
  constructor(jsonScript) {
    this.jsonScript = jsonScript;
    this.executionDescription = [];
    this.executionPlan = [];
    this.results = [];
    this.error = null;
    this.cwd = process.cwd();

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
        this.executionPlan.push(`${step.cmd}`);
      }
      if (step.file) {
        this.executionPlan.push(`Create file: ${step.file.name}`);
      }
    });
  }

  executeCommand(cmd, isBackground) {
    return new Promise((resolve, reject) => {
      const cmdParts = cmd.split(" ");
      const mainCmd = cmdParts.shift();
      const options = {
        cwd: this.cwd,
        shell: true,
        detached: isBackground,
        stdio: isBackground ? "ignore" : "pipe",
      };
      const process = spawn(mainCmd, cmdParts, options);

      if (isBackground) {
        process.unref();
        resolve(`Started background task: ${cmd}`);
      } else {
        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        process.on("close", (code) => {
          if (code !== 0) {
            reject(stderr.trim());
          } else {
            resolve(stdout.trim());
          }
        });
      }
    });
  }

  async execute() {
    for (const [index, step] of this.jsonScript.entries()) {
      try {
        if (step.cmd) {
          const commands = step.cmd.split("&&").map((cmd) => cmd.trim());

          for (let command of commands) {
            if (command.startsWith("cd ")) {
              const newDir = command.slice(3).trim();
              const newCwd = path.resolve(this.cwd, newDir);

              if (newCwd !== this.cwd) {
                this.cwd = newCwd;
                this.results.push({
                  step: index + 1,
                  type: "cmd",
                  result: `Changed directory to ${this.cwd}`,
                });
              }
            } else {
              const isBackground = command.endsWith("&");
              const trimmedCommand = isBackground
                ? command.slice(0, -1).trim()
                : command;
              const result = await this.executeCommand(
                trimmedCommand,
                isBackground
              );
              this.results.push({ step: index + 1, type: "cmd", result });
            }
          }
        } else if (step.file) {
          const filePath = path.resolve(this.cwd, step.file.name);
          await fs.writeFile(filePath, step.file.data);
          this.results.push({
            step: index + 1,
            type: "file",
            result: `File ${filePath} created successfully.`,
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
