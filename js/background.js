var LOADING_ANIMATION = new LoadingAnimation();

var COLOR_RED = [208, 0, 24, 255];
var COLOR_BLUE = [ 100, 150, 250, 255];
var COLOR_GREY = [190, 190, 190, 230];

var PROCESSOR;
var SERIALIZER = new XMLSerializer();

var issueCount;
var requestTimeout;

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
	chrome.browserAction.setBadgeBackgroundColor({color: COLOR_GREY});
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	LOADING_ANIMATION.start();
	
	if (!PROCESSOR) {
		PROCESSOR = new XSLTProcessor();
		$.ajax({
			url: "jira.xsl",
			async: false,
			complete: function(xhr, status) {
				if (status == 'success') {
					PROCESSOR.importStylesheet(xhr.responseXML);
				} else {
					showErrorMessage();
				}
			}
		});
	}
	
	startRequest();
}

function startRequest() {
	LOADING_ANIMATION.start();
	$.ajax({
		url: getFeedUrl(0),
		complete: function (xhr, status) {
			LOADING_ANIMATION.stop();
			if (status == 'success') {
				var xml = xhr.responseXML;
				updateIssueCount($(xml).find('issue').attr('total'));
			} else {
				showLoggedOut();
			}
			scheduleRequest();
		},
		error: function(xhr, status, error) {
			scheduleRequest();
		}
	});
}

function scheduleRequest() {
	if (requestTimeout) {
		window.clearInterval(requestTimeout);
	}
	requestTimeout = window.setInterval(startRequest, getRefreshInterval());
}

function showLoggedOut() {
	chrome.browserAction.setIcon({path: 'img/icon-signed-out.png'});
	chrome.browserAction.setBadgeBackgroundColor({color: COLOR_GREY});
	chrome.browserAction.setBadgeText({text: '?'});
}

function updateIssueCount(count) {
	count = parseInt(count);
	if (count != 0 && !count) {
		showLoggedOut();
		return;
	}
	if (isNotificationEnabled() && count > issueCount) {
		showNotification(count - issueCount);
	}
	var oldCount = issueCount;
	issueCount = count;
	chrome.browserAction.setIcon({path: 'img/icon-signed-in.png'});
	chrome.browserAction.setTitle({title: getFilterName() + ' - ' + issueCount + " Issues"});
	if (issueCount > 0) {
		var issueText = (issueCount > 999 ? '999+' : issueCount + '');
		var color = (issueCount > oldCount ? COLOR_RED : COLOR_BLUE);
		chrome.browserAction.setBadgeText({text: issueText});
		chrome.browserAction.setBadgeBackgroundColor({color: color});
		return;
	} else {
		chrome.browserAction.setBadgeText({text: ''});
	}
}

function showNotification(count) {
	var notification = webkitNotifications.createNotification(
		'img/icon-64.png',
		getFilterName(),
		'You have ' + count + ' new issue' + (count > 1 ? 's' : '') + '.'
	);
	window.setTimeout(function() {
		notification.cancel();
	}, 5000);
	notification.show();
}

function transformToString(xml) {
	var doc = PROCESSOR.transformToDocument(xml);
	return SERIALIZER.serializeToString(doc.documentElement);
}
