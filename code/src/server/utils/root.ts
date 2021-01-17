/**
 * @file Export a function that returns the root of the project.
 * @author Francesco Compagnoni <compfrancesco@gmail.com>
 */

// Imports
import path from "path";
export default () : string => path.dirname(path.join(__dirname, "./"));