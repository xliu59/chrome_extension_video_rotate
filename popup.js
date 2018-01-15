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
	// TODO: use JavaScript Event Delegation
	var rotate90 = document.getElementById('90deg');
	var rotate180 = document.getElementById('180deg');
	var rotate270 = document.getElementById('270deg');
	var reset = document.getElementById('reset');

	if(document.addEventListener){
    	rotate90.addEventListener('click', sendCommand); //W3C
	}else{
		rotate90.attachEvent('onclick', sendCommand);
	}
}


function sendCommand() {
	console.log("rotate90 button clicked");
	var msg = ({
		from: "popup",
		subject: 90
	});

	chrome.runtime.sendMessage(msg, function(response) {
		if(response){
			console.log("RCV: background says: ", response);
		}else{
			console.log("NO response!", response);
		}
	});
}


