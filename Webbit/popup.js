document.addEventListener('DOMContentLoaded', function () {
  const getSummaryButton = document.getElementById('getSummaryButton');
  const getImportantPointsButton = document.getElementById('getImportantPointsButton');
  const summaryDiv = document.getElementById('summary');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');


  console.log("Here0")


  var webPageRawText= null;


  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'webpageTextSentForSummary') {
      // webPageText= message.text;
      console.log("Here")

    getSummaryButton.style.display = 'none';
    getImportantPointsButton.style.display = 'none';


    getSummary( message.text);
    const headingDiv = document.getElementById('summaryHeading');
    headingDiv.style.display="block";
    headingDiv.innerHTML = `<h5>${"Summary"}</h5>`;


  
    }
  });



  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'webpageTextSentForPoints') {
      // webPageText= message.text;
      console.log("Here")

    getSummaryButton.style.display = 'none';
    getImportantPointsButton.style.display = 'none';
    
  
    getPoints( message.text);
    const headingDiv = document.getElementById('summaryHeading');
    headingDiv.style.display="block";
    headingDiv.innerHTML = `<h5>${"Important Points"}</h5>`;


  
    }
  });
  
  
  

  getSummaryButton.addEventListener('click', function () {
    getSummary(webPageRawText);

  });


  getImportantPointsButton.addEventListener('click', function () {
    getPoints(webPageRawText);
  }
  
  );


  function getPoints(webPageText){

    showProgressBar();

    if(webPageText==null){


    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            function: getWebpageText,
          },
          function (results) {
            const webpageText = results[0].result;

            const headingDiv = document.getElementById('summaryHeading');
            headingDiv.style.display="block";
            headingDiv.innerHTML = `<h5>${"Important Points"}</h5>`;
            

            sendTextToAPI("Here is raw text from a webpage; Extract important points: " + webpageText.slice(0, 2500));
          }
        );
      } else {
        summaryDiv.innerText = 'No active tab found.';
      }
    });

  }
  else{
   
    sendTextToAPI("Here is raw text from a webpage; Extract important points: " +webPageText);

  }
  


}


  function getSummary(webPageText){

    console.log("Here in getsumm"+ webPageText);
    showProgressBar();

    if(webPageText==null){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            function: getWebpageText,
          },
          function (results) {
            
            var webpageText = results[0].result;

            const headingDiv = document.getElementById('summaryHeading');
            headingDiv.style.display="block";
            headingDiv.innerHTML = `<h5>${"Summary"}</h5>`;

            sendTextToAPI("Here is raw text from a webpage; Summarize it: " +webpageText);
          }
        );
      } else {
        summaryDiv.innerText = 'No active tab found.';
      }
    });
  }
  else{
   
    sendTextToAPI("Here is raw text from a webpage; Summarize it: " +webPageText);

  }

}

  function getWebpageText() {
    return document.body.innerText;
  }

  function showProgressBar() {
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.innerText = 'Request in progress...';
  }

  function hideProgressBar() {
    progressContainer.style.display = 'none';
  }


// Add an event listener to the "Copy Summary" button
document.getElementById("copySummaryButton").addEventListener("click", function () {
  // Get the button element
  var copyButton = document.getElementById("copySummaryButton");

  // Get the text content from the summary element
  var summaryText = document.getElementById("summary").textContent;

  // Create a temporary textarea element to style the text
  var textArea = document.createElement("textarea");
  textArea.style.fontSize = "12px"; // Adjust the font size as needed
  textArea.value = summaryText;

  // Append the textarea to the document
  document.body.appendChild(textArea);

  // Select the text within the textarea
  textArea.select();

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Remove the temporary textarea
  document.body.removeChild(textArea);

  // Change the button text to "Copied"
  copyButton.textContent = "Copied";

  // Change the button color to dark grey
  copyButton.style.backgroundColor = "gray";

  // Revert the button text and color after 5 seconds
  setTimeout(function () {
    copyButton.textContent = "Copy";
    copyButton.style.backgroundColor = "#2c3e50"; // Set the original button color
  }, 5000); // 5000 milliseconds (5 seconds)
});


  function sendTextToAPI(text) {
    const apiKey = "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";
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // Prepare the request data
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }],
      temperature: 0.7,
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        hideProgressBar();
        if (!response.ok) {
          throw {
            message: "Error fetching summary.",
            response: response, // Include the response object
          };
        }
        return response.json();
      })
      .then((data) => {
        // Assuming the API response contains a 'choices' array with the summary in 'message' field
        const summary = data.choices[0].message.content;
        summaryDiv.innerText = summary;
        webPageRawText=null;
      })
      .catch(async (error) => {
        let errorMessage = `Error: ${error.message}`;

        // Check if there's a response body to log
        if (error.response && error.response.body) {
          try {
            const responseBody = await error.response.json();
            errorMessage += `\nResponse Body: ${JSON.stringify(responseBody, null, 2)}`;
          } catch (parseError) {
            console.error("Error parsing response body:", parseError);
          }
        }

        summaryDiv.innerText = errorMessage;
        console.error(error);
      });
  }
});
