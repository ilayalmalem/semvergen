#! /usr/bin/env node
const config = require('./package.json');
const { exec } = require("child_process");
String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};
var semver;
(function (semver) {
    semver.versions = [];
    function seedVersions() {
        for (let index = 0; index <= 100; index++) {
            var base = '1.0.0';
            var buildNumber = base.split('.');
            var build = {
                MAJOR: buildNumber[0],
                MID: buildNumber[1],
                MINOR: buildNumber[2],
            };
            let v = base.lastIndexOf('0');
            base = base.replaceAt(v, `${index}`);
            semver.versions.push(`${base}`);
        }
        return semver.versions;
    }
    semver.seedVersions = seedVersions;
    function getNextVersion(version, method) {
        var v = semver.versions.indexOf(version);
        if (method === 'MINOR_PATCH')
            return semver.versions[++v];
    }
    semver.getNextVersion = getNextVersion;
})(semver || (semver = {}));
const [, , ...args] = process.argv;
if (args.includes('build') && args.includes('current')) {
    semver.seedVersions();
    var newVer = semver.getNextVersion(config.version, 'MINOR_PATCH');
    console.log('Commiting your work to github.');
    exec('git add .', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    exec(`git commit -m "${newVer}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    exec('git push origin master', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    console.log('Updating npm version.', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    exec(`npm version ${newVer}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    exec(`npm publish`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    console.log(semver.getNextVersion(config.version, 'MINOR_PATCH'));
}
