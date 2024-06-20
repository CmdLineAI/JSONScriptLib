const JSONScript = require("./index");
const os = require("os");
const path = require("path");
const fs = require("fs").promises;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("executes a simple script correctly", async () => {
  const platform = os.platform();
  const jsonScript = [
    { cmd: platform === "win32" ? "rmdir /s /q test-dir" : "rm -rf test-dir" },
    { cmd: "mkdir test-dir" },
    { cmd: "cd test-dir" },
    { cmd: "touch test-file2.txt" },
    { file: { name: "test-dir/test-file1.txt", data: "Hello, world!" } },
  ];

  const script = new JSONScript(jsonScript);
  const { results, error } = await script.execute();

  const testFile1Exists = await fileExists(
    path.resolve("test-dir/test-file1.txt")
  );
  const testFile2Exists = await fileExists(
    path.resolve("test-dir/test-file2.txt")
  );

  await fs.rm(path.resolve("test-dir"), { recursive: true, force: true });

  expect(error).toBeNull();
  expect(results).toHaveLength(5);
  expect(results[2].result).toContain("Changed directory to");
  expect(results[4].result).toContain("created successfully");
  expect(testFile1Exists).toBe(true);
  expect(testFile2Exists).toBe(true);
});

test("throws an error for an invalid JSONScript", () => {
  const jsonScript = "not an array";

  expect(() => new JSONScript(jsonScript)).toThrow(
    "JSONScript must be an array of objects."
  );
});

test("skips changing directory if already in the same directory", async () => {
  const currentDirectory = process.cwd();

  const jsonScript = [
    { cmd: `cd ${currentDirectory}` }, 
    { cmd: "cd ." }, 
  ];

  const script = new JSONScript(jsonScript);
  const { results, error } = await script.execute();

  console.log("Results:", results);
  console.log("Error:", error);

  expect(error).toBeNull();
  expect(results).toHaveLength(0); 
});