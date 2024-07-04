
document.addEventListener('DOMContentLoaded', async () => {
  const tableContainer = document.getElementById('table-container');
  const exportAllButton = document.getElementById('exportAll');

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: "getTableData" }, (response) => {
      const { tableData } = response;
      tableData.forEach((table) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'table-group';
        const tableElement = document.createElement('table');
        tableElement.id = table.id;

        table.rows.forEach((row, rowIndex) => {
          const rowElement = document.createElement('tr');
          row.forEach((cell) => {
            const cellElement = document.createElement('td');
            cellElement.innerText = cell;
            rowElement.appendChild(cellElement);
          });
          if (rowIndex > 0) rowElement.style.display = 'none';
          tableElement.appendChild(rowElement);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const toggleButton = document.createElement('button');
        toggleButton.innerText = 'Display All';
        toggleButton.addEventListener('click', () => {
          const rows = Array.from(tableElement.rows);
          const isHidden = rows[1].style.display === 'none';
          rows.slice(1).forEach(row => row.style.display = isHidden ? 'table-row' : 'none');
          toggleButton.innerText = isHidden ? 'Hide All' : 'Display All';
        });

        const exportButton = document.createElement('button');
        exportButton.innerText = 'Export .xlsx';
        exportButton.addEventListener('click', () => {
          const tableHtml = tableElement.outerHTML;
          chrome.runtime.sendMessage({ action: "exportTable", data: tableHtml }, (response) => {
            const a = document.createElement('a');
            a.href = response.downloadUrl;
            a.download = 'table.xlsx';
            a.click();
          });
        });

        buttonContainer.appendChild(toggleButton);
        buttonContainer.appendChild(exportButton);
        groupDiv.appendChild(tableElement);
        groupDiv.appendChild(buttonContainer);
        tableContainer.appendChild(groupDiv);
      });
    });
  });

  exportAllButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: "getTableData" }, (response) => {
        const { tableData } = response;
        let allTablesHtml = tableData.map(table => {
          const rowsHtml = table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
          return `<table>${rowsHtml}</table>`;
        }).join('');

        chrome.runtime.sendMessage({ action: "exportTable", data: allTablesHtml }, (response) => {
          const a = document.createElement('a');
          a.href = response.downloadUrl;
          a.download = 'tables.xlsx';
          a.click();
        });
      });
    });
  });
});
