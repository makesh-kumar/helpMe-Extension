let openAiApiKey = document.querySelector('#openai-api-key');
let saveButton = document.querySelector('#save-button');

chrome.storage.sync.get(["openAiApiKey"], function (result) {
    if (result.openAiApiKey)
        openAiApiKey.value = "•••••••••••••••••••••••••••••••••••••••••••••••••••";
})

saveButton.addEventListener('click', function () {
    if (openAiApiKey.value != '•••••••••••••••••••••••••••••••••••••••••••••••••••') {
        chrome.storage.sync.set({ openAiApiKey: openAiApiKey.value })
        window.close();
    }
})