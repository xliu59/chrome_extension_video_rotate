/*
	A content script can exchange messages with its parent extension.
*/
console.log("in content.js");

// global variables
var elements; 
var original_values;

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM loaded!");
	getTargetElements((elements) => {
		console.log("elements=", elements);
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
	var hasNull = !(container.length()>0 && video && separator && 
					iv && drag_preview && hover_preview); // TODO: will never be true because will
														 // always have jquery.fn.init()

	//assemble the global dictionary variables
	elements = {
		hasNull         : hasNull,
		degree          : 0, // initial value
		container       : container,
		video           : video,
		separator       : separator,
		iv              : iv,
		drag_preview    : drag_preview,
		hover_preview   : hover_preview
	};
	console.log("elements=",elements);
	callback(elements);
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
	var res;
	try{
		var e = elements;
		if(!original_values){
			original_values = {
				width           : e.container.width(), 
				height          : e.container.height(),
				sep_margin_top  : e.separator.css("margin-top"),
				iv_height       : e.iv.height(),
				video_margin_top: e.video.css("margin-top"),
				drag_margin_top : e.drag_preview.css("margin-top")
			};
		}
		var o = original_values;

		var diff = o.width - o.height;
		console.log("new values=", original_values);
		console.log("container width=", e.container.width());
		// set css style values
		if(deg == 90 || deg == 270){
			e.container.height(o.width + "px"); // enlarge video container;
			console.log("original sep top=", o.sep_margin_top + "")
			e.separator.css("margin-top", o.width + "px"); // move content separator 
														   // to fit changed container;
			console.log("mew sep top=", e.separator.css("margin-top") + "");
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
			e.container.height(o.height + "px");
			e.separator.css("margin-top", o.sep_margin_top + "px");
			e.iv.height(o.iv_height + "px");
			e.video.css("margin-top", o.video_margin_top + "px");
			e.drag_preview.css("margin-top", o.drag_margin_top + "px");

			e.video.css("transform", "rotate("+ deg +"deg)");
			e.drag_preview.css("transform", "rotate("+ deg +"deg)");
		}
		// e.container.height(wid);
		// e.video.css("transform", "rotate(90deg)");
		// e.video.css("margin-top", (wid - hei)/2 + "px");
		// e.separator.css("margin-top", wid + "px");
		// e.iv.height(0);
		// e.drag_preview.css("transform", "rotate(90deg)");
		// e.drag_preview.css("margin-top", (wid - hei)/2 + "px");
		// e.hover_preview.wrap("<div style=\"position: relative; margin-top: "+ (wid - hei)+"px\"></div>");
		e.degree = deg;// update saved current degree;
		res = e.degree;

	} catch (error) {
		console.log("error:", error);
		res = error; // ruturn nothing as indicator on error;
	}
	callback(res)
}