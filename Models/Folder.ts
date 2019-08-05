import { File } from "./File";

export type Folder = {
  name: string;
  files: File[];
  folders: Folder[];
  path: string;
}