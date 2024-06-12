# JSONScriptLib

**Version:** 0.1.0

JSONScriptLib is a library for executing JSONScript - a simple format for defining a sequence of steps including commands and file operations. This library allows you to validate and execute JSONScript objects, providing detailed execution descriptions and results.

## Installation

You can install JSONScriptLib via npm:

```bash
npm install jsonscriptlib
```

# Usage

Here is an example of how to use JSONScriptLib:

## Sample JSONScript

Create a JSON file (e.g., steps.json) containing your JSONScript configuration:
```
[
  {
    "comment": "Step 1: Install the required npm package 'axios' for downloading files.",
    "cmd": "npm install axios"
  },
  {
    "comment": "Step 2: Create a JavaScript file that will contain the code to download the file.",
    "file": {
      "name": "downloadFile.js",
      "data": "// This script downloads a file from a given URL\nconst axios = require('axios');\nconst fs = require('fs');\nconst url = 'https://example.com/file.txt';\nconst path = 'downloaded_file.txt';\naxios({\n  method: 'get',\n  url: url,\n  responseType: 'stream'\n}).then(function (response) {\n  response.data.pipe(fs.createWriteStream(path));\n  console.log('File downloaded successfully.');\n}).catch(function (error) {\n  console.log('Error downloading the file:', error);\n});"
    }
  },
  {
    "comment": "Step 3: Execute the JavaScript file to download the file from the given URL.",
    "cmd": "node downloadFile.js"
  },
  {
    "comment": "Step 4: Create a README file with instructions.",
    "file": {
      "name": "README.md",
      "data": "# Node.js File Downloader\nThis application downloads a file from a specified URL using Node.js.\n\n## Setup\n1. Install the required npm package:\n```\nnpm install axios\n```\n2. Run the script to download the file:\n```\nnode downloadFile.js\n```"
    }
  }
]
```

# Using JSONScriptLib
```
Create a Node.js script (e.g., test.js) to process the JSONScript file:
const JSONScript = require('jsonscriptlib');
const fs = require('fs');

// Load JSONScript from a file
const jsonScript = JSON.parse(fs.readFileSync('steps.json', 'utf-8'));

const script = new JSONScript(jsonScript);

console.log('Execution Description:', script.executionDescription);
console.log('Execution Plan:', script.executionPlan);

(async () => {
  const result = await script.execute();
  if (result.error) {
    console.error('Execution Error:', result.error);
  } else {
    console.log('Execution Results:', result.results);
  }
})();
```

Run the script using Node.js:
```
node test.js
```

# JSONScript Object

## The JSONScript object has the following properties:

 • executionDescription: An array of strings describing each step.
 • executionPlan: An array of strings showing the commands being executed and files being created.
 • execute(): An async function that runs all commands and creates files in order. It returns an object with the following properties:
 • results: An array of all results from each step completed successfully.
 • error: An error object if any command fails. An error will stop the completion of the JSONScript.

# Running Tests

To run the tests for JSONScriptLib, you can use the following command:

```bash
npm test
```

This will run the tests in the index.test.js file.

You can also use the --watch flag to run the tests in watch mode, which will automatically re-run the tests whenever a file changes:

```bash
npm test -- --watch
```

# Contribution

Feel free to contribute to the JSONScriptLib project. Fork the repository and submit a pull request with your improvements.

# License

This project is licensed under the MIT License.
```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```