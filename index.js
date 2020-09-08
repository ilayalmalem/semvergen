#! /usr/bin/env node
const config = require("./package.json");
const { exec } = require("child_process");
const inquirer = require("inquirer");
String.prototype.replaceAt = function (index, replacement) {
    return (this.substr(0, index) +
        replacement +
        this.substr(index + replacement.length));
};
var semver;
(function (semver) {
    semver.versions = [];
    function seedVersions() {
        for (let index = 0; index <= 100; index++) {
            var base = "1.0.0";
            var buildNumber = base.split(".");
            var build = {
                MAJOR: buildNumber[0],
                MID: buildNumber[1],
                MINOR: buildNumber[2],
            };
            let v = base.lastIndexOf("0");
            base = base.replaceAt(v, `${index}`);
            semver.versions.push(`${base}`);
        }
        return semver.versions;
    }
    semver.seedVersions = seedVersions;
    function getNextVersion(version, method) {
        var v = semver.versions.indexOf(version);
        if (method === "MINOR_PATCH")
            return semver.versions[++v];
    }
    semver.getNextVersion = getNextVersion;
})(semver || (semver = {}));
const [, , ...args] = process.argv;
if (args.includes("build") && args.includes("current")) {
    semver.seedVersions();
    var newVer = semver.getNextVersion(config.version, "MINOR_PATCH");
    console.log("Commiting your work to github.");
    exec("git add .", (error, stdout, stderr) => {
        if (error) {
            return;
        }
        if (stderr) {
            return;
        }
        inquirer
            .prompt([
            { type: "input", name: "message", message: "Type commit message" },
        ])
            .then((message) => {
            exec(`git commit -m "${newVer}" -m "${message}"`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
                exec("git push origin master", (error, stdout, stderr) => {
                    if (error) {
                        return;
                    }
                    if (stderr) {
                        return;
                    }
                });
            });
        })
            .then(() => {
            exec(`npm version ${newVer}`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
            });
            exec(`npm publish`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
            });
        });
    });
}
