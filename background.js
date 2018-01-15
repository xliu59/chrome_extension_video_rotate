// alert("in background.js");
var tabId = null;

chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === "content") && (msg.subject === "ready")) {
    // Enable the page-action for the requesting tab
    console.log("RCV: content dom elements are ready! senderId: ", sender.tab.id);
    chrome.pageAction.show(sender.tab.id);
    tabId = sender.tab.id;
  }
});


/**
 *	Forward the command from popup to content, 
 *	and also forward the response from content to popup
 */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if((msg.from === "popup") && (msg.subject === 90)) {
		console.log("FWD: new command from popup : do 90 rotation");
		msg.from = "background";
		chrome.tabs.sendMessage(tabId, msg, (response) => {
			if(!(response instanceof Error)){
				console.log("FWD: response from centent:", response);
				sendResponse(response);
			}else{
				console.log("ERROR from content:", response);
			}
		});
		return true; //This function becomes invalid when the event listener returns, 
					 //unless you return true from the event listener to indicate 
					 //you wish to send a response asynchronously (this will keep the 
					 //message channel open to the other end until sendResponse is called).
	}
});

