import React from 'react';
import { string, shape } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function BadgeVerified({ color, style, ...props }) {
    return (
        <SvgIcon viewBox="0 0 16 20" style={style} {...props}>
            <path
                fill={color}
                d="M6.95 13.55L12.6 7.9L11.175 6.475L6.95 10.7L4.85 8.6L3.425 10.025L6.95 13.55ZM8 20C5.68333 19.4167 3.771 18.0873 2.263 16.012C0.754333 13.9373 0 11.6333 0 9.1V3L8 0L16 3V9.1C16 11.6333 15.246 13.9373 13.738 16.012C12.2293 18.0873 10.3167 19.4167 8 20ZM8 17.9C9.73333 17.35 11.1667 16.25 12.3 14.6C13.4333 12.95 14 11.1167 14 9.1V4.375L8 2.125L2 4.375V9.1C2 11.1167 2.56667 12.95 3.7 14.6C4.83333 16.25 6.26667 17.35 8 17.9Z"
            />
        </SvgIcon>
    );
}

BadgeVerified.defaultProps = {
    color: 'currentColor',
    style: null,
};

BadgeVerified.propTypes = {
    color: string,
    style: shape({}),
};
