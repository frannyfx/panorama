// File imports
import logger from "../../../src/server/utils/logger";

describe("logger", () => {
	it("exports the logger interface", () => {
		let log = logger();
		expect(log.info).toBeInstanceOf(Function);
		expect(log.warn).toBeInstanceOf(Function);
		expect(log.error).toBeInstanceOf(Function);
		expect(log.success).toBeInstanceOf(Function);
	});
});