/**
 * =========================================================================
 * Tasty Nest - Google Apps Script for Google Drive Media Uploads
 * =========================================================================
 * 
 * HOW TO SET THIS UP (2 MINUTES):
 * 1. Go to https://script.google.com/
 * 2. Click "+ New project".
 * 3. Delete everything in the editor and paste ALL code from this file into Code.gs.
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Click the gear icon next to "Select type" -> Choose "Web app".
 * 6. Set Description: "Tasty Nest Media Uploader".
 * 7. Set "Execute as": "Me" (your email).
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL!
 * 9. Click "Deploy", approve Google permissions when prompted.
 * 10. Copy the "Web app URL" (ends in /exec).
 * 11. Open Tasty Nest website -> Admin Control Center -> "Cloud & Drive Settings"
 *     and paste the Web app URL there!
 * =========================================================================
 */

// Name of the folder in your Google Drive where uploaded files will be stored
var TARGET_FOLDER_NAME = "TastyNest_Uploads";

/**
 * Handles HTTP POST requests sent from Tasty Nest website
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "No post data received" });
    }

    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({ success: false, error: "Invalid JSON payload: " + parseErr.message });
    }

    var base64Content = requestData.base64;
    var fileName = requestData.filename || ("tastynest-" + new Date().getTime() + ".jpg");
    var mimeType = requestData.mimeType || "image/jpeg";

    if (!base64Content) {
      return createJsonResponse({ success: false, error: "Missing base64 media content" });
    }

    // Strip out Data URL header if present (e.g., "data:image/jpeg;base64,")
    var rawBase64 = base64Content;
    if (base64Content.indexOf(",") > -1) {
      rawBase64 = base64Content.split(",")[1];
    }

    // Decode base64 to byte array
    var decodedBytes = Utilities.base64Decode(rawBase64);
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // Get or create dedicated folder in Google Drive
    var folder = getOrCreateFolder(TARGET_FOLDER_NAME);

    // Create file inside Google Drive folder
    var file = folder.createFile(blob);

    // Set file permission to public so anyone can view image on your website
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();

    // High-performance direct CDN URLs for Google Drive files:
    // lh3.googleusercontent.com works directly in <img> tags without rate limit blocks
    var directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var viewUrl = file.getUrl();

    return createJsonResponse({
      success: true,
      fileId: fileId,
      fileName: fileName,
      url: directImageUrl,
      previewUrl: previewUrl,
      viewUrl: viewUrl
    });

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "Google Apps Script Server Error: " + err.toString()
    });
  }
}

/**
 * Handles HTTP GET requests (used to test if script URL is working)
 */
function doGet(e) {
  return createJsonResponse({
    success: true,
    message: "Tasty Nest Google Drive Media Uploader is running and ready!",
    folder: TARGET_FOLDER_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Finds or creates a specific folder in Google Drive
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Returns JSON response with appropriate headers
 */
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
