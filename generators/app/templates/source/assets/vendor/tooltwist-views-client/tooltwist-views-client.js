// tooltwistViews-client.js



var TooltwistViews = (function(){

  return {
    init: function(options) {

    },

    // API calls
    select: tooltwistViews_select,
    save: tooltwistViews_save,

    // metadata-related
    fieldsForMode: tooltwistViews_findFieldsForMode,

    // Rendering
    htmlForAngular_list: tooltwistViews_htmlForAngular_list,
    htmlForAngular_description: tooltwistViews_htmlForAngular_description,
    htmlForAngular_horizontalDescription: tooltwistViews_htmlForAngular_horizontalDescription,
    htmlForAngular_edit: tooltwistViews_htmlForAngular_edit,

    // Functions called by Angular during rendering
    displayDate: displayDate,
    displayTime: displayTime,
    displayDatetime: displayDatetime,
    displayFromNow: displayFromNow,
    displayCurrency: displayCurrency,
    displayCurrency2: displayCurrency2,
    displayDollars: displayDollars,
    displayDollars2: displayDollars2,
    displayPounds: displayPounds,
    displayPounds2: displayPounds2,

  }; // end of the TooltwistViews object

  /*
   *  Display date only.
   */
  function displayDate(value) {
    return moment(value).format('MMMM Do YYYY');
  }

  /*
   *  Display time only.
   */
  function displayTime(value) {
    return moment(value).format('hh:mm');
  }

  /*
   *  Display date and time.
   */
  function displayDatetime(value) {
    return moment(value).format('MMMM Do YYYY hh:mm');
  }

  /*
   *  Display a time relative to now (e.g. 5 minutes ago)
   */
  function displayFromNow(datetimeValue) {
    var fromNow = '';
    if (datetimeValue==null || datetimeValue=='') {
      // Not specified
      return '';
    }

		var comparison = moment(datetimeValue);
		if (comparison.isValid()) {
			var now = moment(new Date());

			// Minute comparison
			var dateDiff = now.diff(comparison, 'minutes');
			if (dateDiff === 0) {
				fromNow = 'Just now';
			}
			else if (dateDiff >= 1 && dateDiff <= 120) {
				fromNow = dateDiff + ' min ago';
			}

			// Hour comparison
			dateDiff = now.diff(comparison, 'hours');
			if (dateDiff >= 1 && dateDiff <= 23) {
				fromNow = dateDiff + ' hr ago';
			}

			// Day comparison
			dateDiff = now.diff(comparison, 'days');
			if (dateDiff === 1) {
				fromNow = 'Yesterday at ' + comparison.format('hh:mm A');
			}
			else if (dateDiff >= 2 && dateDiff <= 6) {
				fromNow = comparison.format('dddd') + ' at ' + comparison.format('hh:mm A');
			}
			else if (dateDiff >= 7) {
				if (now.year() === comparison.year()) {
					fromNow = comparison.format('DD MMMM') + ' at ' + comparison.format('hh:mm A');
				}
				else {
					fromNow = comparison.format('DD MMMM YYYY') + ' at ' + comparison.format('hh:mm A');
				}
			}
      //console.log('' + datetimeValue + ' -> ' + fromNow)
      return fromNow;
		}

    // Invalid value - just return it as we found it.
    return datetimeValue;
  }

  function displayCurrency(amt)   { return accounting.formatMoney(amt, "", 0); }
  function displayCurrency2(amt)  { return accounting.formatMoney(amt, "", 2); }
  function displayDollars(amt)    { return accounting.formatMoney(amt, "$ ", 0); }
  function displayDollars2(amt)   { return accounting.formatMoney(amt, "$ ", 2); }
  function displayPounds(amt)     { return accounting.formatMoney(amt, "£ ", 0); }
  function displayPounds2(amt)    { return accounting.formatMoney(amt, "£ ", 2); }



})();



