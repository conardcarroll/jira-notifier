var JIRA_URL_RE_ = /https?\:\/\/.*\/jira\//;
var QUICK_SEARCH_URL_ = "/secure/QuickSearch.jspa?searchString=";

var PROCESSOR_;
var SERIALIZER_ = new XMLSerializer();

function init() {
	if (!PROCESSOR_) {
		PROCESSOR_ = new XSLTProcessor();
		$.ajax({
			url: "jira.xsl",
			async: false,
			complete: function(xhr, status) {
				if (status == 'success') {
					console.log(xhr.responseXML);
					PROCESSOR_.importStylesheet(xhr.responseXML);
				} else {
					showErrorMessage_();
				}
			}
		});
	}
    setContent(0);
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
	chrome.extension.getBackgroundPage().reload();
	$.ajax({
		url: getFeedUrl(10) + "&pager/start=" + start,
		complete: function(xhr, status) {
			if (status == 'success') {
				var doc = PROCESSOR_.transformToDocument(xhr.responseXML);
				var h = SERIALIZER_.serializeToString(doc.documentElement);
				$('#content').html(h);
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