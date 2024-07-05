document.addEventListener('DOMContentLoaded', async function () {
    const message_hint = document.getElementById("message");
    const tableDiv = document.getElementById('table-container');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { greeting: "helloKan" });
        console.log("Response from content script:", response); // Add logging for debugging
        if (response.content === "") {
            message_hint.innerText = "No <table> found on this page.";
        } else {
            try {
                const tables = JSON.parse(response.content);
                if (tables.length >= 1) {
                    message_hint.style.display = "none";
                    initTable(tables, 450, 20);
                } else {
                    message_hint.innerText = "No <table> found on this page.";
                }
            } catch (error) {
                console.error("Error parsing data:", error); // Add logging for debugging
                message_hint.innerText = "Error parsing data.";
            }
        }
    } catch (error) {
        console.error("Error querying or sending message to tab:", error); // Add logging for debugging
        message_hint.innerText = "No <table> found on this page.";
    }

    function initTable(list, maxWidth, columnWidth) {
        const tableDiv = document.getElementById('table-container');

        list.forEach(item => {
            const groupContainer = document.createElement('div');
            groupContainer.setAttribute('class', 'table-group');

            const tableElement = document.createElement('table');
            tableElement.setAttribute('id', item.tableId);

            const trDataArray = item.t_data;

            const firstRowElement = document.createElement('tr');
            trDataArray[0].forEach(cellText => {
                const tdElement = document.createElement('td');
                tdElement.innerText = cellText;
                tdElement.style.width = columnWidth + 'px';
                tdElement.style.border = "1px solid #000";
                firstRowElement.appendChild(tdElement);
            });
            tableElement.appendChild(firstRowElement);

            for (let i = 1; i < trDataArray.length; i++) {
                const trElement = document.createElement('tr');
                trElement.style.display = 'none';
                trDataArray[i].forEach(cellText => {
                    const tdElement = document.createElement('td');
                    tdElement.innerText = cellText;
                    tdElement.style.width = columnWidth + 'px';
                    tdElement.style.border = "1px solid #000";
                    trElement.appendChild(tdElement);
                });
                tableElement.appendChild(trElement);
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.setAttribute('class', 'button-container');

            const buttonElement = document.createElement('button');
            buttonElement.innerText = 'Display All';
            let allRowsVisible = false;
            buttonElement.onclick = function () {
                allRowsVisible = !allRowsVisible;
                buttonElement.innerText = allRowsVisible ? 'Hide All' : 'Display All';
                for (let i = 1; i < trDataArray.length; i++) {
                    const rowElement = tableElement.getElementsByTagName('tr')[i];
                    if (rowElement) {
                        rowElement.style.display = allRowsVisible ? 'table-row' : 'none';
                    }
                }
            };

            const exportButtonElement = document.createElement('button');
            exportButtonElement.innerText = 'Export .xlsx';
            exportButtonElement.onclick = function () {
                exportToExcel(item.t_data, item.tableId);
            };

            const copyButtonElement = document.createElement('button');
            copyButtonElement.innerText = 'Copy';
            copyButtonElement.onclick = function () {
                copyToClipboard(item.t_data);
            };

            buttonContainer.appendChild(buttonElement);
            buttonContainer.appendChild(exportButtonElement);
            buttonContainer.appendChild(copyButtonElement);
            groupContainer.appendChild(tableElement);
            groupContainer.appendChild(buttonContainer);
            tableDiv.appendChild(groupContainer);
        });
    }

    function exportToExcel(data, tableId) {
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table_${tableId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    function copyToClipboard(data) {
        const textToCopy = data.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(textToCopy).then(function() {
            console.log('Copied to clipboard successfully.');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }

    /** Grid data start */

    // Extract Data Button
    const extractButton = document.createElement('button');
    extractButton.textContent = 'Extract Data';
    document.body.appendChild(extractButton);

    extractButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { greeting: "extractGridData" }, response => {
            if (response && response.content) {
                const data = JSON.parse(response.content);
                if (data.length > 0) {
                    displayGridData(data);
                    message_hint.style.display = 'none';
                } else {
                    message_hint.innerText = 'No data found on this page.';
                }
            } else {
                message_hint.innerText = 'Failed to extract data.';
            }
        });
    });

    function displayGridData(data) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        // Add table header if needed
        const headerRow = document.createElement('tr');
        if (data.length > 0) {
            data[0].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.border = '1px solid black';
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
        }

        // Add data rows
        data.forEach((row, index) => {
            if (index === 0) return; // Skip header row if already added
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                td.style.border = '1px solid black';
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        tableDiv.innerHTML = ''; // Clear previous content
        tableDiv.appendChild(table);
    }

    /** Grid data start */
});


