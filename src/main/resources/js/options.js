var CHECK_URL_ = "/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?tempMax=0"

function saveOptions() {
	var $saveButton = $('#save-button');
	$saveButton.attr('disabled', 'disabled');
	$saveButton.text('Saved');
	setTimeout(function() {
		$saveButton.removeAttr('disabled');
		$saveButton.text('Save');
	}, 750);
	setJiraUrl($('#jira-url').val());
	setQuery($('#query').val());
	setRefreshInterval($('#refresh-interval').val());
	chrome.extension.getBackgroundPage().reload();
}

function restoreOptions() {
	$('#jira-url').val(getJiraUrl());
	$('#query').val(getQuery());
	$('#refresh-interval').val(getRefreshInterval());
}

function checkJiraUrl() {
	var $jiraUrl = $('#jira-url');
	var $jiraMessage = $('#jira-message');
	var $saveButton = $('#save-button');
	$.ajax({
		url: $jiraUrl.val() + CHECK_URL_,
		complete: function(xhr, status) {
			if (status == 'success') {
				var xml = xhr.responseXML;
				console.log(xml);
				var version = $(xml).find('version').text();
				if (version.indexOf('4.0') == 0) {
					$jiraUrl.removeClass('error');
					$jiraMessage.hide();
					$saveButton.removeAttr('disabled');
					return;
				}
			}
			$jiraUrl.addClass('error');
			$jiraMessage.show();
			$saveButton.attr('disabled', 'disabled');
		}
	});
}

function toggleAdvanced() {
	$('.advanced').toggle();
}