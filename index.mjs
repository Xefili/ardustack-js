/*
    ArduStack programming language compiler.
    @Author: Henry Schütterle
    @Description: ArduStack compiler
*/

import fs from 'node:fs';

const KEYWORDS = {
    pause: "delay",
    setPin: "pinMode"
}
const KEYWORDSaswell = ["pause", "setPin"]

var file = []
var fileWithLF = fs.readFileSync("code.arduStack", "utf-8");
var fileWithWhitespace = fileWithLF.split("\n");
for(let i=0; i<fileWithWhitespace.length; i++) {
    file.push(fileWithWhitespace[i].trim());
}
var res = "";

function STRINGdetectArgs(file, isBracketed, isLibrary) {
    if(isBracketed) {
        let args = file.match(/\((\w+(, \w+)?)\)/g)
            .toString().replace(/\(/g, "")
            .replace(/\)/g, "")
            .replace(",", " ")
            .split(" ");
        return args
    } else {
        if(isLibrary) {
            let args = file.split("::");
            return args
        }
        let args = file.split(" ");
        return args
    }
}

/*
*
* @param {string} line - current line to be read
* @return Detected command
*/
function detectCommand(line) {
    if(line.match(/((int)|(float)|(boolean)|(char)|(byte)|(String)) \w+ = \w+ ./)) {
        return "variable"
    }
    if(line.match(/if .+ {/)) {
        return "if-statement"
    }
    if(line.match(/import \w+/)) {
        return "import"
    }
    if(line.match(/> \(\w+\) \w+\((\w+(, \w+)?)?\) ?{/)) {
        return "function"
    }
    if(line.match(/\w+::\w+ \w+ ./)) {
        return "lib"
    }
    if(line.match(/(\w+) (\w+ )*./)) {
        return "method"
    }
    if(line.match(/!\(.+\)/)) {
        return "native"
    }
}

var line;
for(line=0; line<file.length; line++) {
    let type = detectCommand(file[line]);
    console.log(type);
        if(type=="function") {
            let arg = STRINGdetectArgs(file[line], true);
            res += (arg[0] + " ");
            res += (file[line].match(/\w+/g)[1]);
            res += "(";
            if(arg.length == 0) {
                res += "()";
            } else {
                for(var a=1; a<arg.length; a++) {
                    res += arg[a];
                    if(a==arg.length-1) {
                        res += ","
                    }
                }
            }
            res += ") {\n";
        }
        if(type=="lib") {
            let arg1 = STRINGdetectArgs(file[line], false, true);
            res += arg1[0] + ".";
            let args = file[line].split("::")[1].replace(".", "").trim().split(" ");
            console.log(args);
            res += args[0];
            if(args.length == 1) {
                res += "()";
            } else {
                res += "("
                for(var i = 1; i<args.length; i++) {
                    res += args[i];
                    if(i != args.legnth) {
                        res += ", ";
                    }
                }
                res = res.replace(/,\s*$/, "");
            } res += ");\n"
        }
        if(type=="method") {
            let args = file[line].replace(".", "").trim().split(" ");
            if(KEYWORDSaswell.includes(args[0])) {
                let str = "" + args[0];
                res += eval(`KEYWORDS.${str}`);
            } else {
                res += args[0];
            }
            if(args.length == 1) {
                res += "()";
            } else {
                res += "("
                for(var i = 1; i<args.length; i++) {
                    res += args[i];
                    if(i != args.legnth) {
                        res += ", ";
                    }
                }
                res = res.replace(/,\s*$/, "");
            } res += ");\n"
        }
        if(file[line] == "}") {res += "}\n"}
        if(type=="import") {
            res += `#import <${file[line].split(" ")[1]}.h>\n`
        }
        if(type=="native") {
            let args = file[line].replace("!", "").replace(/\(/, "").replace(/\)/, "");
            res += args;
            res += ";\n"
        }
        if(type=="if-statement") {
            let args = file[line].replace("{", "").trim().split(" ");
            res += "if("
            for(let u=1; u<args.length; u++) {
                res += args[u] + " ";
            }
            res += ") {"
        }
        if(type=="variable") {
            let modifiedString = file[line].replace(".", "").trim().concat(";");
            res += modifiedString;
        }
    }

console.log(res);
fs.writeFileSync('code.ino', res);