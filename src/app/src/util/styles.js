export const formValidationErrorMessageStyle = Object.freeze({
    color: 'red',
    fontSize: '16px',
    fontWeight: '500',
    paddingLeft: '1.5rem',
    paddingBottom: '1rem',
});

export const listTableCellStyles = Object.freeze({
    rowIndexStyles: Object.freeze({
        flex: '1',
        fontSize: '16px',
    }),
    countryCodeStyles: Object.freeze({
        flex: '1',
        fontSize: '16px',
    }),
    nameCellStyles: Object.freeze({
        flex: '2',
        fontSize: '16px',
    }),
    addressCellStyles: Object.freeze({
        flex: '2',
        fontSize: '16px',
    }),
    statusCellStyles: Object.freeze({
        flex: '2',
        fontSize: '16px',
        paddingRight: '30px',
    }),
});

export const confirmRejectMatchRowStyles = Object.freeze({
    cellStyles: Object.freeze({
        marginTop: '3px',
        marginBottom: '3px',
    }),
    cellRowStyles: Object.freeze({
        height: '75px',
        minHeight: '75px',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px',
    }),
    errorCellRowStyles: Object.freeze({
        height: '75px',
        minHeight: '75px',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px',
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
