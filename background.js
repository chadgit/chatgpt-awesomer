const cGPTURL = 'https://chat.openai.com';
const newsUrl = 'https://ChadCollins.com';
const ctxParentId = 'mainContextMenu';
const ctxTitle1 = 'Summarize this for me';
const ctxTitle2 = 'Give me an action items list from this';

const contextMenuItems = [
    { id: 'sub1', title: ctxTitle1 },
    { id: 'sub2', title: ctxTitle2 },
    // Add more items as needed
];

chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        id: ctxParentId,
        title: 'Prompts',
        contexts: ['selection'],
    });

    for (const item of contextMenuItems) {
        chrome.contextMenus.create({
            id: item.id,
            title: item.title,
            parentId: ctxParentId,
            contexts: ['selection'],
        });
    }
});

chrome.omnibox.onInputEntered.addListener(function(text) {
    if (text) {
        saveQueryToStorage(text);
        newTab(cGPTURL);
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-hotkey') {
        newTab(cGPTURL);
    }
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.clear();
    newTab(newsUrl);
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const menuItemTitles = {
        sub1: ctxTitle1,
        sub2: ctxTitle2,
        // Add more as needed
    };

    const selectedMenuItem = menuItemTitles[info.menuItemId];
    if (selectedMenuItem) {
        saveQueryToStorage(selectedMenuItem + " \n" + info.selectionText);
        newTab(cGPTURL);
    }
});

async function saveQueryToStorage(query, isActive = true) {
    await chrome.storage.local.set({
        cQuery: isActive,
        lQuery: query,
        qTime: Date.now(),
    });
}

function newTab(url) {
    chrome.tabs.create({
        url: url,
    });
}
