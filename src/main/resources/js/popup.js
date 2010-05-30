var JIRA_URL_RE_ = /https?\:\/\/.*\/jira\//;
var QUICK_SEARCH_URL_ = "/secure/QuickSearch.jspa?searchString=";

function init() {
	setTimeout(function() {
		setContent(0);
	}, 10);
}

function getJiraTab_(callback) {
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url && JIRA_URL_RE_.test(tab.url)) {
				callback(tab);
				return;
			}
		}
		callback(null);
	});
}

function openJiraTab(jiraUrl) {
	getJiraTab_(function(tab) {
		if (tab) {
			chrome.tabs.update(tab.id, {selected: true, url: jiraUrl});
		} else {
			chrome.tabs.create({url: jiraUrl});
		}
		window.close();
	});
}

function quickSearch() {
	openJiraTab(getJiraUrl() + QUICK_SEARCH_URL_ + $('#quick-search').val());
}

function setContent(start) {
	$.ajax({
		url: getFeedUrl(getPerPage()) + "&pager/start=" + start,
		complete: function(xhr, status) {
			if (status == 'success') {
				var h = chrome.extension.getBackgroundPage().transformToString(xhr.responseXML);
				$('#content').html(h);
				$('td[title]').tooltip({
					tip: '.tooltip',
					effect: 'fade',
					fadeOutSpeed: 100,
					predelay: 400,
				}).dynamic();
				chrome.extension.getBackgroundPage().reload();
			} else {
				showErrorMessage_();
			}
		},
		error: showErrorMessage_
	});
}

function showErrorMessage_() {
	$('#content').html('<div class="message">Could not retrieve JIRA issues.</div>');
}