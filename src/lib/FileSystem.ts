import * as fs from "fs";
import path from "path";

export function writeToFile(filePath: string, fileName: string, content: string) {
    const fd = fs.openSync(path.join(filePath, fileName), "w");
    fs.writeFileSync(fd, content);
    fs.closeSync(fd);
}