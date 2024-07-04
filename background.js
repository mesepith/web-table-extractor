chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "runDemo") {
        const tableData = JSON.parse(request.t_data);
        const id = JSON.parse(request.id);
        const exportResult = exportTableToExcel(id, tableData);
        sendResponse({ farewell: exportResult });
        return true;
    }
});

function exportTableToExcel(id, t_data) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(t_data);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Table_${id}`);
    const workbookBinary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

    const buffer = new ArrayBuffer(workbookBinary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < workbookBinary.length; i++) {
        view[i] = workbookBinary.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    return url;
}
