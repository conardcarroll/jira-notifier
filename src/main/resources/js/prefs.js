var REFRESH_INTERVAL_KEY = 'refresh-interval';
var JIRA_URL_KEY = 'jira-url';
var FILTER_ID_KEY = 'filter-id';
var FILTER_NAME_KEY = 'filter-name';
var NOTIFICATION_ENABLED_KEY = 'notification-enabled';

var FEED_URL = '{baseUrl}/sr/jira.issueviews:searchrequest-xml/{filterId}/SearchRequest-{filterId}.xml?field=key&field=summary&field=description&field=link&field=type&field=priority&tempMax={count}';
var PER_PAGE = 10;

function getRefreshInterval() {
	return parseInt(localStorage[REFRESH_INTERVAL_KEY] || '300000', 10);
}

function setRefreshInterval(value) {
	localStorage[REFRESH_INTERVAL_KEY] = value;
}

function getJiraUrl() {
	return localStorage[JIRA_URL_KEY];
}

function setJiraUrl(value) {
	localStorage[JIRA_URL_KEY] = value;
}

function getFilterId() {
	return localStorage[FILTER_ID_KEY];
}

function setFilterId(value) {
	localStorage[FILTER_ID_KEY] = value;
}

function getFilterName() {
	return localStorage[FILTER_NAME_KEY];
}

function setFilterName(value) {
	localStorage[FILTER_NAME_KEY] = value;
}

function isNotificationEnabled() {
	return localStorage[NOTIFICATION_ENABLED_KEY] === 'true';
}

function setNotificationEnabled(value) {
	localStorage[NOTIFICATION_ENABLED_KEY] = value;
}

function getPerPage() {
	return PER_PAGE;
}

function getFeedUrl(count) {
	return FEED_URL.format({
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