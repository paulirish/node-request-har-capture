var request = require('request-promise');
var fs = require('fs');

var harEntries = [];

function buildHarEntry (response) {
  var startTime = response.request.startTime;
  var endTime = Date.now();
  var entry = {
    startedDateTime: new Date(startTime).toISOString(),
    time: endTime - startTime,
    request: {
      method: response.request.method,
      url: response.request.uri,
      httpVersion: 'HTTP/' + response.httpVersion,
      cookies: [],
      headers: [],
      queryString: [],
      postData: undefined,
      headersSize: -1,
      bodySize: -1
    },
    response: {
      status: response.statusCode,
      statusText: response.statusMessage,
      httpVersion: 'HTTP/' + response.httpVersion,
      cookies: [],
      headers: Object.keys(response.headers).map(function (key) { return {name: key, value: response.headers[key]}; }),
      content: {
        size: response.body.length,
        mimeType: response.headers['content-type'],
        text: response.body
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: -1
    },
    cache: {},
    timings: {
      send: -1,
      receive: -1,
      wait: endTime - startTime
    }
  };
  return entry;
}

function requestHarCapture (options) {
  Object.assign(options, {
    resolveWithFullResponse: true,
    simple: false,
    startTime: Date.now()
  });
  return requestHarCapture.request(options).then(function (response) {
    harEntries.push(buildHarEntry(response));
    return response;
  });
}

requestHarCapture.request = request;

requestHarCapture.saveHar = function (fileName) {
  var httpArchive = {
    log: {
      version: '1.2',
      creator: {name: 'request-har-capture', version: '0.0.0'},
      entries: harEntries
    }
  };
  fs.writeFileSync(fileName, JSON.stringify(httpArchive, null, 2));
};

requestHarCapture.clear = function () {
  harEntries = [];
};

module.exports = requestHarCapture;
