var config = require("./config").config;
var fs = require("fs");
var http = require("http");
var net = require("net");
var url = require("url");

function time() {
  return new Date().toISOString().replace(/^.+T([0-9:]+).*$/, "$1");
}

var proxyServer = http.createServer(function(request, response) {
  console.log(time(), request.method, request.url);

  var localData = null;
  for (var i = 0; i < config.files.length; i++) {
    var file = config.files[i];
    if (request.url.indexOf(file[0]) != -1) {
      console.log(time(), "!LOCAL", file[1]);
      localData = fs.readFileSync(file[1]);
      break;
    }
  }

  var serverUrl = url.parse(request.url);
  var proxyRequest = http.request({
    host: request.headers["host"],
    port: serverUrl.port,
    method: request.method,
    path: serverUrl.path,
    headers: request.headers
  });

  proxyRequest.addListener("error", function(e) {
    console.log(time(), "!ERROR", e.message);
  });

  proxyRequest.addListener("response", function(proxyResponse) {
    if (localData == null) {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);

      proxyResponse.addListener("data", function(chunk) {
        response.write(chunk, "binary");
      });
      proxyResponse.addListener("end", function() {
        response.end();
      });

      return;
    }

    var headers = proxyResponse.headers;

    headers["content-length"] = localData.length;

    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = 0;

    delete headers["content-encoding"];
    delete headers["Content-Encoding"];

    response.writeHead(proxyResponse.statusCode, headers);
    response.write(localData, "binary");
    response.end();
  });

  request.addListener("data", function(chunk) {
    proxyRequest.write(chunk, "binary");
  });
  request.addListener("end", function() {
    proxyRequest.end();
  });
});

proxyServer.on("connect", function(request, clientSocket, head) {
  console.log(time(), "CONNECT", request.url);

  var serverUrl = url.parse("http://" + request.url);
  var serverSocket = net.connect(serverUrl.port, serverUrl.hostname, function() {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n" +
                       "Proxy-agent: Node-Proxy\r\n" +
                       "\r\n");
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
});

proxyServer.listen(config.port, config.address);

console.log(time(), "Proxy server running at " + config.address + ":" + config.port);
