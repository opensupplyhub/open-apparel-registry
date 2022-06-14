import React from 'react';
import { string, shape } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function BadgeVerified({ color, style, ...props }) {
    return (
        <SvgIcon viewBox="0 0 22 23" style={style} {...props}>
            <path
                fill={color}
                d="M20.6479167,3.75920726 L11.8479167,0.165106703 L11.8479167,0.165106686 C11.3065333,-0.0550355677 10.69805,-0.0550355677 10.1566667,0.165106721 L1.35666667,3.75920728 C0.53625,4.09166158 0,4.87787108 0,5.74944047 C0,14.6673025 5.24791667,20.8311849 10.1520833,22.834896 C10.6929167,23.0550347 11.3025,23.0550347 11.8433333,22.834896 C15.77125,21.2310286 22,15.6916211 22,5.74944047 C22,4.87787108 21.46375,4.09166158 20.6479167,3.75920728 L20.6479167,3.75920726 Z M18.7784983,9.29916143 L10.1528244,17.7855346 C9.86217673,18.0714885 9.38401438,18.0714885 9.09336667,17.7855346 L4.21798578,12.9888889 C3.92733807,12.702935 3.92733807,12.2324948 4.21798578,11.9465409 L5.27744355,10.9041929 C5.56809126,10.618239 6.04625361,10.618239 6.33690132,10.9041929 L9.62309555,14.1373166 L16.6595828,7.21446541 C16.9502305,6.92851153 17.4283928,6.92851153 17.7190406,7.21446541 L18.7784983,8.25681342 C19.0738339,8.54737945 19.0738339,9.01320755 18.7784983,9.29916143 L18.7784983,9.29916143 Z"
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
