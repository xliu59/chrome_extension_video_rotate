/*
	A content script can exchange messages with its parent extension.
*/
console.log("in content.js");

// global variables
var elements; 
var original_values;

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded!");
	// make sure all elements are ready, so icon will show
	getTargetElements(() => {
		chrome.runtime.sendMessage({
			from: "content",
			subject: "ready"
		});
	});
});

function getTargetElements(callback){
	checkReady(); // recursion function with timeout
	callback();
}

function checkReady(){
	// check if elements are ready in every 0.2 second
	setTimeout(function() {
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
		var hasNull = !(container.length 	 > 0 && 
						video.length 		 > 0 && 
						separator.length 	 > 0 && 
						iv.length			 > 0 && 
						drag_preview.length  > 0 && 
						hover_preview.length > 0);

		if(hasNull){
			checkReady(); // recurse self
		}else{
			//assemble the global dictionary variables
			elements = {
				degree          : 0, // initial value
				container       : container,
				video           : video,
				separator       : separator,
				iv              : iv,
				drag_preview    : drag_preview,
				hover_preview   : hover_preview
			};
			original_values = {
				width           : pxFormat(container.width()), 
				height          : pxFormat(container.height()),
				sep_margin_top  : pxFormat(separator.css("margin-top")),
				iv_height       : pxFormat(iv.height()),
				video_margin_top: pxFormat(video.css("margin-top")),
				drag_margin_top : pxFormat(drag_preview.css("margin-top"))
			};
			// loop stops
			console.log("elements ready=", elements);
			console.log("original_values=", original_values);
		}
	}, 200);
}

function pxFormat(val){
	if (typeof val === "string" && val.indexOf("px") >= 0) {
		return val;
	}
	return val + "px";
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if((msg.from === "background") && (msg.subject === "rotate")) {
		console.log("RCV: new rotate command from popup : " + msg.value + " degree");
		rotateVideo(parseInt(msg.value), (currentDegree) => {
			sendResponse(currentDegree.toString());
		});
	};
});

function rotateVideo(deg, callback){
	try{
		var e = elements;
		var o = original_values;
		var diff = parseInt(o.width.slice(0, -2)) - parseInt(o.height.slice(0, -2));

		console.log("new values=", original_values);

		// set css style values
		if(deg == 90 || deg == 270){
			e.container.height(o.width); // enlarge video container;
			e.separator.css("margin-top", o.width); // move content separator 
														   // to fit changed container;
			e.iv.height(0); // change the clickable area;

			e.video.css("transform", "rotate("+ deg +"deg)"); // rotate video;
			e.video.css("margin-top", diff/2 + "px");  // move rotated video to center;

			e.drag_preview.css("transform", "rotate("+ deg +"deg)"); // rotate loading image
															  	     // when drag progress bar;
			e.drag_preview.css("margin-top", diff/2 + "px"); // move loding image;
			e.hover_preview.wrap(
				"<div style=\"position: relative; margin-top: "
				+ diff + "px\"></div>"
			); // progress image when hover on progress bar;
		}else{
			// set to original values
			e.container.height(o.height);
			e.separator.css("margin-top", o.sep_margin_top);
			e.iv.height(o.iv_height);
			e.video.css("margin-top", o.video_margin_top);
			e.drag_preview.css("margin-top", o.drag_margin_top);

			e.video.css("transform", "rotate("+ deg +"deg)");
			e.drag_preview.css("transform", "rotate("+ deg +"deg)");
			//TODO: check if the added wrap tag keeps appending, 
			//      and test if need removed
		}
		e.degree = deg;// update saved current degree;
		res = e.degree;
	} catch (error) {
		console.log("error:", error);
		res = error; // ruturn nothing as indicator on error;
	}
	callback(res);
}	