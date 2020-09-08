#! /usr/bin/env node
const config = require('./package.json')
const { exec } = require("child_process");


declare interface String {
    replaceAt(index, replacement) : string;
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};


namespace semver {
    export const versions = []
    export function seedVersions() {
        for (let index = 0; index <= 100; index++) {
            var base: String = '1.0.0'
            var buildNumber = base.split('.')
            var build = {
                MAJOR:buildNumber[0],
                MID:buildNumber[1],
                MINOR:buildNumber[2],
            }
            let v: number = base.lastIndexOf('0');
            base = base.replaceAt(v, `${index}`)
            versions.push(`${base}`)
        }
        return versions
    }

    export function getNextVersion(version, method) {
        var v = versions.indexOf(version);
        if(method === 'MINOR_PATCH') return versions[++v]
    }

}

const [,, ...args] = process.argv

if(args.includes('build') && args.includes('current')) {
    semver.seedVersions()
    var newVer = semver.getNextVersion(config.version,'MINOR_PATCH');
    console.log('Commiting your work to github.')
    exec('git add .', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    exec(`git commit -m "${newVer}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    exec('git push origin master', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    console.log('Updating npm version.', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })

    exec(`npm version ${newVer}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    exec(`npm publish`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    console.log(semver.getNextVersion(config.version,'MINOR_PATCH'))
}
