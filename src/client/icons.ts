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
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faFolder } from "@fortawesome/free-solid-svg-icons/faFolder";
import { faBook } from "@fortawesome/free-solid-svg-icons/faBook";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { faChartBar } from "@fortawesome/free-solid-svg-icons/faChartBar";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faExclamationTriangle} from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons/faSignOutAlt";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

// Add the icons to the library.
export default library.add(
	faEye, 
	faCodeBranch, 
	faCode, 
	faFolder, 
	faBook, 
	faLock, 
	faChartBar,
	faInfoCircle,
	faExclamationCircle,
	faExclamationTriangle,
	faTimes,
	faCheckCircle, 
	faUser, 
	faChevronRight,
	faSignOutAlt, 
	faGithub
);