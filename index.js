#! /usr/bin/env node
var config = require("./package.json");
var exec = require("child_process").exec;
var inquirer = require("inquirer");
function sleep(time) {
    return new Promise(function (resolve) { return setTimeout(resolve, time); });
}
String.prototype.replaceAt = function (index, replacement) {
    return (this.substr(0, index) +
        replacement +
        this.substr(index + replacement.length));
};
var semver;
(function (semver) {
    semver.versions = [];
    function seedVersions() {
        for (var index = 0; index <= 100; index++) {
            var base = "1.0.0";
            var buildNumber = base.split(".");
            var build = {
                MAJOR: buildNumber[0],
                MID: buildNumber[1],
                MINOR: buildNumber[2],
            };
            var v = base.lastIndexOf("0");
            base = base.replaceAt(v, "" + index);
            semver.versions.push("" + base);
        }
        return semver.versions;
    }
    semver.seedVersions = seedVersions;
    function getNextVersion(version, method) {
        var v = semver.versions.indexOf(version);
        var buildNumber = version.split('.');
        if (method === "PATCH") {
            var patch = parseInt(buildNumber[2]);
            return buildNumber[0] + "." + buildNumber[1] + "." + ++patch;
        }
        else if (method === "MINOR") {
            var minor = parseInt(buildNumber[1]);
            return buildNumber[0] + "." + ++minor + "." + 0;
        }
        else if (method === "MAJOR") {
            var major = parseInt(buildNumber[0]);
            return ++major + "." + 0 + "." + 0;
        }
    }
    semver.getNextVersion = getNextVersion;
})(semver || (semver = {}));
var _a = process.argv, args = _a.slice(2);
if (args.includes('current')) {
    var version = config.version;
    console.log("\n  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2564\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551 Current version \u2502 v" + version + " \u2551\n  \u2551\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2551\n  \u2551 Next Patch      \u2502 v" + semver.getNextVersion(version, 'PATCH') + " \u2551          \n  \u2551\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2551       \n  \u2551 Next Minor      \u2502 v" + semver.getNextVersion(version, 'MINOR') + " \u2551\n  \u2551\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2551\n  \u2551 Next major      \u2502 v" + semver.getNextVersion(version, 'MAJOR') + " \u2551\n  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2567\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n  ");
}
if (args.includes("publish")) {
    semver.seedVersions();
    var supplied = false;
    switch (args[1]) {
        case 'patch':
            var newVer = semver.getNextVersion(config.version, 'PATCH');
            break;
        case 'minor':
            var newVer = semver.getNextVersion(config.version, 'MINOR');
            break;
        case 'major':
            var newVer = semver.getNextVersion(config.version, 'MAJOR');
            break;
        default:
            console.error('Supply a release type. patch | minor | major');
            process.exit(1);
    }
    console.log(newVer);
    console.log("Commiting your work to github.");
    exec("git add .", function (error, stdout, stderr) {
        inquirer
            .prompt([
            { type: "input", name: "message", message: "Type commit message" },
        ])
            .then(function (message) {
            setTimeout(function () { }, 1);
            exec("git commit -m " + message.message + " -m " + newVer, function (error, stdout, stderr) {
                exec("git push", function (error, stdout, stderr) {
                    console.log("Publishing to NPM....");
                    exec("npm version " + newVer, function (error, stdout, stderr) {
                        exec("npm publish");
                    });
                });
            });
        });
    });
}
