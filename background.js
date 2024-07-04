import init, { table_data_export } from './wasm/wasm_mod.js';

async function runDemo(id, t_data) {
    await init();
    let xx = table_data_export(id, t_data);
    let base64String = btoa(String.fromCharCode.apply(null, xx));
    return base64String;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "runDemo") {
            runDemo(request.id, request.t_data).then(result => {
                sendResponse({ farewell: result });
            });
            return true;
        }
    });
