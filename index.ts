#! /usr/bin/env node
const config = require('./package.json')
const { exec } = require("child_process");
const inquirer = require('inquirer')


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
            return;
        }
        if (stderr) {
            return;
        }
    })

    inquirer.prompt([{type: 'input',name: 'message',message: 'Type commit message',},])
    .then(message => {
        console.log(message)
        exec(`git commit -m "${message}"`, (error, stdout, stderr) => {
            if (error) {
                return;
            }
            if (stderr) {
                return;
            }
            exec('git push origin master', (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
            })
        
            exec(`npm version ${newVer}`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
            })
            exec(`npm publish`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                    return;
                }
            })
        })
        
    });
}
