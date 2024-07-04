
function extractTableData() {
  const tables = document.querySelectorAll("table");
  const data = Array.from(tables).map((table, index) => {
    const rows = Array.from(table.rows).map(row => {
      return Array.from(row.cells).map(cell => cell.innerText);
    });
    return { id: `table_${index}`, rows };
  });
  return data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTableData") {
    const tableData = extractTableData();
    sendResponse({ tableData });
  }
});
