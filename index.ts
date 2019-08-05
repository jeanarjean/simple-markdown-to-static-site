#!/usr/bin/env node
import { Folder } from "./Models/Folder";
import { File } from "./Models/File";
import fs from 'fs';
const testFolder = './';

fs.promises.readdir(testFolder, { withFileTypes: true })
  .then((dirent) => {
    var root: Folder = { name: "root", files: new Array(), folders: new Array(), path: './' }
    dirent.forEach(dirent => {
      if (dirent.isDirectory()) {
        var folder: Folder = { name: dirent.name, files: new Array(), folders: new Array(), path: root.path + dirent.name }
        root.folders.push(folder);
      }
      else if (dirent.isFile()) {
        var file: File = { name: dirent.name, content: "asd", path: root.path + dirent.name }
        fs.open(file.path, 'r', (err, fd) => {
          if (err) {
            if (err.code === 'ENOENT') {
              console.error('myfile does not exist');
              return;
            }

            throw err;
          }

          fs.promises.readFile(file.path)
            .then((data) => {
              console.log(data);
              file.content = data.toString();
              console.log(file);
            })
            .catch((error) => {
              console.log(error)
            });
        });
        root.files.push(file);
      }
    });
    console.log(root);
  })
  .catch(error => {
    console.log(error);
  });