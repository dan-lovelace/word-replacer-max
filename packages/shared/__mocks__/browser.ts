import { jest } from "@jest/globals";

const mockBrowser = {
  storage: {
    sync: {
      get: jest.fn(),
      remove: jest.fn(),
      set: jest.fn(),
    },
  },
};

export default mockBrowser;
