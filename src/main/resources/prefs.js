var REFRESH_INTERVAL_KEY = 'refresh-interval';
var JIRA_URL_KEY = 'jira-url';
var QUERY_KEY = 'query';
var DEFAULT_QUERY = 'assignee = currentUser() AND resolution = unresolved ORDER BY priority DESC, created ASC';

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

function getQuery() {
	return localStorage[QUERY_KEY] || DEFAULT_QUERY;
}

function setQuery(value) {
	localStorage[QUERY_KEY] = value;
}
