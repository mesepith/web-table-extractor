
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportTable") {
    const tableData = request.data;
    const blob = new Blob([tableData], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    sendResponse({ downloadUrl: url });
  }
});
