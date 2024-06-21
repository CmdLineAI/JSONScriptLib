const JSONScript = require("./index");
const os = require("os");
const path = require("path");
const fs = require("fs").promises;

const test = [
  {
    comment:
      "Create a C++ source file named 'hello.cpp' with the 'Hello, World!' program.",
    file: {
      name: "hello.cpp",
      data: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
    },
  },
  {
    comment:
      "Compile the 'hello.cpp' file to create an executable named 'hello'.",
    cmd: "g++ hello.cpp -o hello",
  },
  {
    comment:
      "Run the 'hello' executable to print 'Hello, World!' to the terminal.",
    cmd: "./hello",
  },
];

async function testJSONScript() {
     const script = new JSONScript(test);
     const { results, error } = await script.execute();
     console.log(results, error);
}

testJSONScript();