function tooltwistViews_findFieldsForMode(metadata, mode) {
  if (metadata.modes) {

    var modeDef = metadata.modes[mode];
    if (typeof(metadata.modes[mode]) == 'undefined') {

      // unknown mode
      console.log('Mode ' + mode + ' not supported');
      //ZZZZ
      var fields = { };
    } else if (typeof(metadata.modes[mode]) == 'boolean') {
      if (modeDef) {

        // mode=true
        var fields = metadata.fields;
      } else {

        // mode=false
        console.log('Mode ' + mode + ' not supported');
        //ZZZZ
        var fields = { };
      }
    } else if (modeDef == 'all' || modeDef == '*') {

      // mode="all"
      var fields = metadata.fields;
    } else if (typeof(metadata.modes[mode]) == 'string') {

      // mode="field1,field2,..."
      var fields = { };
      modeDef.split(',').forEach(function(fieldName, i) {
        if (metadata.fields[fieldName]) {

          // Found the field.
          fields[fieldName] = metadata.fields[fieldName];
        } else {
          // Unknown field.
          console.log('Mode ' + mode + ' refers to unknown field: ' + fieldName);
        }
      });
    } else {
      // Cannot understand mode definition - display no fields
      console.log('Could not parse definition for mode ' + mode);
      //ZZZZ
      var fields = { };
    }

  } else {

    // No modes defined. Allow all fields to be used.
    var fields = metadata.fields;
  }


  console.log('fields for mode ' + mode, fields);

  return fields;
}// tooltwistViews_findFieldsForMode()


/*
 *  list - use Bootstrap table.
 *  See https://www.w3schools.com/bootstrap/bootstrap_tables.asp
 */
function tooltwistViews_htmlForAngular_list(metadata, fields, options) {
  //alert('tooltwistViews_htmlForAngular_list()')

  var extraTableClasses = options.listTableClasses ? options.listTableClasses : '';
  var ngClick = '';
  if (options.listClickFunction) {
    ngClick = 'ng-click="' + options.listClickFunction + '(record)"';
  }

  // Work out the model name for the record list
  var model = 'generic_list';
  if (options.listModel) {
    model = options.listModel;
  }

  // Update the DOM to show these fields
  var html = ''
  html += '<table class="table ' + extraTableClasses + '">';

  // Display the header row
  html += '  <tr>';
  for (property in fields) {
    //console.log('property is ' + property);
    var fieldDetails = fields[property];

    // Check for alignment within the table cell.
    var cellClass = '';
    cellClass += getTextAlignmentOption(fieldDetails, overrides);
    html += '    <th class="' + cellClass + '">' + fieldDetails.label + '</th>';
  }
  html += '  </tr>';

  /*
   *  Display the data records
   */
  html += '  <tr ng-repeat="record in ' + model + '" ' + ngClick + ' class="{{record._styleClass}}">';
  //html += '  <tr>';
  for (property in fields) {
    //console.log('property is ' + property);
    var fieldDetails = fields[property];
    var overrides = (options.overrides && options.overrides[property]) ? options.overrides[property] : { };
    //console.log('DETAILS====>', details);

    // if (details._renderFn) {
    //   html += (details.renderFn)
    // }

    // Check for alignment within the table cell.
    var cellClass = '';
    cellClass += getTextAlignmentOption(fieldDetails, overrides);

    html += '    <td class="' + cellClass + '">';
    html += angularCodeToDisplayField(fieldDetails, overrides);
    html += '    </td>';
  }
  html += '  </tr>';
  html += '</table>';
  html += '  <br/>';
  //html += '</p>';
    /*a.mouse-pointer(ng-click="supplierSelect(supplier.supplierId)")
      | {{record.product_id__desc}} - {{record.category_id__desc}}
    br*/
  return html;
}// tooltwistViews_htmlForAngular_list()


function angularCodeToDisplayField(fieldDetails, fieldOverrides) {

  // Maybe it references another table
  if (fieldOverrides.isReference || fieldDetails.isReference) {
    return '{{record.' + property + '__desc}} ';
  }

  // Maybe it's date related...
  var opt = getDateOrTimeOption(fieldDetails, fieldOverrides);
  if (opt == 'date') {
    return '{{displayDate(record.' + property + ')}} ';
  } else if (opt == 'time') {
    return '{{displayTime(record.' + property + ')}} ';
  } else if (opt == 'datetime') {
    return '{{displayDatetime(record.' + property + ')}} ';
  } else if (opt == 'fromNow') {
    return '{{displayFromNow(record.' + property + ')}} ';
  }

  // Maybe it's money related
  var opt = getMoneyOption(fieldDetails, fieldOverrides);
  if (opt == 'currency') {
    return '{{displayCurrency(record.' + property + ')}} ';

  } else if (opt == 'currency2') {
    return '{{displayCurrency2(record.' + property + ')}} ';

  } else if (opt == 'dollars') {
    return '{{displayDollars(record.' + property + ')}} ';

  } else if (opt == 'dollars2') {
    return '{{displayDollars2(record.' + property + ')}} ';

  } else if (opt == 'pounds') {
    return '{{displayPounds(record.' + property + ')}} ';

  } else if (opt == 'pounds2') {
    return '{{displayPounds2(record.' + property + ')}} ';

  }
  // Regular field
  return '{{record.' + property + '}} ';
}

