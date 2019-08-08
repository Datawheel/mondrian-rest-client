module.exports = {
  bail: false, //whether to bail on first test failure
  globals: {
      "CUBE_NAME": "tax_data",
      "SERVER_URL": "https://chilecube.datachile.io/"
  },
  moduleNameMapper: {
    "mondrian-rest-client": "<rootDir>"
  },
  // roots: ["<rootDir>/dist/", "<rootDir>/tests/"],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  transform: { "^.+\\.js$": "babel-jest" },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
  watchPathIgnorePatterns: ["<rootDir>/node_modules/"],
};
