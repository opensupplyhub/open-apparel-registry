import React, { PureComponent } from 'react';
import _ from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import StaticMap from './StaticMap';
import ShowOnly from './ShowOnly';

export default class FactoryInfo extends PureComponent {
    render() {
        const { info, onClearSelection } = this.props;
        const sources = info.source.map((i) => {
            const updateTime = new Date(i.updated).toLocaleDateString();
            return (
                <div key={`${i.uid}-source`} className="margin-bottom-16">
                    <p style={{ marginBottom: '0px' }}>
                        <Link
                            className="link-underline notranslate"
                            key={`${i.uid}-link`}
                            to={`/profile/${i.uid}`}
                            href={`/profile/${i.uid}`}
                        >
                            {i.name}
                        </Link>
                    </p>
                    <p style={{ marginBottom: '0px', fontSize: '12px' }}>
                        {`(Last Updated: ${updateTime})`}
                    </p>
                </div>
            );
        });
        const mail = `mailto:info@openapparel.org?subject=Reporting a data issue on ID ${
            info.nameId
        }`;
        const uniqueOtherNames = _.uniq(info.otherNames);
        const uniqueOtherAddresses = _.uniq(info.otherAddresses);
        const otherNames =
            uniqueOtherNames && uniqueOtherNames.length > 0
                ? uniqueOtherNames.map(n => <p key={n}>{n}</p>)
                : [];
        const otherAddresses =
            uniqueOtherAddresses && uniqueOtherAddresses.length > 0
                ? uniqueOtherAddresses.map(n => <p key={n}>{n}</p>)
                : [];
        return (
            <React.Fragment>
                <div className="panel-header display-flex">
                    <IconButton
                        aria-label="ArrowBack"
                        className="color-white"
                        style={{ width: '24px', marginRight: '16px' }}
                        onClick={onClearSelection}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <h3
                            key="name"
                            className="panel-header__title notranslate"
                        >
                            {info.name}
                        </h3>
                        <p
                            key="address"
                            className="panel-header__subheading notranslate"
                        >
                            {info.address}
                        </p>
                    </div>
                </div>

                <StaticMap lat={info.latitude} lon={info.longitude} />

                <div className="control-panel__content">
                    <div className="control-panel__group">
                        <h1 className="control-panel__heading">
                            OAR ID: &nbsp;
                        </h1>
                        <p key="_id" className="control-panel__body">
                            {info.nameId}
                        </p>
                    </div>
                    <div className="control-panel__group">
                        <h1 className="control-panel__heading">
                            GPS Coordinates:
                        </h1>
                        <p key="geo" className="control-panel__body">
                            {info.latitude}, {info.longitude}
                        </p>
                    </div>

                    <ShowOnly when={otherNames.length > 0}>
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                Also known as:
                            </h1>
                            <div className="control-panel__body">
                                {otherNames}
                            </div>
                        </div>
                    </ShowOnly>

                    <ShowOnly
                        when={otherAddresses.length > 0}
                        className="control-panel__group"
                    >
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                Other Addresses:
                            </h1>
                            <div className="control-panel__body">
                                {otherAddresses}
                            </div>
                        </div>
                    </ShowOnly>

                    <div className="control-panel__group">
                        <h1 className="control-panel__heading">
                            Contributors:
                        </h1>
                        <div className="control-panel__body">{sources}</div>
                    </div>
                    <div className="control-panel__group">
                        <a
                            className="link-underline small"
                            href={mail}
                            style={{ display: 'inline-block' }}
                        >
                            REPORT A DATA ISSUE
                        </a>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

FactoryInfo.propTypes = {
    info: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClearSelection: PropTypes.func.isRequired,
};

FactoryInfo.defaultProps = {
    info: {},
};
