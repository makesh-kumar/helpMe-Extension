const getResultFromChatGPT = async (inputText, API_KEY) => {
  try {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', 'Bearer ' + API_KEY);

    const reqBody = JSON.stringify({
      model: 'text-davinci-003',
      prompt: inputText,
      max_tokens: 2048,
      temperature: 0,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
    });

    const req = {
      method: 'POST',
      headers: headers,
      body: reqBody,
      redirect: 'follow',
    };

    let res = await fetch('https://api.openai.com/v1/completions', req);
    res = await res.json();
    const choices = res.choices;
    const outputText = choices[0].text.replace(/^\s+|\s+$/g, '');
    return outputText;
  } catch (err) {
    console.log('ERROR ::: ', err);
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
  // const regex = /^helpMe:(.*);$/;

  inp = inp.replace(/\n/g, '');

  const regex = /^.*helpMe:.*;.*$/;
  console.log(inp);
  console.log(regex.test(inp));
  console.log(/helpMe:(.*?);/.exec(inp));
  if (regex.test(inp)) {
    console.log('Matched');
    return /helpMe:(.*?);/.exec(inp)[1];
  }
  return '';
};

const getText = async (e) => {
  let parsedTxt = '';
  const expectedNodes = ['INPUT', 'TEXTAREA'];
  if (expectedNodes.includes(e.target.nodeName)) {
    if (e.target.value) {
      parsedTxt = getParsedText(e.target.value);
      if (parsedTxt) {
        chrome.storage.sync.get(["openAiApiKey"], async function (result) {
          if (result.openAiApiKey)
            e.target.value = await getResultFromChatGPT(parsedTxt.trim(), result.openAiApiKey);
          else
            alert("OpenAI API key not found. Please enter it by opening the extension.")
        })
      }
    }
  } else {
    parsedTxt = getParsedText(e.target.innerText);
    console.log('parsed - ', parsedTxt);
    if (parsedTxt) {
      chrome.storage.sync.get(["openAiApiKey"], async function (result) {
        if (result.openAiApiKey)
          e.target.innerText = await getResultFromChatGPT(parsedTxt.trim(), result.openAiApiKey);
        else
          alert("OpenAI API key not found. Please enter it by opening the extension.")
      })
    }
  }
};

document.addEventListener('keypress', debounce(getText, 2000));
