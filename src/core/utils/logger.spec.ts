import { swaCLIEnv } from "../env.js";
import { logger } from "./logger.js";

vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return { ...actual, swaCLIEnv: vi.fn(actual.swaCLIEnv) };
});

describe("logger", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.SWA_CLI_DEBUG;
    vi.mocked(swaCLIEnv).mockImplementation(() => ({ ...process.env }) as ReturnType<typeof swaCLIEnv>);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("silly()", () => {
    it("should not print anything when SWA_CLI_DEBUG is not set", () => {
      logger.silly("hello");

      expect(console.log).not.toHaveBeenCalled();
    });

    it("should not print anything when SWA_CLI_DEBUG contains 'silent'", () => {
      process.env.SWA_CLI_DEBUG = "silly,silent";

      logger.silly("hello");

      expect(console.log).not.toHaveBeenCalled();
    });

    it("should print when SWA_CLI_DEBUG contains the debug filter", () => {
      process.env.SWA_CLI_DEBUG = "silly";

      logger.silly("hello");

      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it("should not print when SWA_CLI_DEBUG does not contain the debug filter", () => {
      process.env.SWA_CLI_DEBUG = "info";

      logger.silly("hello", null, "log");

      expect(console.log).not.toHaveBeenCalled();
    });

    it("should not copy the environment variables", () => {
      logger.silly("hello");

      expect(swaCLIEnv).not.toHaveBeenCalled();
    });
  });

  describe("error()", () => {
    it("should print the error", () => {
      logger.error("oops");

      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("should not print the error when SWA_CLI_DEBUG contains 'silent'", () => {
      process.env.SWA_CLI_DEBUG = "silent";

      logger.error("oops");

      expect(console.error).not.toHaveBeenCalled();
    });

    it("should not copy the environment variables", () => {
      logger.error("oops");

      expect(swaCLIEnv).not.toHaveBeenCalled();
    });
  });
});
