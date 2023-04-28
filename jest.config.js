module.exports = {
  preset: "ts-jest",
  // ignore nodemodules
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  // max workers
  maxWorkers: 1,
};
