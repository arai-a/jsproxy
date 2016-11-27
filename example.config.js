var config = {
  files: [
    // pattern in URI         local filename
    ["some_minified_code.js", "files/prettified_and_modified_code.js"],
  ],
  address: "127.0.0.1",
  port: 8084,
};

if (typeof exports !== 'undefined') {
  exports.config = config;
}
