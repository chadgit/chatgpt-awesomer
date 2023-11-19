const maxQueryAge = 300000; // 300,000 milliseconds

async function checkForQuery() {
    try {
        const cQueryState = await getFromStorage("cQuery");
        if (cQueryState) {
            const { qTime, lQuery } = await getFromStorage(["qTime", "lQuery"]);
            if (qTime + maxQueryAge > Date.now() && lQuery) {
                await trySendQuery(lQuery);
                // Update cQuery in storage instead of calling it as a function
                await setInStorage({ cQuery: false });
            } else {
                await setInStorage({ cQuery: false });
            }
        }
    } catch (error) {
        console.error(error);
    }
}


async function waitForElement(selector, timeout = 30000, interval = 500) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Not found ${timeout}ms`));
            } else {
                setTimeout(checkElement, interval);
            }
        };
        checkElement();
    });
}

async function getFromStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => {
            resolve(result);
        });
    });
}

async function setInStorage(data) {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve);
    });
}

async function trySendQuery(query) {
    const textarea = await waitForElement("textarea");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    textarea.value = query;
    textarea.focus();
    textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
    
    await waitForButtonEnabled(textarea.parentElement.querySelector("button"));
    textarea.parentElement.querySelector("button").click();
    await setInStorage({ cQuery: false }); // Update this line
}


async function waitForButtonEnabled(button, interval = 1000) {
    while (button.disabled) {
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}

window.addEventListener("load", checkForQuery);

document.addEventListener("keydown", (event) => {
    const commandArray = getCommandArray();

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const currentIndex = typeof window.commandIndex === "undefined" ? -1 : window.commandIndex;
        let newIndex = currentIndex;

        if (event.key === "ArrowUp") {
            newIndex = (currentIndex - 1 + commandArray.length) % commandArray.length;
        } else if (event.key === "ArrowDown") {
            newIndex = (currentIndex + 1) % commandArray.length;
        }

        window.commandIndex = newIndex;
        const currentCommand = commandArray[newIndex];
        document.getElementById("prompt-textarea").value = currentCommand;
    }
});

function getCommandArray() {
    const commandArray = [];
    const mainElement = document.querySelector("main");
    if (mainElement) {
        const elements = mainElement.querySelectorAll(".font-semibold.select-none");
        elements.forEach((element) => {
            if (element.textContent.includes("You")) {
                const nextDiv = element.nextElementSibling.querySelector('div[class=""]');
                if (nextDiv) {
                    commandArray.push(nextDiv.textContent.trim());
                }
            }
        });
    }
    return commandArray;
}
