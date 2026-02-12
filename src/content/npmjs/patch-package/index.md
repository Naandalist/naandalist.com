---
title: "@naandalist/patch-package"
description: "A security-enhanced fork of patch-package that fixes vulnerabilities while maintaining full compatibility."
date: "2025-10-01"
lastUpdated: "2025-10-15"
featured: true
npmURL: "https://www.npmjs.com/package/@naandalist/patch-package"
repoURL: "https://github.com/naandalist/patch-package"
version: "8.1.6"
license: "MIT"
keywords:
  [
    "patch",
    "package",
    "module",
    "node_modules",
    "npm",
    "yarn",
    "fix",
    "dependency",
    "fork",
    "hotfix",
    "monkeypatch",
    "security",
    "maintenance",
  ]
lang: "en"
---

# @naandalist/patch-package

This package is a forked version of the official [patch-package v8.0.0](https://www.npmjs.com/package/patch-package). Its main purpose is to fix security vulnerabilities (MEDIUM and HIGH SEVERITY) while maintaining full compatibility with the original package.

## Security Improvements

This fork fixes all security vulnerabilities identified by Snyk:

| #   | Vulnerability                                        | Package     | Severity | Reference                  |
| --- | ---------------------------------------------------- | ----------- | -------- | -------------------------- |
| 1   | Regular Expression Denial of Service (ReDoS)         | cross-spawn | High     | SNYK-JS-CROSSSPAWN-8303230 |
| 2   | Inefficient Regular Expression Complexity            | micromatch  | High     | SNYK-JS-MICROMATCH-6838728 |
| 3   | Missing Release of Resource after Effective Lifetime | inflight    | Medium   | SNYK-JS-INFLIGHT-6095116   |

## Installation

```bash
# Using npm
npm install @naandalist/patch-package

# Using yarn
yarn add @naandalist/patch-package
```

## Usage

The usage remains identical to the original patch-package, maintaining full compatibility while providing enhanced security.

### Creating Patches

1. Make your changes to package files in the `node_modules` folder
2. Run the following command:

```bash
# Using yarn
yarn patch-package package-name

# Using npm
npx patch-package package-name
```

### Applying Patches

Patches are automatically applied when you run:

```bash
yarn install
# or
npm install
```

For detailed usage instructions and advanced features, please refer to the [original patch-package documentation](https://www.npmjs.com/package/patch-package).

## Why Use This Fork?

- ✅ All original functionality preserved
- 🛡️ Snyk finding security vulnerabilities fixed
- 💪 Regular security maintenance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See [LICENSE](https://github.com/naandalist/patch-package/blob/main/LICENSE) for details.

For more details, please visit the [GitHub repository](https://github.com/naandalist/patch-package).
