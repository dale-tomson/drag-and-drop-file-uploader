class FileUploader {
    constructor(targetElement, options) {
        this.targetElement = targetElement;
        this.dropArea = null;
        this.filePreview = null;
        this.fileCount = 0; // Initialize file count
        this.totalSize = 0; // Initialize total size counter
        this.uploadedFiles = new Set(); // Set to store uploaded file names or identifiers

        // Init the customizable plugin options
        this.initOptions(options);

        // Setup the uploader
        this.setup();

        // Check maxFiles option
        if (typeof this.maxFiles !== "number" || this.maxFiles <= 0) {
            this.showError("maxFiles option should be a positive number.");
            return;
        }

        // Check allowedTypes and excludedTypes options
        if (!Array.isArray(this.allowedTypes) || !Array.isArray(this.excludedTypes)) {
            this.showError("allowedTypes and excludedTypes options should be arrays.");
            return;
        }
    }

    /**
     * Initialize plugin options/config
     * @param {Object} options 
     * @returns {void}
     */
    initOptions(options) {
        this.allowMultipleFiles = options.multifiles || false; // Default false
        this.maxFiles = options.maxFiles || (this.allowMultipleFiles ? 20 : 1); // Default 20 if multifiles, else default 1
        this.allowedTypes = options.allowedTypes || []; // Default empty array, allow all types
        this.excludedTypes = options.excludedTypes || []; // Default empty array, allow all types except excluded ones
        this.maxSize = this.parseSize(options.maxSize) || null; // Default null, no maximum size limit for individual files
        this.maxTotalSize = this.parseSize(options.maxTotalSize) || null; // Default null, no maximum total size limit for all files
        this.errorTimeout = options.errorTimeout || 3000; // Error message timeout in millisec. Default 3000
        this.fileName = options.name || 'file-' + Math.random().toString(36).slice(2, 9); //Set file form element name. default `file-{randstring}`
        this.fileId = options.fileId || 'file-input-' + Math.random().toString(36).slice(2, 9);//Set file form element id. default `file-id-{randstring}`

    }

    /**
     * Create the fileupload layout and setup listeners
     * @returns {void}
     */
    setup() {
        this.targetElement.innerHTML = `
        <div class="drop-area">
            <p>Drag & Drop files here or click to select</p>
            <div class="file-preview"></div>
            <input type="file" id="${this.fileId}" name="${this.fileName}" style="display: none;" ${this.allowMultipleFiles ? 'multiple' : ''}>
        </div>
        `;
        this.dropArea = this.targetElement.querySelector('.drop-area');
        this.filePreview = this.targetElement.querySelector('.file-preview');
        this.createErrorElement();
        this.setupListeners();
    }

    /**
     * Setup event listeners for drag and drop actions and final upload
     * @returns {void}
     */
    setupListeners() {
        this.dropArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            this.dropArea.classList.add('highlight');
        });

        this.dropArea.addEventListener('dragleave', () => {
            this.dropArea.classList.remove('highlight');
        });

        this.dropArea.addEventListener('drop', (event) => {
            event.preventDefault();
            this.dropArea.classList.remove('highlight');

            const files = event.dataTransfer.files;
            this.handleFiles(files);
        });

        this.dropArea.addEventListener('click', () => {
            this.dropArea.querySelector(`#${this.fileId}`).click();
        });
        this.dropArea.querySelector(`#${this.fileId}`).addEventListener('change', (event) => {
            const files = event.target.files;
            this.handleFiles(files);
        });
    }

    /**
     * Handle file on select. Validate based on options given and make files upload ready
     * @param {Object} files 
     * @returns {void}
     */
    handleFiles(files) {
        // Process each file
        for (const file of files) {
            // Check if the file is a duplicate and allowed
            if (this.uploadedFiles.has(file.name)) {
                this.showError(`Duplicate file: ${file.name}`);
                continue; // Skip processing this file
            }

            // Check if the file types are allowed
            const fileTypeIcon = this.getFileTypeIcon(file.type);
            if (this.allowedTypes.length > 0 && !this.allowedTypes.includes(fileTypeIcon)) {
                this.showError(`File type not allowed: ${file.type}`);
                continue; // Skip processing this file
            }
            if (this.excludedTypes.includes(fileTypeIcon)) {
                this.showError(`File type excluded: ${file.type}`);
                continue; // Skip processing this file
            }

            // Check individual file size
            if (this.maxSize && file.size > this.maxSize) {
                this.showError(`File size exceeds maximum limit(${this.parseSize(this.maxSize, true)}): ${this.parseSize(file.size, true)} || ${file.name}`);
                continue; // Skip processing this file
            }

            // Check total files size
            if (this.maxTotalSize && this.totalSize + file.size > this.maxTotalSize) {
                this.showError(`Total files size exceeds maximum limit`);
                continue; // Skip processing this file
            }

            // Proceed with handling the file
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileItem = document.createElement('div');
                fileItem.classList.add('file-item');

                // Create remove button
                const removeButton = this.removeFiles(fileItem, file.name);

                if (this.getFileTypeIcon(file.type) === 'image') {
                    fileItem.innerHTML = `<img src="${event.target.result}" alt="file icon">`;
                } else {
                    fileItem.innerHTML = `<i class="material-icons">description</i>`;
                }
                fileItem.appendChild(removeButton); // Append remove button
                this.filePreview.appendChild(fileItem);
                this.fileCount++; // Increment file count
                this.uploadedFiles.add(file.name); // Add filename to uploaded files set
                this.totalSize += file.size; // Update total size counter
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Create remove button element and remove event actions
     * @param {HTMLDivElement} fileItem 
     * @param {String} filename 
     * @returns {HTMLButtonElement}
     */
    removeFiles(fileItem, filename) {
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.innerHTML = '&times;'; // Close symbol
        removeButton.onclick = (event) => {
            event.stopPropagation();
            // Pass the file item data along with the event
            const eventData = {
                fileItem: fileItem.cloneNode(true), // Clone the file item to preserve its data
                filename: filename
            };
            // Trigger a custom event with the file item data
            const removeEvent = new CustomEvent('FU-fileRemoved', { detail: eventData });
            this.filePreview.removeChild(fileItem); // Remove from UI
            this.uploadedFiles.delete(filename); // Remove from uploaded files set
            this.fileCount--; // Decrement file count
            // Dispatch the custom event
            this.targetElement.dispatchEvent(removeEvent);
        };
        return removeButton;
    }

    /**
     * Return file base type.
     * Eg: image/png is image. application/pdf is pdf
     * @param {String} fileType 
     * @returns {String}
     */
    getFileTypeIcon(fileType) {
        if (fileType.startsWith('image/')) {
            return 'image';
        } else {
            return fileType.split('/')[1]; // Get file extension
        }
    }

    /**
     * Displays plugin errors to UI inside the drop area
     * @param {String} message 
     */
    showError(message) {
        this.errorMessage.innerHTML = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, this.errorTimeout); // Error message display duration in milliseconds
    }

    /**
     * Creates an error message element
     * @returns {void}
     */
    createErrorElement() {
        // Create error message element
        this.errorMessage = document.createElement('div');
        this.errorMessage.classList.add('error-message');
        this.targetElement.appendChild(this.errorMessage);
        this.errorMessage.style.display = 'none';
    }

    /**
     * Parses the size value in KB or MB to bytes
     * @param {string} sizeValue - Size value in KB or MB
     * @param {Boolean} reverse - to reverse calculate to kb
     * @returns {number|null|string} - Size in bytes or null if invalid or string if reverse
     */
    parseSize(sizeValue, reverse = false) {
        if (!sizeValue) return null;

        if (reverse) {
            return Math.ceil(sizeValue / 1024) + " KB";
        }

        const regex = /^(\d+(\.\d+)?)\s*(KB|MB)$/i;
        const match = sizeValue.match(regex);

        if (!match) return null;

        const size = parseFloat(match[1]);
        const unit = match[3].toUpperCase();

        if (unit === "KB") {
            return size * 1024;
        } else if (unit === "MB") {
            return size * 1024 * 1024;
        }

        return null;
    }
}