/*
 *  Look for a specified option in the field properties or it's overrides.
 */
function getOption(fieldDetails, fieldOverrides, optionName) {
  // Check for an override
  if (fieldOverrides && typeof(fieldOverrides[optionName]) != 'undefined') {
    return fieldOverrides[optionName];
  }
  // Check the field properties
  if (typeof(fieldDetails[optionName]) != 'undefined') {
    return fieldDetails[optionName];
  }
  return null;
}

/*
 *  Look for a property that specified text alignment.
 */
function getTextAlignmentOption(fieldDetails, overrides) {
  var align = '';
  if (getOption(fieldDetails, overrides, 'textRight')) {
    return 'text-right';
  }
  else if (getOption(fieldDetails, overrides, 'textCenter')) {
    return 'text-center';
  }
  else if (getOption(fieldDetails, overrides, 'textLeft')) {
    return 'text-left';
  }
  else if (getOption(fieldDetails, overrides, 'textJustify')) {
    return 'text-justify';
  }
  return '';
}

/*
 *  Look for a property related to the display of date or time.
 */
function getDateOrTimeOption(fieldDetails, fieldOverrides) {
  if (fieldOverrides) {
    if (fieldOverrides.date) return 'date';
    if (fieldOverrides.time) return 'time';
    if (fieldOverrides.datetime) return 'datetime';
    if (fieldOverrides.fromNow) return 'fromNow';
  }
  if (fieldDetails.date) return 'date';
  if (fieldDetails.time) return 'time';
  if (fieldDetails.datetime) return 'datetime';
  if (fieldDetails.fromNow) return 'fromNow';
  return null;
}

/*
 *  Look for a formatting option related to money.
 */
function getMoneyOption(fieldDetails, fieldOverrides) {
  if (fieldOverrides) {
    if (fieldOverrides.currency) return 'currency';
    if (fieldOverrides.currency2) return 'currency2';
    if (fieldOverrides.dollars) return 'dollars';
    if (fieldOverrides.dollars2) return 'dollars2';
    if (fieldOverrides.pounds) return 'pounds';
    if (fieldOverrides.pounds2) return 'pounds2';
  }
  if (fieldDetails.currency) return 'currency';
  if (fieldDetails.currency2) return 'currency2';
  if (fieldDetails.dollars) return 'dollars';
  if (fieldDetails.dollars2) return 'dollars2';
  if (fieldDetails.pounds) return 'pounds';
  if (fieldDetails.pounds2) return 'pounds2';
  return null;
}



/*
 *  Display values using Bootstrap horizontalDescription.
 *
 *    Aaa   10
 *    Bbb   20
 *
 *  See http://getbootstrap.com/css/#horizontal-description
 */
function tooltwistViews_htmlForAngular_horizontalDescription(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  if (options.recordModel) {
    model = options.recordModel;
  }

  // Construct the HTML
  var html = ''
  html += '<dl class="dl-horizontal">'
  for (property in fields) {
    //console.log('property is ' + property);
    var field = fields[property];
    html += '  <dt> ' + field.label + '</dt>';
    //html += '  <dd ng-model="'+model+'.'+field.name+'"/>';
    html += '  <dd>{{'+model+'.'+field.name+'}}</dd>';
  }
  html += '</dl>'
  return html;
}// tooltwistViews_htmlForAngular_horizontalDescription()


/*
 *  Display values using Bootstrap description.
 *
 *    Aaa
 *    10
 *    Bbb
 *    20
 *
 *  See http://getbootstrap.com/css/#description
 */
function tooltwistViews_htmlForAngular_description(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  if (options.recordModel) {
    model = options.recordModel;
  }

  // Construct the HTML
  var html = ''
  html += '<dl>'
  for (property in fields) {
    //console.log('property is ' + property);
    var field = fields[property];
    html += '  <dt> ' + field.label + '</dt>';
    //html += '  <dd ng-model="'+model+'.'+field.name+'"/>';
    html += '  <dd>{{'+model+'.'+field.name+'}}</dd>';
  }
  html += '</dl>'
  return html;
}// tooltwistViews_htmlForAngular_description()


/*
 *  edit - use Bootstrap labels and inputs.
 */
