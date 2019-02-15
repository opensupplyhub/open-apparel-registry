export default function (v) {
    if (window.ENVIRONMENT && v in window.ENVIRONMENT) {
        return window.ENVIRONMENT[v];
    }

    return process.env[v];
}
