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
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons/faSignOutAlt";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

// Add the icons to the library.
export default library.add(faEye, faCodeBranch, faExclamationCircle, faCheckCircle, faUser, faSignOutAlt, faGithub);