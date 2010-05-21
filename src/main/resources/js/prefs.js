var REFRESH_INTERVAL_KEY_ = 'refresh-interval';
var JIRA_URL_KEY_ = 'jira-url';
var QUERY_KEY_ = 'query';
var DEFAULT_QUERY_ = 'assignee = currentUser() AND resolution = unresolved ORDER BY priority DESC, created ASC';

var FEED_URL_ = "/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?field=key&field=summary&field=description&field=link&field=type&field=priority&jqlQuery=";

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

function getQuery() {
	return localStorage[QUERY_KEY_] || DEFAULT_QUERY_;
}

function setQuery(value) {
	localStorage[QUERY_KEY_] = value;
}

function getFeedUrl(count) {
	return getJiraUrl() + FEED_URL_ + encodeURI(getQuery()) + '&tempMax=' + count;
}