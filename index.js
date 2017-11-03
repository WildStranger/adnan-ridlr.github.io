
var content, columns, compiledCardTemplate = undefined;
var MIN_COL_WIDTH = 300;

//data used to render the HTML templates
var bookmarks = [
    /*{   title:"This is a card!", 
        description:"In essence, a card is just a rectangular region which contains content. This content is just HTML.  This could be <b>text</b>, <i>images</i>, <u>lists</u>, etc... The card UI methaphor dictates the interaction and layout of these regions.", "tags":"Adnan, Haris" },
    {   description:"Yep, just some simple content ecapsulated in this card.",
        image:"assets/images/avatars/1.jpg"},
    {   iconuri:"assets/images/avatars/1.jpg",
        banner:true, 
        caption:"Image, Banner &amp; HTML",
        description:"All standard HTML structures, styled with CSS."},
    {   title:"This is another card!", 
        image:"image4",
        description:"Here, you can see a more complex card.  IT is all just layout of HTML structures.",
        caption:"Look, it's Vegas!",  },
    {   description:"Yep, just some simple content ecapsulated in this card.",
        image:"image5",
        banner:true, },
    {   image:"image6",
        caption:"It's a college!",
        description:"With HTML in the content.<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>"},
    {   image:"image1",
        caption:"San Francisco City Hall",
        description:"All of these photos were captured with a quadcopter and GoPro! Check out my blog <a href='http://tricedesigns.com'>http://tricedesigns.com</a> to learn more!"},*/
];
  
//page load initialization
Zepto(function($){
    registerEvents();
    getBookmarksAndRender();
})

function registerEvents() {
   $("#refreshBookmarksButton").click(function(event){
        getBookmarksAndRender();
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