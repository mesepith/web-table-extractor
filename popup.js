const initTable = function (list) {
    const tableDiv = document.getElementById('table-container');

    list.forEach(item => {
        const groupContainer = document.createElement('div');
        groupContainer.setAttribute('class', 'table-group');

        const tableElement = document.createElement('table');
        tableElement.setAttribute('id', item.tableId);

        const trDataArray = item.t_data;

        trDataArray.forEach(rowData => {
            const trElement = document.createElement('tr');

            rowData.forEach(cellData => {
                const tdElement = document.createElement('td');
                tdElement.innerText = cellData;
                trElement.appendChild(tdElement);
            });

            tableElement.appendChild(trElement);
        });

        const explanationElement = document.createElement('p');
        explanationElement.innerText = ` ${trDataArray.length} rows and ${trDataArray[0].length} columns`;

        const buttonContainer = document.createElement('div');
        buttonContainer.setAttribute('class', 'button-container');

        const buttonElement = document.createElement('button');
        buttonElement.innerText = 'Display All';
        let allRowsVisible = false; // Flag to track visibility state
        buttonElement.onclick = function () {
            allRowsVisible = !allRowsVisible;
            buttonElement.innerText = allRowsVisible ? 'Hide All' : 'Display All';

            for (let i = 1; i < trDataArray.length; i++) {
                const rowElement = tableElement.getElementsByTagName('tr')[i];
                rowElement.style.display = allRowsVisible ? 'table-row' : 'none';
            }
        };

        const exportButtonElement = document.createElement('button');
        exportButtonElement.innerText = 'Export .xlsx';
        exportButtonElement.onclick = function () {
            exportExcelTable(item.tableId, item.t_data);
        };

        buttonContainer.appendChild(buttonElement);
        buttonContainer.appendChild(exportButtonElement);

        groupContainer.appendChild(explanationElement);
        groupContainer.appendChild(tableElement);
        groupContainer.appendChild(buttonContainer);

        tableDiv.appendChild(groupContainer);
    });
};

// Send message to background script to export table data
function exportExcelTable(id, t_data) {
    chrome.runtime.sendMessage({ greeting: "runDemo", id: JSON.stringify(id), t_data: JSON.stringify(t_data) }, (response) => {
        let binaryString = atob(response.farewell);
        let arr = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            arr[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'table_data.xlsx';
        a.href = url;
        a.click();
    });
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async function () {
    const message_hint = document.getElementById("message");
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { greeting: "helloKan" });
        if (response.content == "") {
            message_hint.innerText = "No <table> found on this page.";
        } else {
            try {
                var tt = JSON.parse(response.content);
                if (tt.length >= 1) {
                    message_hint.style.display = "none";
                    initTable(tt);
                } else {
                    message_hint.innerText = "No <table> found on this page.";
                }
            } catch {
                message_hint.innerText = "Error parsing data.";
            }
        }
    } catch {
        message_hint.innerText = "No <table> found on this page.";
    }
});
