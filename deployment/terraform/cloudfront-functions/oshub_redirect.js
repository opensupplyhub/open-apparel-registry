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

    // Redirect all requests
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
