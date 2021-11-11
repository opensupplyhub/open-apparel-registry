const ExternalRedirect = ({ to }) => {
    window.location.replace(to);
    return null;
};

export default ExternalRedirect;
