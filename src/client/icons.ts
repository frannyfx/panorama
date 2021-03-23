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
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons/faSignOutAlt";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faQuestion } from "@fortawesome/free-solid-svg-icons/faQuestion";
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
	faCheck,
	faCheckCircle, 
	faUser, 
	faChevronLeft,
	faChevronRight,
	faSignOutAlt, 
	faSync,
	faQuestion,
	faGithub
);