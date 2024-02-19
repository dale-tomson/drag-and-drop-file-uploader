# File Uploader
A JavaScript standalone plugin for user-friendly file uploads with drag-and-drop and file preview.

### Features
- Drag-and-drop functionality for intuitive file selection
- File preview before upload for visual confirmation
- Multiple file selection (optional)
- File type validation to ensure allowed file types
- File size validation to control individual and total file sizes
- Duplicate file detection
- Error handling and display
- Customizable options for flexibility
- Event handling for integration with other parts of your application

### Installation
- Include the JavaScript file:
```html
<script src="file-uploader.js"></script>
```
- include the Styles (Css) file:
```html
<link rel="stylesheet" href="file-uploader.css">
```

### Usage

```html
<link rel="stylesheet" href="file-uploader.css">
<div id="fileUploader" class="file-uploader"></div><!-- Add .file-uploader for styles -->
<script src="file-uploader.js"></script>

<script>
    const fileUploaderArea = document.getElementById('fileUploader');
    const FUArea = new FileUploader(fileUploaderArea, {
      multifiles: true,
      maxFiles: 20,
      allowedTypes: ['image', 'pdf'],
      excludedTypes: ['exe', 'sh'],
      maxSize: "10 mb",
      errorTimeout: 5000,
    });
</script>
```

### Options
- `multifiles`: Boolean (default: `false`). Whether to allow multiple file selection.
- `maxFiles`: Number (default: `20` if multifiles is true, otherwise `1`). The maximum - number of files allowed.
- `allowedTypes`: Array of strings (default: `[]`). An array of allowed file types (e. g., `["image", "pdf"]`).
- `excludedTypes`: Array of strings (default: `[]`). An array of excluded file types.
- `maxSize`: Number (default: `null`). The maximum allowed file size for each individual file.Should be mentioned as `1 kb` or `1 mb` format.
- `maxTotalSize`: Number (default: `null`). The maximum allowed total size for all files. Should be mentioned as `1 kb` or `1 mb` format.
- `errorTimeout`: Number (default: `3000`). The duration in milliseconds for which error messages are displayed.
- `fileName`: String (default: randomly generated). The name attribute of the form element used for file uploads.
- `fileId`: String (default: randomly generated). The ID of the form element used for file uploads.


### Handling uploaded files:

- The plugin will trigger a custom event named `FU-fileRemoved` when a file is removed. You can listen for this event to handle file removals.
- To access the uploaded files, use the `FUArea.uploadedFiles` property, which is a Set containing the filenames of the uploaded files.

## NOTE
- The plugin uses a hidden file input element for file uploads.
- The plugin does not handle the actual file submission to a server. You'll need to handle that separately using the `FUArea.uploadedFiles` property or normal multipart form submit.