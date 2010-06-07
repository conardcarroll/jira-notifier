var REFRESH_INTERVAL_KEY_ = 'refresh-interval';
var JIRA_URL_KEY_ = 'jira-url';
var FILTER_ID_KEY_ = 'filter-id';
var FILTER_NAME_KEY_ = 'filter-name';
var NOTIFICATION_ENABLED_KEY_ = 'notification-enabled';
var ANIMATION_ENABLED_KEY_ = 'animation-enabled';

var FEED_URL_ = '{baseUrl}/sr/jira.issueviews:searchrequest-xml/{filterId}/SearchRequest-{filterId}.xml?field=key&field=summary&field=description&field=link&field=type&field=priority&tempMax={count}';
var PER_PAGE_ = 10;

function getRefreshInterval() {
	return parseInt(localStorage[REFRESH_INTERVAL_KEY_] || '300000', 10);
}

function setRefreshInterval(value) {
	localStorage[REFRESH_INTERVAL_KEY_] = value;
}

function getJiraUrl() {
	return localStorage[JIRA_URL_KEY_];
}

function setJiraUrl(value) {
	localStorage[JIRA_URL_KEY_] = value;
}

function getFilterId() {
	return localStorage[FILTER_ID_KEY_];
}

function setFilterId(value) {
	localStorage[FILTER_ID_KEY_] = value;
}

function getFilterName() {
	return localStorage[FILTER_NAME_KEY_];
}

function setFilterName(value) {
	localStorage[FILTER_NAME_KEY_] = value;
}

function isNotificationEnabled() {
	return localStorage[NOTIFICATION_ENABLED_KEY_] === 'true';
}

function setNotificationEnabled(value) {
	localStorage[NOTIFICATION_ENABLED_KEY_] = value;
}

function isAnimationEnabled() {
	return localStorage[ANIMATION_ENABLED_KEY_] === 'true';
}

function setAnimationEnabled(value) {
	localStorage[ANIMATION_ENABLED_KEY_] = value;
}

function getPerPage() {
	return PER_PAGE_;
}

function getFeedUrl(count) {
	return FEED_URL_.format({
		'baseUrl': getJiraUrl(),
		'filterId': getFilterId(),
		'count': count
	});
}

String.prototype.format = function() {
	var pattern = /\{\w+\}/g;
	var args = arguments;
	return this.replace(pattern, function(capture){ return args[0][capture.match(/\w+/)]; });
}