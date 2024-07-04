document.addEventListener('DOMContentLoaded', async function () {
    const message_hint = document.getElementById("message");
    try {
        const [tab] = await chrome.tabs.query({ active: true });
        const response = await chrome.tabs.sendMessage(tab.id, { greeting: "helloKan" });
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
            } catch {
                message_hint.innerText = "Error parsing data.";
            }
        }
    } catch {
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
                chrome.runtime.sendMessage({ greeting: "runDemo", id: JSON.stringify(item.tableId), t_data: JSON.stringify(item.t_data) }, function (response) {
                    const a = document.createElement('a');
                    a.href = response.farewell;
                    a.download = `table_${item.tableId}.xlsx`;
                    a.click();
                });
            };

            buttonContainer.appendChild(buttonElement);
            buttonContainer.appendChild(exportButtonElement);
            groupContainer.appendChild(tableElement);
            groupContainer.appendChild(buttonContainer);
            tableDiv.appendChild(groupContainer);
        });
    }
});
