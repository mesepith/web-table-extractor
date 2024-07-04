chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "helloKan") {
        let tables = document.getElementsByTagName('table');
        let tableData = [];
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            let rows = table.rows;
            let t_data = [];
            for (let j = 0; j < rows.length; j++) {
                let cells = rows[j].cells;
                let row = [];
                for (let k = 0; k < cells.length; k++) {
                    row.push(cells[k].innerText);
                }
                t_data.push(row);
            }
            tableData.push({ tableId: i, t_data });
        }
        console.log("Extracted Table Data:", tableData); // Add logging for debugging
        sendResponse({ content: JSON.stringify(tableData) });
    }
});
