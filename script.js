let isListenerAdded = false;
let isEnabled = false;
let helpMeAPIKey = '';
function checkForKeyInStorage() {
  isEnabled = false;
  chrome.storage.sync.get(['isHelpMeEnabled'], (result) => {
    if (result.hasOwnProperty('isHelpMeEnabled')) {
      if (result.isHelpMeEnabled) {
        isEnabled = true;
        chrome.storage.sync.get(['helpMeAPIKey'], (result) => {
          if (result.hasOwnProperty('helpMeAPIKey')) {
            helpMeAPIKey = result.helpMeAPIKey;
            if (helpMeAPIKey) {
              console.info("helpMe extension enabled !");
              triggerHelpMe();
            }
          }
        });
      }
    }
  });
}
chrome.storage.onChanged.addListener(checkForKeyInStorage);

checkForKeyInStorage();

function triggerHelpMe() {
  if (helpMeAPIKey) {
    const getResultFromChatGPT = async (inputText, nodeToReplace, prop) => {
      try {
        const response = await fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${helpMeAPIKey}`,
          },
          body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: inputText,
            max_tokens: 2048,
            temperature: 0,
            stream: true, // For streaming responses
          }),
        });

        // Read the response as a stream of data
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let resultText = '';
        nodeToReplace[prop] = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // Massage and parse the chunk of data
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          const parsedLines = lines
            .map((line) => line.replace(/^data: /, '').trim()) // Remove the "data: " prefix
            .filter((line) => line !== '' && line !== '[DONE]') // Remove empty lines and "[DONE]"
            .map((line) => JSON.parse(line)); // Parse the JSON string

          for (const parsedLine of parsedLines) {
            const { choices } = parsedLine;
            let { text } = choices[0];
            text = text.replace(/\n/g, '');
            if (text) {
              resultText = resultText + text;
              nodeToReplace[prop] = resultText;
            }
          }
        }
      } catch (err) {
        console.error('helpMe Extension Error ::: ', err);
      }
    };

    const debounce = (func, delay) => {
      let inDebounce;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
      };
    };

    const getParsedText = (inp) => {
      inp = inp.replace(/\n/g, '');
      const regex = /^.*helpMe:.*;.*$/;
      if (regex.test(inp)) {
        return /helpMe:(.*?);/.exec(inp)[1];
      }
      return '';
    };

    var getText = async (e) => {
      if (isEnabled) {
        let parsedTxt = '';
        const expectedNodes = ['INPUT', 'TEXTAREA'];
        if (expectedNodes.includes(e.target.nodeName)) {
          if (e.target.value) {
            parsedTxt = getParsedText(e.target.value);
            if (parsedTxt) {
              const result = await getResultFromChatGPT(
                parsedTxt.trim(),
                e.target,
                'value'
              );
              // if (result) {
              //   e.target.value = result;
              // }
            }
          }
        } else {
          parsedTxt = getParsedText(e.target.innerText);
          if (parsedTxt) {
            const result = await getResultFromChatGPT(
              parsedTxt.trim(),
              e.target,
              'innerText'
            );
            // if (result) {
            //   e.target.innerText = result;
            // }
          }
        }
      }
    };
    if (!isListenerAdded) {
      isListenerAdded = true;
      document.addEventListener('keypress', debounce(getText, 2000));
    }
  }
}
