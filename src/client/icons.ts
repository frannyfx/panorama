/**
 * @file Import the required icons. Doing it this way allows for efficient tree-shaking to be
 * performed by Webpack.
 * @author Francesco Compagnoni
 */

// Imports
import { library } from "@fortawesome/fontawesome-svg-core";

// Icons
import { faEye } from "@fortawesome/free-solid-svg-icons/faEye";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons/faCodeBranch";

// Add the icons to the library.
export default library.add(faEye, faCodeBranch);