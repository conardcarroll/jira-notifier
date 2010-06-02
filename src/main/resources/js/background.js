var LOADING_ANIMATION_ = new LoadingAnimation();

var COLOR_RED_ = [208, 0, 24, 255];
var COLOR_BLUE_ = [ 100, 150, 250, 255];
var COLOR_GREY_ = [190, 190, 190, 230];

var PROCESSOR_;
var SERIALIZER_ = new XMLSerializer();

var issueCount_;
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
	chrome.browserAction.setBadgeBackgroundColor({color: COLOR_GREY_});
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	LOADING_ANIMATION_.start();
	
	if (!PROCESSOR_) {
		PROCESSOR_ = new XSLTProcessor();
		$.ajax({
			url: "jira.xsl",
			async: false,
			complete: function(xhr, status) {
				if (status == 'success') {
					PROCESSOR_.importStylesheet(xhr.responseXML);
				} else {
					showErrorMessage_();
				}
			}
		});
	}
	
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
	if (isNotificationEnabled() && count > issueCount_) {
		showNotification_(count - issueCount_);
	}	
	issueCount_ = count;
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	chrome.browserAction.setTitle({title: getFilterName() + ' - ' + issueCount_ + " Issues"});
	if (issueCount_ > 0) {
		var issueText = (issueCount_ > 999 ? '999+' : issueCount_ + '');
		var color = (count > issueCount_ ? COLOR_RED_ : COLOR_BLUE_);
		chrome.browserAction.setBadgeText({text: issueText});
		chrome.browserAction.setBadgeBackgroundColor({color: color});
		return;
	}
	if (issueCount_ == 0) {
		chrome.browserAction.setBadgeText({text: ''});
	}
}

function showNotification_(count) {
	var notification = webkitNotifications.createNotification(
		'img/icon-64.png',
		getFilterName(),
		'You have ' + count + ' new issue' + (count > 1 ? 's' : '') + '.'
	);
	notification.show();
}

function transformToString(xml) {
	var doc = PROCESSOR_.transformToDocument(xml);
	return SERIALIZER_.serializeToString(doc.documentElement);
}
