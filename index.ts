#!/usr/bin/env node
import { Folder } from "./Models/Folder";
import { File } from "./Models/File";
import fs from 'fs';
const testFolder = './';

fs.promises.readdir(testFolder, { withFileTypes: true })
  .then((dirent) => {
    var root: Folder = { name: "root", files: new Array(), folders: new Array() }
    dirent.forEach(dirent => {
      if (dirent.isDirectory()) {
        var folder: Folder = { name: dirent.name, files: new Array(), folders: new Array() }
        root.folders.push(folder);
      }
      else if (dirent.isFile()) {
        var file: File = { name: dirent.name, content: "asd" }
        root.files.push(file);
      }
    });
    console.log(root);
  })
  .catch(error => {
    console.log(error);
  });
