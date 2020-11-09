'use strict';

const config = require('./config.json')

exports.handler = async (event, context) => {
  // Extract the request from the CloudFront event that is sent to Lambda@Edge
  const request = event.Records[0].cf.request;
  let host = request.headers.host[0].value

  const apex_redirect_body = `
<\!DOCTYPE html>
<html lang="en">
<head><title>301 Moved Permanently</title></head>
<body bgcolor="white">
<center><h1>301 Moved Permanently</h1></center>
<hr><center>CloudFront Lambda@Edge</center>
</body>
</html>
`;

  const temp_redirect_body = `
<\!DOCTYPE html>
<html lang="en">
<head><title>307 Temporary Redirect </title></head>
<body bgcolor="white">
<center><h1>307 Temporary Redirect </h1></center>
<hr><center>CloudFront Lambda@Edge</center>
</body>
</html>
`;

  if ( config.apex_redirect ) {
    if (host.split('.').length == 2) {
      return {
        status: '301',
        statusDescription: `Redirecting to www domain`,
        headers: {
          location: [{
            key: 'Location',
            value: `https://www.${host}${request.uri}`
          }]
        },
        body: apex_redirect_body
      };
    }
  }

  // Extract the URI from the request
  var olduri = request.uri;

  if ( config.ghost_hostname.length > 0 &&  oldurl.startsWith("ghost") ) {
    return {
      status: '307',
      statusDescription: `Redirecting domain`,
      headers: {
        location: [{
          key: 'Location',
          value: `https://www.${config.ghost_hostname}${request.uri}`
        }]
      },
      body: temp_redirect_body
    };
  }

  if ( config.index_rewrite ) {

    // Match any '/' that occurs at the end of a URI. Replace it with a default index
    var newuri = olduri.replace(/\/$/, '\/index.html');

    // Log the URI as received by CloudFront and the new URI to be used to fetch from origin
    console.log("Old URI: " + olduri + " New URI: " + newuri);

    // Replace the received URI with the URI that includes the index page
    request.uri = newuri;
  }

  return request;

};