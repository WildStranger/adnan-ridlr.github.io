
var content, columns, compiledCardTemplate = undefined;
var MIN_COL_WIDTH = 300;

//data used to render the HTML templates
var bookmarks = [];

//page load initialization
Zepto(function($){
    registerEvents();
    getBookmarksAndRender();
})

function registerEvents() {
    $("#refreshBookmarksButton").click(function(event){
        getBookmarksAndRender();
});

    $("#addBookmarkButton").click(function(event) {
        onAddBookmarkClick();
});
}

function getBookmarksAndRender() {
    bookmarks = [];

    var url = "https://sheets.googleapis.com/v4/spreadsheets/1IDneVlOZY-mZDSsy99kpwznHRUfczd6FSS7hWlFSYpg/values/Sheet1!A1:A?key=%20AIzaSyDHIhWRB0oJr4DZYT0wtyqIobllW9gRSrA";
    $.getJSON(url, function(data) {
        $.each(data, function(key, val) {
            if (key == 'values') {
                $.each(val, function(key, val) {
                    var obj = JSON.parse(val);
                    bookmarks.push(obj);
                });
            }
        });
            // console.log(bookmarks);
            createView();
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