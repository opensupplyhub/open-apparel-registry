// Adapted from https://devscope.io/code/aws-samples/amazon-cloudfront-functions/issues/11

function objectToQueryString(obj) {
    var str = [];
    for (var param in obj)
        if (obj[param].value === '') {
            str.push(encodeURIComponent(param));
        } else {
            // Normalize single and multiple value query params to a list of
            // param value objects
            var valueObjects = obj[param].multiValue || [obj[param]];
            var encodedValues = valueObjects.map(
                vo => `${encodeURIComponent(param)}=${encodeURIComponent(vo.value)}`);

            str.push(encodedValues.join('&'));
        }

    return str.join('&');
}

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // If this is an embed request, allow it to proceed to the ALB
    if (request.querystring.embed && request.querystring.embed.value === '1') {
        return request;
    }


    // Ensure that any resources fetched by the client after when loading an
    // ebedded map are not redirected
    if (uri.substring(1, 5) === 'web/'
        || uri.substring(1, 5) === 'api/'
        || uri.substring(1, 19) === 'api-feature-flags/'
        || uri.substring(1, 10) === 'favicon/'
        || uri.substring(1, 8) === 'images/'
        || uri.substring(1, 8) === 'static/'
       ) {
        // If the referrer starts with one of the following then we want to
        // allow the request to pass through unmodified
        //     https://staging.openapparel.org/
        //     https://openapparel.org/
        var passThroughRefererRegex = /^https:\/\/(staging\.|)openapparel\.org\//gm;

        if (request.headers.referer
            && request.headers.referer.value
            && passThroughRefererRegex.test(request.headers.referer.value)) {
            return request;
        }
    }

    // Redirect all other requests
    var location = '';
    var host = 'opensupplyhub.org';

    if (Object.keys(request.querystring).length > 0) {
        location = `https://${host}${uri}?${objectToQueryString(request.querystring)}`;    }
    else
        location = `https://${host}${uri}`;

    var response = {
        statusCode: 302,
        statusDescription: 'Found',
        headers: {
            'cloudfront-functions': { value: 'generated-by-CloudFront-Functions' },
            'location': { value: `${location}` }
        }
    };
    return response;
}
