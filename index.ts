#! /usr/bin/env node
const config = require("./package.json");
const { exec } = require("child_process");
const inquirer = require("inquirer");

declare interface String {
  replaceAt(index, replacement): string;
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

String.prototype.replaceAt = function(index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

namespace semver {
  export const versions = [];
  export function seedVersions() {
    for (let index = 0; index <= 100; index++) {
      var base: String = "1.0.0";
      var buildNumber = base.split(".");
      var build = {
        MAJOR: buildNumber[0],
        MID: buildNumber[1],
        MINOR: buildNumber[2],
      };
      let v: number = base.lastIndexOf("0");
      base = base.replaceAt(v, `${index}`);
      versions.push(`${base}`);
    }
    return versions;
  }

  export function getNextVersion(version: String, method: String) {
    var v = versions.indexOf(version);
    var buildNumber = version.split('.');

    if (method === "PATCH") {var patch = parseInt(buildNumber[2]);return `${buildNumber[0]}.${buildNumber[1]}.${++patch}`}
    else if (method === "MINOR") {var minor = parseInt(buildNumber[1]);return `${buildNumber[0]}.${++minor}.${0}`}
    else if (method === "MAJOR") {var major = parseInt(buildNumber[0]);return `${++major}.${0}.${0}`}
  }
}

const [, , ...args] = process.argv;

if(args.includes('current')) {
  var version = config.version
  console.log(`
  ╔═════════════════╤═════════╗
  ║ Current version │ v${version} ║
  ║─────────────────┼─────────║
  ║ Next Patch      │ v${semver.getNextVersion(version,'PATCH')} ║          
  ║─────────────────┼─────────║       
  ║ Next Minor      │ v${semver.getNextVersion(version,'MINOR')} ║
  ║─────────────────┼─────────║
  ║ Next major      │ v${semver.getNextVersion(version,'MAJOR')} ║
  ╚═════════════════╧═════════╝
  `)
}


if (args.includes("publish")) {
  semver.seedVersions();
  var supplied = false;
  switch (args[1]) {
    case 'patch':
      supplied = true;
      var newVer = semver.getNextVersion(config.version,'PATCH')
      break;
    case 'minor':
      supplied = true;
      var newVer = semver.getNextVersion(config.version,'MINOR')
      break;
    case 'major':
      supplied = true;
      var newVer = semver.getNextVersion(config.version,'MAJOR')
      break;
    }
    if(supplied) {
      console.log(newVer)
      console.log("Commiting your work to github.");
      exec("git add .", (error, stdout, stderr) => {
        inquirer
          .prompt([
            { type: "input", name: "message", message: "Type commit message" },
          ])
          .then((message) => {
            setTimeout(() => {},1)
            exec(
              `git commit -m ${message.message} -m ${newVer}`,
              (error, stdout, stderr) => {
                exec("git push", (error, stdout, stderr) => {
                  console.log("Publishing to NPM....");
                  exec(`npm version ${newVer}`, (error, stdout, stderr) => {
                    exec("npm publish");
                  });
                });
              }
            );
          });
      });
    }
  }
