#!/usr/bin/env node
import { Folder } from "./Models/Folder";
import { File } from "./Models/File";
import fs from 'fs';
import { resolve } from "dns";
import { fips } from "crypto";
const testFolder = './';
var showdown = require('showdown'),
  converter = new showdown.Converter();

var foldersToIgnore = [".git"];
var filesToIgnore = ['.gitignore'];


var root: Folder = { name: "root", files: new Array(), folders: new Array(), path: './' }
createFileForFolder(root);

async function createFileForFolder(folder: Folder) {
  fs.promises.readdir(folder.path, { withFileTypes: true })
    .then((dirent) => {
      dirent.forEach(dirent => {
        if (dirent.isDirectory()) {
          var innerFolder: Folder = { name: dirent.name, files: new Array(), folders: new Array(), path: folder.path + dirent.name + '/' }
          if (!foldersToIgnore.includes(innerFolder.name)) {
            folder.folders.push(innerFolder);
          }
        }
        else if (dirent.isFile()) {
          var file: File = { name: dirent.name, content: "", path: folder.path + dirent.name }
          fs.open(file.path, 'r', (err, fd) => {
            if (err) {
              if (err.code === 'ENOENT') {
                return;
              }
              throw err;
            }
            Promise.all([readFile(file)]

            )
            readFile(file);
          });
          if (file.name.includes(".md")) {
            folder.files.push(file);
          }
        }
      });
      var filePromise = folder.files.map((file) => readFile(file));
      Promise.all(filePromise)
        .then((files) => {
          concatenateFiles(files, folder);
        })
        .then(() => {
          convertMarkdownToHtml();
        });
      folder.folders.forEach(element => {
        createFileForFolder(element);
      });
    })
    .catch(error => {
      console.log(error);
    });
}

function readFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    fs.promises.readFile(file.path)
      .then((data) => {
        file.content = data.toString();
        resolve(file);
      })
      .catch((error) => {
        reject(error);
      });
  })
}

function concatenateFiles(files: File[], folder: Folder): Promise<string> {
  return new Promise((resolve, reject) => {
    var fileName = folder.name + ".html"
    var concatChildLinks = "";
    folder.folders.forEach(element => {
      var childLink = "[" + element.name + "](" + element.name + ".html" + ") \n";
      concatChildLinks = concatChildLinks.concat(childLink);
    });

    var fileContent = converter.makeHtml(concatChildLinks + "# " + folder.name + "\n");
    fs.promises.appendFile(fileName, fileContent)
      .then(() => {
        var filesPromises = files.map((file) => appendFileContent(file, fileName));
        filesPromises.reduce((p, fn) => p.then(() => fn), Promise.resolve());
      })
  });
}

function appendFileContent(file: File, fileName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    var fileContent = converter.makeHtml("# " + file.name + "\n" + file.content);
    fs.promises.appendFile(fileName, fileContent).then(() => {
      resolve("end");
    }).catch(() => { reject("fail") })
  })
}
