import * as browserFs from "./browserFs";
import * as electronFs from "./electronFs";

const fileSystem = window?.require ? electronFs : browserFs;
export default fileSystem;
