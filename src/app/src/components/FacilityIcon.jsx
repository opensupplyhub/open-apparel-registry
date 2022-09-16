import React from 'react';
import { string } from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

export default function FacilityIcon({ color }) {
    return (
        <SvgIcon viewBox="0 0 32 32" style={{ transform: 'scale(0.8)' }}>
            <path
                fill={color}
                d="M0.166992 31.8337V12.7941L11.2503 8.08366V11.2503L19.167 8.08366V12.8337H31.8337V31.8337H0.166992ZM3.33366 28.667H28.667V16.0003H16.0003V12.7545L8.08366 15.9212V12.8337L3.33366 14.9316V28.667ZM14.417 25.5003H17.5837V19.167H14.417V25.5003ZM8.08366 25.5003H11.2503V19.167H8.08366V25.5003ZM20.7503 25.5003H23.917V19.167H20.7503V25.5003ZM31.8337 12.8337H23.917L25.5003 0.166992H30.2503L31.8337 12.8337Z"
            />
        </SvgIcon>
    );
}

FacilityIcon.defaultProps = {
    color: '#1C1B1F',
};

FacilityIcon.propTypes = {
    color: string,
};
