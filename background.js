chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "runDemo") {
        chrome.tabs.sendMessage(sender.tab.id, request, sendResponse);
        return true; // Indicates that the response will be sent asynchronously
    }
});
