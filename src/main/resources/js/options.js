var CHECK_URL_ = "/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?tempMax=0"

var jiraCheckRequest_;

function saveOptions() {
	var $saveButton = $('#save-button');
	$saveButton.attr('disabled', 'disabled');
	$saveButton.text('Saved');
	setTimeout(function() {
		$saveButton.removeAttr('disabled');
		$saveButton.text('Save');
	}, 750);
	
	var $jiraUrl = $('#jira-url');
	var $jiraSelect = $('#jira-url-select');
	var url;
	if ($jiraUrl.is(':hidden')) {
		url = $jiraSelect.val();
	} else {
		url = $jiraUrl.val();
	}	
	setJiraUrl(url);
	
	var $filters = $('#filters');
	setFilterId($filters.val());
	setFilterName($filters.find('option:selected').text());
	setRefreshInterval($('#refresh-interval').val());
	
	setNotificationEnabled($('#notification-enabled').is(':checked'));
	
	chrome.extension.getBackgroundPage().reload(true);
}

function restoreOptions() {
	var jiraUrl = getJiraUrl();
	$('#jira-url').val(jiraUrl);
	$('#refresh-interval').val(getRefreshInterval());
	updateJiraSelect(jiraUrl);
	updateFilters(jiraUrl);
	$('#filters').val(getFilterId());
	if (isNotificationEnabled()) {
		$('#notification-enabled').attr('checked', true);
	}
}

function updateJiraSelect(jiraUrl) {
	var query = { 'text': 'jira AND secure', 'startTime': 0 };
	chrome.history.search(query, function(results) {
		results.sort(function(a, b) {
			return b.visitCount - a.visitCount;
		});	
		var $jiraSelect = $('#jira-url-select');
		$jiraSelect.children().remove();
		for (var i = 0; i < results.length; i++) {
			var historyItem = results[i];
			var url = historyItem.url;
			var title = historyItem.title;
			if (url && title && url.indexOf('/secure/Dashboard') != -1) {
				title = title.substring(title.lastIndexOf('-') + 2);
				url = url.substring(0, url.lastIndexOf('/secure'));
				$jiraSelect.append($('<option></option>').val(url).html(title));
			}
		}
		$jiraSelect.val(jiraUrl);
	});
}

function updateFilters(url) {		
	var $filters = $('#filters');
	$filters.children().remove();
	
	$.ajax({
		url: url + '/secure/ManageFilters.jspa',
		dataType: 'html',
		cache: false,
		async: false,
		complete: function(xhr, status) {
			var $h = $(xhr.responseText);
			$h.find('a[id^=filterlink]').each(function(index, value) {
				var id = $(value).attr('id');
				var pos = id.lastIndexOf('_');
				if (pos > -1) {
					id = id.substring(pos + 1);
					var name = $(value).text();
					$filters.append($('<option></option>').val(id).html(name));
					$filters.removeAttr('disabled');
				}
			});
			
		}
	});
}

function checkJiraUrl(selectInput) {
	var $spinner = $('#spinner');
	$spinner.show();
	if (jiraCheckRequest_) {
		jiraCheckRequest_.abort();
	}
	var $jiraUrl = (selectInput ? $('#jira-url-select') : $('#jira-url'));
	var $otherJiraUrl = (!selectInput ? $('#jira-url-select') : $('#jira-url'));
	var $jiraMessage = $('#jira-message');
	var $saveButton = $('#save-button');
	jiraCheckRequest_ = $.ajax({
		url: $jiraUrl.val() + CHECK_URL_,
		async: true,
		cache: false,
		complete: function(xhr, status) {
			var valid = false;
			if (status == 'success') {
				var xml = xhr.responseXML;
				var version = $(xml).find('version').text();
				valid = (version.indexOf('4.') == 0);
			}
			if (xhr.status == 0) {
				valid = true;
			}
			if (valid) {
				$jiraUrl.removeClass('error');
				$otherJiraUrl.val($jiraUrl.val());
				$jiraMessage.hide();
				$saveButton.removeAttr('disabled');
				updateFilters($jiraUrl.val());
			} else {
				$jiraUrl.addClass('error');
				$jiraMessage.show();
				$saveButton.attr('disabled', 'disabled');
				$('#filters').attr('disabled', 'disabled');
			}
			$spinner.hide();
		}
	});
}

function requestNotifications() {
	var $notificationEnabled = $('#notification-enabled');
	if ($notificationEnabled.is(':checked')) {
		webkitNotifications.requestPermission(function() {
			if (webkitNotifications.checkPermission() != 0) {
				$notificationEnabled.removeAttr('checked');
				$notificationEnabled.attr('disabled', 'disabled');
				setNotificationEnabled(false);
			}
		});
	}
}

function toggleJira() {
	$('#jira-url').toggle();
	$('#jira-url-select').toggle();
	$('#toggle-jira').html('Select JIRA from history');
}
