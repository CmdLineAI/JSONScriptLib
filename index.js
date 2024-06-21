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
    this.initialCwd = process.cwd();
    this.cwd = this.initialCwd;

    this.#validateJSONScript();
    this.#createExecutionPlan();
  }

  async execute() {
    for (const [index, step] of this.jsonScript.entries()) {
      const success = await this.#executeSteps(step, index);
      if (!success) {
        return { results: this.results, error: this.error };
      }
    }
    return { results: this.results, error: this.error };
  }

  #validateJSONScript() {
    if (!Array.isArray(this.jsonScript)) {
      throw new Error("JSONScript must be an array of objects.");
    }
    this.jsonScript.forEach((step, index) => {
      if (typeof step !== "object" || step === null) {
        throw new Error(`Step ${index + 1} is not a valid object.`);
      }
    });
  }

  #createExecutionPlan() {
    this.jsonScript.forEach((step) => {
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

  async #executeCommand(cmd) {
    const cmdParts = this.#getCommandParts(cmd);
    const options = this.#getCommandOptions(false);
    const process = spawn(cmdParts.mainCmd, cmdParts.args, options);

    return this.#handleProcess(process);
  }

  async #executeBackgroundCommand(cmd) {
    const cmdParts = this.#getCommandParts(cmd.slice(0, -1).trim());
    const options = this.#getCommandOptions(true);
    const process = spawn(cmdParts.mainCmd, cmdParts.args, options);

    process.unref();
    console.log(`Backgrounded task: ${cmd} with PID: ${process.pid}`); // Inform the user about background task
    return `Backgrounded task: ${cmd}`;
  }

  #getCommandParts(cmd) {
    const cmdParts = cmd.trim().split(" ");
    return {
      mainCmd: cmdParts.shift(),
      args: cmdParts,
    };
  }

  #getCommandOptions(isBackground) {
    return {
      cwd: this.cwd,
      shell: true,
      detached: isBackground,
      stdio: isBackground ? "ignore" : "pipe",
    };
  }

  #handleProcess(process) {
    return new Promise((resolve, reject) => {
      //console.log(`PID: ${process.pid} - Execution started`);
      process.stdout.on("data", (data) => {
        process.stdout.write(data); // Stream the data directly to stdout
      });

      process.stderr.on("data", (data) => {
        process.stderr.write(data); // Stream the data directly to stderr
      });

      process.on("close", (code) => {
        //console.log(`PID: ${process.pid} - Completed with code: ${code}`);
        if (code !== 0) {
          reject(`Command failed with exit code ${code}`);
        } else {
          resolve(`Command succeeded with exit code ${code}`);
        }
      });
    });
  }

  async #changeDirectory(command) {
    const newDir = command.slice(3).trim();
    const newCwd = path.resolve(this.cwd, newDir);

    if (newCwd !== this.cwd) {
      this.cwd = newCwd;
      return `Changed directory to ${this.cwd}`;
    }
  }

  async #createFile(step) {
    const filePath = path.resolve(this.initialCwd, step.file.name);
    await fs.writeFile(filePath, step.file.data);
    return `File ${filePath} created successfully.`;
  }

  async #processCommand(command, index) {
    if (command.startsWith("cd ")) {
      const result = await this.#changeDirectory(command);
      if (result) {
        this.results.push({ step: index + 1, type: "cmd", result });
      }
    } else {
      const isBackground = command.endsWith("&");
      const result = isBackground
        ? await this.#executeBackgroundCommand(command)
        : await this.#executeCommand(command);
      this.results.push({ step: index + 1, type: "cmd", result });
    }
  }

  async #executeSteps(step, index) {
    try {
      if (step.cmd) {
        const commands = step.cmd.split("&&").map((cmd) => cmd.trim());
        for (let command of commands) {
          await this.#processCommand(command, index);
        }
      } else if (step.file) {
        const result = await this.#createFile(step);
        this.results.push({ step: index + 1, type: "file", result });
      }
    } catch (error) {
      this.error = error;
      return false;
    }
    return true;
  }
}

module.exports = JSONScript;
