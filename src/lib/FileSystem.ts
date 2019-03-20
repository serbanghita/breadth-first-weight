import * as fs from "fs";
import path from "path";

export function writeToFile(filePath: string, fileName: string, content: string) {
    const fd = fs.openSync(path.join(filePath, fileName), "w");
    fs.writeFileSync(fd, content);
    fs.closeSync(fd);
}

export function createDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Working folder doesn't exist. Creating ${dirPath} ...`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Remove directory recursive like (rm -rf)
 * Avoids including rim-raf at the moment.
 * @param {String} rootPath The absolute path to the directory.
 */
export function removeDir(rootPath: string) {
    if (!rootPath) {
        throw new Error(`Path is empty.`);
    }

    try {
        const stat = fs.statSync(rootPath);
        if (!stat.isDirectory()) {
            throw new Error(`Can only delete directories`);
        }
    } catch (err) {
        // @todo Map http://man7.org/linux/man-pages/man2/stat.2.html#ERRORS
        throw new Error(`Cannot delete the directory because of ${err.code}`);
    }

    try {
        fs.accessSync(rootPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
        throw new Error(`You don't have permissions to ${rootPath}.`);
    }

    const dirContents = fs.readdirSync(rootPath);
    if (dirContents.length === 0) {
        return;
    }

    dirContents.forEach((itemName) => {
        const itemPath = path.resolve(rootPath, itemName);
        const itemStat = fs.statSync(itemPath);
        if (itemStat.isFile()) {
            fs.unlinkSync(itemPath);
        }
        if (itemStat.isDirectory()) {
            removeDir(itemPath);
        }
    });

    fs.rmdirSync(rootPath);
}
