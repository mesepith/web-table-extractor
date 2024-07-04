function getTables(dom) {
    let tables = [];

    function isTableDiv(div) {
        let classNames = div.className.split(' ');
        return classNames.includes('table');
    }

    function parseDivTable(div) {
        let rowDivs = div.querySelectorAll('[class*="row"]');
        let rowsData = [];

        for (let i = 0; i < rowDivs.length; i++) {
            let rowDiv = rowDivs[i];
            let rowData = [];
            let cellDivs = rowDiv.querySelectorAll('div');

            for (let j = 0; j < cellDivs.length; j++) {
                let cellDiv = cellDivs[j];
                let cellText = cellDiv.innerText;
                rowData.push(cellText);
            }

            rowsData.push(rowData);
        }

        return {
            tableId: 77,
            t_data: rowsData
        };
    }

    function parseTable(table) {
        let rowsData = [];
        let rows = table.rows;

        for (let i = 0; i < rows.length; i++) {
            let rowData = [];
            let cells = rows[i].cells;

            for (let j = 0; j < cells.length; j++) {
                let cellText = cells[j].innerText;
                rowData.push(cellText);
            }

            rowsData.push(rowData);
        }

        return {
            tableId: 66,
            t_data: rowsData
        };
    }

    function traverse(dom) {
        if (dom.tagName === 'DIV' && isTableDiv(dom)) {
            tables.push(parseDivTable(dom));
        }
        if (dom.tagName === 'TABLE') {
            tables.push(parseTable(dom));
        }
        if (dom.tagName === 'IFRAME') {
            let iframeDoc = dom.contentDocument;
            if (iframeDoc) {
                traverse(iframeDoc.documentElement);
            }
        }
        let childNodes = dom.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            traverse(childNodes[i]);
        }
    }

    traverse(dom);
    tables = tables.filter(data => data['t_data'].length > 0);
    tables = tables.filter((item, index, self) =>
        self.findIndex(v => v['t_data'].toString() === item['t_data'].toString()) === index);
    return tables;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === 'helloKan') {
        let dom = document.documentElement;
        let tables = getTables(dom);
        sendResponse({ content: JSON.stringify(tables) });
    }
});
