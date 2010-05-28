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
	updateFilters();
	$('#filters').val(getFilterId());
}

function updateFilters() {
	var url = $('#jira-url').val();
	var $filters = $('#filters');
	
	$.ajax({
		url: url + '/secure/ManageFilters.jspa',
		dataType: 'html',
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
				}
			});
			
		}
	});
}