import {getPage} from "./pages";
import MemoryStorage from "./MemoryStorage";

const db = new MemoryStorage();

const queue: string[] = [];
const page = getPage("/");
if (page) {
    db.save();
}