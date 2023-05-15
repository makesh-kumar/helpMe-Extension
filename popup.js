let API_KEY = '';
let isHelpMeEnabled = false;

const saveSection = document.querySelector('#saved-key');
const newSection = document.querySelector('.new-key');
const changeBtn = document.querySelector('#change-btn');
const saveBtn = document.querySelector('#save-btn');
const storedKey = document.querySelector('.key');
const apiInput = document.querySelector('#api-key');
const statusEle = document.querySelector('.status-toggle');

saveBtn.addEventListener('click', () => {
  saveKey(apiInput.value);
});

function saveKey(key, update = true) {
  if (key) {
    if (update) {
      chrome.storage.sync.set({ helpMeAPIKey: key });
    }
    const last4Digits = key.slice(-4);
    const maskedNumber = last4Digits.padStart(key.length, '*');
    storedKey.innerText = 'Your Key : ' + maskedNumber;
    saveDone();
  } else {
    alert('Please enter valid open-ai api key');
  }
}

changeBtn.addEventListener('click', () => {
  apiInput.value = API_KEY;
  newSection.classList.remove('hide');
  saveSection.classList.add('hide');
});

function saveDone() {
  newSection.classList.add('hide');
  saveSection.classList.remove('hide');
}

function checkForKeyInStorage() {
  chrome.storage.sync.get(['helpMeAPIKey'], (result) => {
    if (result.hasOwnProperty('helpMeAPIKey')) {
      API_KEY = result.helpMeAPIKey;
      if (API_KEY) {
        saveKey(API_KEY);
      }
    }

    chrome.storage.sync.get(['isHelpMeEnabled'], (result) => {
      if (result.hasOwnProperty('isHelpMeEnabled')) {
        changeStatus(result.isHelpMeEnabled);
      }
    });
  });
}

statusEle.addEventListener('change', (e) => {
  changeStatus(e.target.checked);
});

function changeStatus(status, isUpdate = true) {
  if (isUpdate) {
    chrome.storage.sync.set({ isHelpMeEnabled: status });
  }
  if (API_KEY) {
    statusEle.checked = status;
  } else {
    statusEle.checked = false;
    alert('Please save your open-ai api key to enable');
  }
}

checkForKeyInStorage();
