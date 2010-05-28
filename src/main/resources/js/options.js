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
	
	var $filters = $('#filters');
	setFilterId($filters.val());
	setFilterName($filters.find('option:selected').text());
	setRefreshInterval($('#refresh-interval').val());	
	
	chrome.extension.getBackgroundPage().reload();
}

function restoreOptions() {
	$('#jira-url').val(getJiraUrl());
	$('#refresh-interval').val(getRefreshInterval());
	updateFilters(false);
	$('#filters').val(getFilterId());
}

function updateFilters() {
	var url = $('#jira-url').val();
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

function checkJiraUrl() {
	var $spinner = $('#spinner');
	$spinner.show();
	var $jiraUrl = $('#jira-url');
	var $jiraMessage = $('#jira-message');
	var $saveButton = $('#save-button');
	$.ajax({
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
			if (valid) {
				$jiraUrl.removeClass('error');
				$jiraMessage.hide();
				$saveButton.removeAttr('disabled');
				updateFilters();
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
