import { Component } from 'react';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';

import { COUNTRY_CODES } from '../util/constants';

class Translate extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.clientInfoFetched && !prevProps.clientInfoFetched) {
            const script = document.createElement('script');
            script.src = this.props.src;
            document.body.appendChild(script);
        }
    }

    render() {
        return null;
    }
}

Translate.propTypes = {
    clientInfoFetched: bool.isRequired,
    src: string.isRequired,
};

function mapStateToProps({
    clientInfo: {
        fetched,
        countryCode,
    },
}) {
    const host = countryCode === COUNTRY_CODES.china
        ? 'translate.google.cn'
        : 'translate.google.com';
    const src = `//${host}/translate_a/element.js?cb=googleTranslateElementInit`;
    return {
        clientInfoFetched: fetched,
        src,
    };
}

export default connect(mapStateToProps)(Translate);
