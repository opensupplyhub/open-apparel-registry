import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

const styles = {
    apiInput: {
        padding: '8px 16px',
        fontWeight: '700',
        marginLeft: '16px',
        width: '254px',
        borderRadius: '0px',
        border: '1px solid #1A237E',
        color: '#1A237E',
    },
};

export default class APIkey extends Component {
    state = {
        key: '',
        showKey: false,
    };

    componentWillMount() {
        const { uid } = this.props;
        this.generateKey(uid);
    }

    generateKey = (uid) => {
        fetch(`${process.env.REACT_APP_API_URL}/generateKey/${uid}?key=${
            process.env.REACT_APP_API_KEY
        }`)
            .then(response => response.json())
            .then((data) => {
                if (data && data.key && data.key.key) { this.setState({ key: data.key.key }); }
            });
    };

    showKey = () => () => this.setState({ showKey: true });

    render() {
        const { showKey, key } = this.state;

        return (
            <div className="margin-bottom-100">
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    disableRipple
                    className="outlined-button"
                    onClick={this.showKey()}
                >
                    Generate API Key
                </Button>
                {showKey && (
                    <input
                        style={styles.apiInput}
                        readOnly
                        id="apikey"
                        type="text"
                        value={key}
                    />
                )}
            </div>
        );
    }
}

APIkey.propTypes = {
    uid: PropTypes.string.isRequired,
};
