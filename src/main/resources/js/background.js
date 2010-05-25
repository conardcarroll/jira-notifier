var LOADING_ANIMATION_ = new LoadingAnimation();

var COLOR_RED_ = [208, 0, 24, 255];
var COLOR_GREY_ = [190, 190, 190, 230];

var issueCount_ = -1;
var requestTimeout_;

function LoadingAnimation() {
	this.timerId_ = 0;
	this.maxCount_ = 8;  // Total number of states in animation
	this.current_ = 0;  // Current state
	this.maxDot_ = 4;  // Max number of dots in animation
}

LoadingAnimation.prototype.paintFrame = function() {
	var text = "";
	for (var i = 0; i < this.maxDot_; i++) {
		text += (i == this.current_) ? "." : " ";
	}
	if (this.current_ >= this.maxDot_)
		text += "";

	chrome.browserAction.setBadgeText({text:text});
	this.current_++;
	if (this.current_ == this.maxCount_)
		this.current_ = 0;
}

LoadingAnimation.prototype.start = function() {
	if (this.timerId_)
		return;

	var self = this;
	this.timerId_ = window.setInterval(function() {
		self.paintFrame();
	}, 100);
}

LoadingAnimation.prototype.stop = function() {
	if (!this.timerId_)
		return;

	window.clearInterval(this.timerId_);
	this.timerId_ = 0;
}

function init() {
	chrome.browserAction.setBadgeBackgroundColor({color: COLOR_RED_});
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	LOADING_ANIMATION_.start();
	startRequest_();
}

function startRequest_() {
	$.ajax({
		url: getFeedUrl(0),
		complete: function (xhr, status) {
			LOADING_ANIMATION_.stop();
			if (status == 'success') {
				var xml = xhr.responseXML;
				updateIssueCount_($(xml).find('issue').attr('total'));
			} else {
				showLoggedOut_();
			}
			scheduleRequest_();
		}
	});
}

function scheduleRequest_() {
	if (requestTimeout_) {
		window.clearInterval(requestTimeout_);
	}
	requestTimeout = window.setTimeout(startRequest_, getRefreshInterval());
}

function showLoggedOut_() {
	chrome.browserAction.setIcon({path: 'img/icon-signed-out.png'});
	chrome.browserAction.setBadgeBackgroundColor({color: COLOR_GREY_});
	chrome.browserAction.setBadgeText({text: '?'});
}

function updateIssueCount_(count) {
	if (!count) {
		showLoggedOut_();
		return;
	}
	issueCount_ = count;
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	if (issueCount_ > 0) {
		chrome.browserAction.setBadgeText({text: issueCount_ + ''});
		chrome.browserAction.setBadgeBackgroundColor({color: COLOR_RED_});
		return;
	}
	if (issueCount_ == 0) {
		chrome.browserAction.setBadgeText({text: ''});
	}
}
