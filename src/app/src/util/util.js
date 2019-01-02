/* eslint-disable import/prefer-default-export */
export function DownloadCSV(data, fileName) {
    // eslint-disable-line import/prefer-default-export
    const csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    if (window.navigator.msSaveOrOpenBlob) {
        // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(csvData, fileName);
    } else {
        const csvURL = window.URL.createObjectURL(csvData);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', fileName);
        tempLink.click();
    }
}
