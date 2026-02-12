---
title: "secure-file-validator"
description: "A secure file validation library for Node.js that performs signature checking and content validation to harden apps from malicious file uploads."
date: "2025-10-01"
lastUpdated: "2025-10-15"
featured: true
npmURL: "https://www.npmjs.com/package/secure-file-validator"
repoURL: "https://github.com/Naandalist/secure-file-validator"
version: "1.1.0"
license: "MIT"
keywords:
  [
    "file-validation",
    "security",
    "file-type",
    "mime-type",
    "signature-check",
    "file-security",
    "esm",
    "typescript",
  ]
lang: "en"
---

# secure-file-validator

A secure file validation library for Node.js that performs signature checking and content validation. It hardens apps from malicious file uploads by validating file types, checking file signatures, and scanning for suspicious patterns.

This library is built following industry-standard security guidelines:

- [OWASP Unrestricted File Upload Prevention](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [CWE-434: Unrestricted Upload of File with Dangerous Type](https://cwe.mitre.org/data/definitions/434.html)
- [NIST Security Guidelines for File Uploads](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)

## Features

- Secure file signature validation
- Content pattern scanning for malicious code
- Support for multiple file types (JPEG, PNG, GIF, PDF, SVG)
- Built-in security checks for PDF and SVG files
- Whitelist feature to handle false positive detections
- Zero dependencies
- Customizable file size validation

## Installation

```bash
npm install secure-file-validator
```

## Usage

### Basic Usage (Default 5MB limit)

```typescript
import { validateFile } from "secure-file-validator";

try {
  const result = await validateFile("path/to/your/file.pdf");

  if (result.status) {
    console.log("File is valid:", result.message);
  } else {
    console.log("File validation failed:", result.message);
  }
} catch (error) {
  console.error("Error:", error);
}
```

### Custom File Size Limit

```typescript
import { validateFile } from "secure-file-validator";

// Example: Set 10MB limit
const TEN_MB = 10 * 1024 * 1024;

try {
  const result = await validateFile("path/to/your/file.pdf", {
    maxSizeInBytes: TEN_MB,
  });

  if (result.status) {
    console.log("File is valid:", result.message);
  } else {
    console.log("File validation failed:", result.message);
  }
} catch (error) {
  console.error("Error:", error);
}
```

### PDF Whitelist for False Positive Handling

The library includes security checks for potentially dangerous PDF patterns. However, some legitimate PDFs may contain patterns like `/Metadata/`, `/OpenAction/`, or `/JS/` that are flagged as suspicious. You can use the `pdfWhitelist` option to allow specific patterns:

```typescript
import { validateFile } from "secure-file-validator";

const result = await validateFile("path/to/file.pdf", {
  pdfWhitelist: ["Metadata", "OpenAction", "JS"],
});

if (result.status) {
  console.log("File is valid:", result.message);
} else {
  console.log("File validation failed:", result.message);
}
```

Available PDF patterns to whitelist:

- `Metadata` - PDF metadata (commonly found in legitimate PDFs)
- `OpenAction` - Automatic actions when PDF is opened
- `JS` - JavaScript abbreviation
- `JavaScript` - JavaScript code
- `Launch` - Launch actions
- `EmbeddedFile` - Embedded files
- `XFA` - XML Forms Architecture
- `Annots` - Annotations

> **Note:** Only whitelist patterns you trust. Whitelisting patterns reduces security checks and should be done carefully based on your specific use case.

## Supported File Types

| Category        | File Type |
| --------------- | --------- |
| Images          | JPEG/JPG  |
| Images          | PNG       |
| Images          | GIF       |
| Documents       | PDF       |
| Vector Graphics | SVG       |

## API Reference

### `validateFile(filePath, options)`

Main validation function that performs all checks.

| Parameter              | Type     | Description                        | Default  |
| ---------------------- | -------- | ---------------------------------- | -------- |
| filePath               | string   | Path to the file to validate       | required |
| options                | Object   | Configuration options              | {}       |
| options.maxSizeInBytes | number   | Maximum file size in bytes         | 5MB      |
| options.pdfWhitelist   | string[] | Array of PDF patterns to whitelist | []       |

**Returns:** `Promise<{ status: boolean, message: string }>`

### `validateFileContent(filePath, options)`

Performs content-specific validation.

| Parameter            | Type     | Description                        | Default  |
| -------------------- | -------- | ---------------------------------- | -------- |
| filePath             | string   | Path to the file to validate       | required |
| options              | Object   | Configuration options              | {}       |
| options.pdfWhitelist | string[] | Array of PDF patterns to whitelist | []       |

**Returns:** `Promise<{ status: boolean, message: string }>`

### `checkFileSignature(buffer, signatures)`

Checks file buffer against known signatures.

| Parameter  | Type                 | Description                       |
| ---------- | -------------------- | --------------------------------- |
| buffer     | Buffer               | File buffer to check              |
| signatures | Array<Array<number>> | Valid signatures to check against |

**Returns:** `boolean`

## Example Results

```typescript
// Successful validation
{
  status: true,
  message: "Content validation passed"
}

// Failed validation (file size)
{
  status: false,
  message: "File size exceeds limit of 5MB"
}

// Failed validation (invalid file type)
{
  status: false,
  message: "Invalid file extension"
}

// Failed validation (malicious content)
{
  status: false,
  message: "Suspicious pattern detected: /<script/i"
}
```

## Limitations

- Only supports specified file types
- No stream processing support
- Binary file content is not deeply analyzed
- Pattern matching is done on string representation of files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

For more details, please visit the [GitHub repository](https://github.com/Naandalist/secure-file-validator).