function tooltwistViews_htmlForAngular_edit(metadata, fields, options) {

  // Work out the model name for the record list
  var model = 'generic_record';
  var scopeVariable = '';
  if (options.recordModel) {
    model = options.recordModel;
  }
  if (options.recordScope) {
    scopeVariable = options.recordScope + '.';
  }


  // Construct the HTML
  var html = ''
  for (property in fields) {
    //console.log('property is ' + property);
    var fieldDetails = fields[property];
    // var readonly = '';
    // if (field.isPrimaryKey || field.readonly) {
    //   readonly = ' readonly="readonly"';
    // }
    // html += '<label for="generic-' + field.name + '"> ' + field.label + '</label>';
    // html += '<input id="generic-' + field.name + '" class="form-control" ng-model="'+scopeVariable+model+'.'+field.name+'" placeholder=""' + readonly + '/>';
    var overrides = (options.overrides && options.overrides[property]) ? options.overrides[property] : { };
    html += '<label for="generic-' + fieldDetails.name + '"> ' + fieldDetails.label + '</label>';
    html += angularCodeToEditField(fieldDetails, overrides, model);
    html += '</br>';
  }
  return html;
}// tooltwistViews_htmlForAngular_edit()



function angularCodeToEditField(fieldDetails, fieldOverrides, model) {

  var readonly = '';
  if (fieldDetails.isPrimaryKey || fieldDetails.readonly) {
    readonly = ' readonly="readonly"';
  }




  // Maybe it references another table
  if (fieldOverrides.isReference || fieldDetails.isReference) {
    //return '{{record.' + property + '__desc}} ';
    return '<input id="generic-' + fieldDetails.name + '" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';
  }

  // Maybe it's date related...
  var opt = getDateOrTimeOption(fieldDetails, fieldOverrides);
  if (opt == 'date') {
    //return '{{displayDate(record.' + property + ')}} ';
    return '<input id="generic-' + fieldDetails.name + '" type="date" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';

  } else if (opt == 'time') {
    //return '{{displayTime(record.' + property + ')}} ';
    return '{{displayTime(record.' + property + ')}} <input id="generic-' + fieldDetails.name + '" type="time" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';

  } else if (opt == 'datetime') {
    //return '{{displayDatetime(record.' + property + ')}} ';
    return '<input id="generic-' + fieldDetails.name + '" type="datetime-local" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';

  } else if (opt == 'fromNow') {
    //return '{{displayFromNow(record.' + property + ')}} ';
    return '<input id="generic-' + fieldDetails.name + '" type="datetime-local" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';

  }

  // Maybe it's money related
  /*
  var opt = getMoneyOption(fieldDetails, fieldOverrides);
  if (opt == 'currency') {
    return '{{displayCurrency(record.' + property + ')}} ';

  } else if (opt == 'currency2') {
    return '{{displayCurrency2(record.' + property + ')}} ';

  } else if (opt == 'dollars') {
    return '{{displayDollars(record.' + property + ')}} ';

  } else if (opt == 'dollars2') {
    return '{{displayDollars2(record.' + property + ')}} ';

  } else if (opt == 'pounds') {
    return '{{displayPounds(record.' + property + ')}} ';

  } else if (opt == 'pounds2') {
    return '{{displayPounds2(record.' + property + ')}} ';

  }
  */

  // Regular field
  //return '{{record.' + property + '}} ';
  return '<input id="generic-' + fieldDetails.name + '" class="form-control" ng-model="'+model+'.'+fieldDetails.name+'" placeholder=""' + readonly + '/>';
}



/*
 *  Load the list of records that match a filter.
 */
