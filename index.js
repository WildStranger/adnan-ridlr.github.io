var content, columns, compiledCardTemplate = undefined;
var MIN_COL_WIDTH = 300;

var bookmarks = [];
var spreadsheetId = '';

// Page load initialization
Zepto(function($){
    registerEvents();
})

function registerEvents() {
    $("#refreshBookmarksButton").click(function(event){
        getBookmarksAndRender();
    });
    $("#signoutButton").click(function(event){
        signOut();
    });
    $("#addBookmarkButton").click(function(event) {
        onAddBookmarkClick();
    });
}

// Google client load initialilzation
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        lookupBookmarksDriveFile(null);
    } else {
        console.error('User not logged in');
        signOut();
    }
}

function signOut(event) {
    gapi.auth2.getAuthInstance().signOut();
    window.location.replace('login.html');
}


function lookupBookmarksDriveFile(nextPageToken) {
    gapi.client.drive.files.list({
        'q': "name = '" + DRIVE_FILE_NAME + "' and mimeType = 'application/vnd.google-apps.spreadsheet'",
        'pageToken': nextPageToken,
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name)"
    }).then(function(response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                spreadsheetId = file.id;
                console.log('Sheet Id: ' + spreadsheetId);
                readBookmarksFromFile();
                break;
            }
        }

        var nextPageToken = response.result.nextPageToken;
        if (spreadsheetId == '') {
            if (nextPageToken != null) {
                listFiles(nextPageToken)
            } else {
                console.log('No files found. Creating new one');
                createNewSheet();
            }
        } 
    });
}

function readBookmarksFromFile() {
    gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: RANGE,
    }).then(function(response) {
        var result = response.result;

        if (!result.values) {
            console.log('No data found');
            return;
        }

        console.log(result.values.length + ' rows retrieved');
        if (result.values.length > 0) {
            for (i = 0; i < result.values.length; i++) {
                var row = result.values[i];
                var obj = JSON.parse(row[0]);
                bookmarks.push(obj);
            }
        } else {
            console.log('No data found.');
        }
        createView();
    }, function(response) {
        console.log('Error: ' + response.result.error.message);
    });
}

/**
* Create new sheet
*/
function createNewSheet() {
    var spreadsheetBody = {
        "properties": {
            "title": DRIVE_FILE_NAME
        },
        "sheets": [
        {
            "properties": {
                "title": "bookmarks"
            }
        }]
    };

    var request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
    request.then(function(response) {
        console.log(response.result);
        spreadsheetId = response.result.spreadsheetId;
        console.log('Sheet Id ' + spreadsheetId + ' created');
    }, function(reason) {
        console.error('error: ' + reason.result.error.message);
    });
}

function onAddBookmarkClick() {
    var modal = bootbox.dialog({
        message: $(".form-content").html(),
        title: "Add new bookmark",
        buttons: [
        {
            label: "Save",
            className: "btn btn-primary pull-left",
            callback: function() {
                var bookmark = new Object();
                bookmark.title = $('form #title', '.bootbox').val();
                bookmark.description = $('form #description', '.bootbox').val();
                bookmark.tags = $('form #tags', '.bootbox').val();
                bookmark.uri = $('form #uri', '.bootbox').val();
                bookmark.dateAdded = Date.now();
                bookmark.lastModified = Date.now();

                console.log(bookmark);
                return true;
            }
        },
        {
            label: "Close",
            className: "btn btn-default pull-left",
            callback: function() {
              console.log("just do something on close");
          }
      }
      ],
      show: false,
      onEscape: function() {
          modal.modal("hide");
      }
  });

    modal.modal("show");
}

function createView() {
    if (bookmarks.length <= 0) {
        return;
    }

    content = $(".content");
    compiledCardTemplate = Mustache.compile( $("#card-template").html() );
    layoutColumns();
    $(window).resize(onResize);
}

//resize event handler
function onResize() {
    var targetColumns = Math.floor( $(document).width()/MIN_COL_WIDTH );
    if ( columns != targetColumns ) {
        layoutColumns();   
    }
}

//function to layout the columns
function layoutColumns() {
    content.detach();
    content.empty();
    
    columns = Math.floor( $(document).width()/MIN_COL_WIDTH );
    
    var columns_dom = [];
    for ( var x = 0; x < columns; x++ ) {
        var col = $('<div class="column">');
        col.css( "width", Math.floor(100/columns)+"%" );
        columns_dom.push( col );   
        content.append(col);
    }
    
    for ( var x = 0; x < bookmarks.length; x++ ) {
        var html = compiledCardTemplate( bookmarks[x] );
        
        var targetColumn = x % columns_dom.length;
        columns_dom[targetColumn].append( $(html) );    
    }
    $("body").prepend (content);
}