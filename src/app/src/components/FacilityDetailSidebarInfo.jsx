import React, { memo } from 'react';
import { arrayOf, string } from 'prop-types';
import isEqual from 'lodash/isEqual';

import ShowOnly from './ShowOnly';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps.label, nextProps.label)
    && isEqual(prevProps.data, nextProps.data);

const FacilityDetailSidebarInfo = memo(({
    data,
    label,
}) => (
    <ShowOnly when={!!data.length}>
        <div className="control-panel__group">
            <h1 className="control-panel__heading">
                {label}
            </h1>
            <div className="control-panel__body">
                <ul>
                    {
                        data.map(item => (
                            <li key={item}>
                                {item}
                            </li>))
                    }
                </ul>
            </div>
        </div>
    </ShowOnly>
), propsAreEqual);

FacilityDetailSidebarInfo.propTypes = {
    data: arrayOf(string).isRequired,
    label: string.isRequired,
};

export default FacilityDetailSidebarInfo;
