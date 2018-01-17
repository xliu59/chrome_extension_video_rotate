/*
	NOTE: popup scripts and background scrips [share contents]
	The popup doesn't need to duplicate code that's in the background page 
	because the popup can invoke functions on the background page.
*/

document.addEventListener("DOMContentLoaded", () => {
	console.log("Popup loaded!");
	addPopupListener();
});

function addPopupListener(){
	// use JavaScript Event Delegation
	var buttons = document.getElementById('button-list');

	if(document.addEventListener){
    	buttons.addEventListener('click', sendCommand); //W3C
	}else{
		buttons.attachEvent('onclick', sendCommand); //IE
	}
}

function sendCommand(e) {
	if(e.target && e.target.nodeName === 'INPUT'){
		console.log("rotate " + e.target.value + " button clicked");
		
		var msg = ({
			from: "popup",
			subject: "rotate",
			value: e.target.value
		});

		chrome.runtime.sendMessage(msg, function(response) {
			if(response){
				console.log("RCV: background says: ", response);
			}else{
				console.log("NO response!", response);
			}
		});
	}
}