function tooltwistViews_select(context, viewName, params, callback/*(err,data,metadata)*/) {
  console.log('------------');
  console.log('tooltwistViews_select(' + viewName + ')', params);
  console.log('context=', context);
  // if (!context.host) {
  //   var a = null;
  //   a.b = 2;
  // }


  var $scope = context.$scope;

  $scope.displayDate = TooltwistViews.displayDate;
  $scope.displayTime = TooltwistViews.displayTime;
  $scope.displayDatetime = TooltwistViews.displayDatetime;
  $scope.displayFromNow = TooltwistViews.displayFromNow;
  $scope.displayCurrency = TooltwistViews.displayCurrency;
  $scope.displayCurrency2 = TooltwistViews.displayCurrency2;
  $scope.displayDollars = TooltwistViews.displayDollars;
  $scope.displayDollars2 = TooltwistViews.displayDollars2;
  $scope.displayPounds = TooltwistViews.displayPounds;
  $scope.displayPounds2 = TooltwistViews.displayPounds2;

  // Check the config
  var protocol = 'http:';
  var baseUrl = '//' + context.host + ':' + context.port;
  // var host = context.TEASERVICE_HOST;
  // var port = context.TEASERVICE_PORT;
  // var baseUrl = '//' + host + ':' + port;


  // Load all the records
  var url = baseUrl + '/admin/' + viewName + '/select';
  console.log('url is ' + url)

  // Call the API to get the supplier details
  // ZZZZ This should use JSONP, as some browsers do not support CORS.
  // ZZZZ Unfortunately JSONP does not support headers, so we need
  // ZZZZ to pass details either in the url or the data. i.e. the
  // ZZZZ server requires changes.
  var req = {
    method: 'POST',
    url: url,
    // headers: {
    //   "access-token": "0613952f81da9b3d0c9e4e5fab123437",
    //   "version": "2.0.0"
    // },
    data: params
  };

  if (context.headers) {
    req.headers = context.headers;
  }
  console.log('url=' + url);

  context.$http(req).then(function(response) {
    console.log('success:', response)

    var data = response.data.data;
    var metadata = response.data.metadata;

    // Convert and date/time related fields to Date objects
    //console.log('\n\n\n////////////////////////// Checking for date fields\n\n\n');
    for (property in metadata.fields) {
      var field = metadata.fields[property];
      if (field.date || field.time || field.datetime || field.fromNow) {
        //params[field.name] = record[field.name];
        //console.log('/////// Date field=>', field);
        data.forEach(function(record) {
          var dateStr = record[property];
          var date = new Date(dateStr);
          record['_' + property] = dateStr;
          record[property] = date;
          //console.log('    ' + dateStr + ' -> ' + date);
        });
      }
    }

    // Return what we found
    return callback(null, data, metadata);

  }, function(response) {
    alert('An error occurred calling the server.\nSee the Javascript console for details.')
    console.log('Error calling server.');
    console.log('url: ' + url);
    console.log('params: ', params);
    console.log('failure:', response)
    if (response.data && response.data.message) {
      console.log('failure:', response.data.message);
    }
  });

}// tooltwistViews_select


function tooltwistViews_save(context, metadata, mode, record, callback/*(err, reply)*/) {
  console.log('tooltwistViews_save(view=' + metadata.name + ', mode=' + mode + ')', record);

  //return callback(null, { hello: 'there '});
  var viewName = metadata.name;

  // Check the config
  var protocol = 'http' + ':';
  //var protocol = '';
  var baseUrl = protocol + '//' + context.host + ':' + context.port;
  // var host = TEASERVICE_HOST;
  // var port = TEASERVICE_PORT;
  // var baseUrl = protocol + '://' + host + ':' + port;

  // Send values to the update, based upon the mode
  var fieldsForMode = TooltwistViews.fieldsForMode(metadata, mode);

  if (Object.keys(fieldsForMode).length == 0) {
    // Unknown mode
    if (mode == 'record') {
      console.log('Use all fields for this view');
      fieldsForMode = metadata.fields;
    }
  }


console.log('fieldsForMode=', fieldsForMode);
  var params = { };
  var havePrimaryKey = false;
  for (property in fieldsForMode) {
    //console.log('property is ' + property);
    var field = fieldsForMode[property];
    if (typeof(record[field.name]) != 'undefined') {
      params[field.name] = record[field.name];
    }

    // Was this the primary key?
    if (field.isPrimaryKey) {
      havePrimaryKey = true;
    }
  }

  // If this mode doesn't include the primary key, let's
  // get it from the view itself.
  if (!havePrimaryKey) {
    // console.log('\n\n\n\n****** Need to get the primary key ZZZZZ.', metadata);
    // console.log('metadata.fields=', metadata.fields);
    for (property in metadata.fields) {
      var field = metadata.fields[property];

      // Was this the primary key?
      if (field.isPrimaryKey) {
        havePrimaryKey = true;
        if (typeof(record[field.name]) != 'undefined') {
          params[field.name] = record[field.name];
        }
        break;
      }
    }
  }
  if (!havePrimaryKey) {
    alert('Error: No primary key for view ' + viewName +'. Cannot update.');
    return;
  }

  console.log('PARAMS IS ', params);


  // Load all the categories
  var url = baseUrl + '/admin/' + viewName + '/save';
  console.log('url is ' + url)

  //console.log('params=', params);
  var req = {
    method: 'POST',
    url: url,
    // headers: {
    //   "access-token": "0613952f81da9b3d0c9e4e5fab123437",
    //   "version": "2.0.0"
    // },
    data: params
  };
  if (context.headers) {
    req.headers = context.headers;
  }

  context.$http(req).then(function(response) {
    console.log('success:', response)

    return callback(null, response);

  }, function(response) {
    alert('An error occurred calling the TEA API.\nSee the Javascript console for details.')
    console.log('failure:', response)
    console.log('failure:', response.data);
  });
  return false;
}// tooltwistViews_save
