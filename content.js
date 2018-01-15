/*
	A content script can exchange messages with its parent extension.
*/
console.log("in content.js");
var elements = {}; // global var

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded!");
	getTargetElements((elements) => {
		if(!elements.hasNull){
			chrome.runtime.sendMessage({
				from: "content",
				subject: "ready"
			});
		}else{
			console.log("not ready");
		}
	});
});

function getTargetElements(callback){

    // get needed elements
	var container = $("#player-container");
	// console.log("jQ: player-container=", container);
	var video = $("video");
	// console.log("jQ: video=", video);
	var separator = $("#content-separator");
	// console.log("jQ: separator=", separator);
	var iv = $(".ytp-iv-video-content");
	// console.log("jQ: iv=", iv);
	var drag_preview = $(".ytp-storyboard-framepreview");
	var hover_preview = $(".ytp-tooltip-bg").parent("[data-layer=4]");

	// check if all elements are available
	var hasNull = !(container && video && separator && 
					iv && drag_preview && hover_preview);

	//assemble the message object
	elements = {
		hasNull: hasNull,
		degree: 0, // init value 0 degree
		container: container,
		video: video,
		separator: separator,
		iv: iv,
		drag_preview: drag_preview,
		hover_preview: hover_preview
	};

	callback(elements);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if((msg.from === "background") && (msg.subject === 90)) {
		console.log("RCV: new command from background : do 90 rotation");
		rotateVideo(90, (currentDegree) => {
			sendResponse(currentDegree);
		});
	};
});

function rotateVideo(deg, callback){
	try{
		var e = elements;

		// calculate needed values
		var hei = e.container.height();
		var wid = e.container.width();

		// set css style values
		e.container.height(wid);
		e.video.css("transform", "rotate(90deg)");
		e.video.css("margin-top", (wid - hei)/2 + "px");
		e.separator.css("margin-top", wid + "px");
		e.iv.height(0);
		e.drag_preview.css("transform", "rotate(90deg)");
		e.drag_preview.css("margin-top", (wid - hei)/2 + "px");
		e.hover_preview.wrap("<div style=\"position: relative; margin-top: "+ (wid - hei)+"px\"></div>");
		e.degree = 90;
		callback(e.degree);
	} catch (error) {
		console.log("error:", error);
		callback(error); // ruturn nothing as indicator on error;
	}
}