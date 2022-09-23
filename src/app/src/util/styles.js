export const formValidationErrorMessageStyle = Object.freeze({
    color: 'red',
    fontSize: '16px',
    fontWeight: '500',
    paddingLeft: '1.5rem',
    paddingBottom: '1rem',
});

export const listTableCellStyles = Object.freeze({
    rowIndexStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
    }),
    countryNameStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
    }),
    nameCellStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
    }),
    addressCellStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
        wordBreak: 'break-word',
    }),
    statusCellStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
        width: '300px',
    }),
    compareCellStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
        borderColor: '#f3f3f3',
    }),
    headerCellStyles: Object.freeze({
        fontSize: '16px',
        padding: '10px 24px',
        color: 'black',
    }),
});

export const confirmRejectMatchRowStyles = Object.freeze({
    cellStyles: Object.freeze({
        marginTop: '3px',
        marginBottom: '3px',
        display: 'flex',
        flexDirection: 'column',
    }),
    cellOverflowStyles: Object.freeze({
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    }),
    cellRowStyles: Object.freeze({
        minHeight: '55px',
        display: 'flex',
        alignItems: 'top',
        maxWidth: '400px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'hidden',
    }),
    cellSubtitleStyles: Object.freeze({
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px',
    }),
    errorCellRowStyles: Object.freeze({
        display: 'flex',
        alignItems: 'center',
        color: 'red',
    }),
    cellHiddenHRStyles: Object.freeze({
        color: '#fff',
        borderTop: 'transparent',
    }),
    cellHRStyles: Object.freeze({}),
    cellActionStyles: Object.freeze({
        display: 'flex',
        width: '200px',
        marginRight: '10px',
        alignItems: 'center',
        justifyContent: 'space-between',
    }),
});

export const filterSidebarStyles = Object.freeze({
    controlPanelContentStyles: Object.freeze({
        height: 'inherit',
        overflow: 'auto',
    }),
});

export const makeFilterStyles = theme =>
    Object.freeze({
        inputLabelStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
            fontSize: '18px',
            fontWeight: 700,
            color: '#000',
            transform: 'translate(0, -8px) scale(1)',
            paddingBottom: '0.5rem',
        }),
        selectStyle: Object.freeze({
            fontFamily: theme.typography.fontFamily,
        }),
    });

export const claimAFacilityFormStyles = Object.freeze({
    textFieldStyles: Object.freeze({
        width: '95%',
        padding: '10px 0 10px',
    }),
    inputGroupStyles: Object.freeze({
        width: '100%',
        padding: '5px 0 5px',
    }),
    asideStyles: Object.freeze({
        padding: '5px 20px 5px 0',
    }),
});
