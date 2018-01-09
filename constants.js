// Client ID and API key from the Developer Console
var CLIENT_ID = '337483390580-k3rrcdu187uf865frla1hbh4qmlcv82a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBXlwp8V0vPoe4sEfqktc5uL71qhiOY21A';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API
var SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly";

// File that holds all bookmarks data on google drive
var DRIVE_FILE_NAME = "ToolSheet";

// Sheet name and its range to read
var RANGE = 'bookmarks!A1:A';