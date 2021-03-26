/**
 * @file Extract vibrant colours from images.
 * @author Francesco Compagnoni
 */

// Imports
import Vibrant from "node-vibrant";
import axios from "axios";

/**
 * Download an image and get the vibrant colour from it.
 * @param imageUrl The URL of the image.
 * @returns A hexadecimal representation of the vibrant colour in the image.
 */
export async function extractVibrant(imageUrl: string) : Promise<string | null> {
	try {
		// Fetch image.
		let imageBuffer = await axios.get(imageUrl, {
			responseType: "arraybuffer"
		});

		// Get palette.
		let palette = await Vibrant.from(imageBuffer.data).getPalette();
		return palette.Vibrant?.hex.slice(1) || null;
	} catch (e) {
		return null;
	}	
}