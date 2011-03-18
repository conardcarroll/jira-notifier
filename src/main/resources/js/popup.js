var JIRA_URL_RE = /https?\:\/\/.*\/jira\//;
var QUICK_SEARCH_URL = "/secure/QuickSearch.jspa?searchString=";

function init() {
	setTimeout(function() {
		setContent(0);
	}, 10);
}

function getJiraTab(callback) {
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url && JIRA_URL_RE.test(tab.url)) {
				callback(tab);
				return;
			}
		}
		callback(null);
	});
}

function openJiraTab(jiraUrl) {
	getJiraTab(function(tab) {
		if (tab) {
			chrome.tabs.update(tab.id, {selected: true, url: jiraUrl});
		} else {
			chrome.tabs.create({url: jiraUrl});
		}
		window.close();
	});
}

function quickSearch() {
	openJiraTab(getJiraUrl() + QUICK_SEARCH_URL + $('#quick-search').val());
}

function setContent(start) {
	var $items = $('#items');
	var $spacer = $('#spacer');
	var $content = $('#content');
	$spacer.height($items.height());
	$('#count').html('<img src="img/spinner.gif"></img>');
	$items.hide(0, function() {
		$spacer.show();
		$.ajax({
			url: getFeedUrl(getPerPage()) + "&pager/start=" + start,
			complete: function(xhr, status) {
				if (status == 'success') {
					var h = chrome.extension.getBackgroundPage().transformToString(xhr.responseXML);
					$content.html(h);
					$items = $('#items');
					$items.find('td[title]').tooltip({
						tip: '.tooltip',
						effect: 'fade',
						fadeOutSpeed: 100,
						predelay: 400,
					}).dynamic();
					$items.show();
					chrome.extension.getBackgroundPage().reload();
				} else {
					showErrorMessage();
				}
			},
			error: showErrorMessage
		});
	});
}

function showErrorMessage() {
	$('#content').html('<div class="message">Could not retrieve JIRA issues.</div>');
}