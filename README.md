# Word Replacer Max

A browser extension for replacing text on webpages.

## Available for [<img alt="chrome logo" src="./assets/chrome_logo.svg" style="margin-bottom: -2px;" /> Chrome](https://chromewebstore.google.com/detail/word-replacer-max/gnemoflnihonmkiacnagnbnlppkamfgo) and [<img alt="firefox logo" src="./assets/firefox_logo.svg" style="margin-bottom: -2px;" /> Firefox](https://addons.mozilla.org/en-US/firefox/addon/word-replacer-max)

<img alt="replace words and phrases" src="./assets/word-replacer-max-store-page-1.png" style="max-width: 100%; width: 410px"></img>
<img alt="flexible domain settings" src="./assets/word-replacer-max-store-page-2.png" style="max-width: 100%; width: 410px"></img>
<img alt="ruleset sharing" src="./assets/word-replacer-max-store-page-3.png" style="max-width: 100%; width: 410px"></img>
<img alt="highlight and replace" src="./assets/word-replacer-max-store-page-4.png" style="max-width: 100%; width: 410px"></img>

# Building locally

To get started, you'll need:

- [NodeJS](https://nodejs.org/en) v18 or higher
- [Yarn](https://yarnpkg.com/) package manager

## Instructions

1. Install dependencies
   ```
   yarn install
   ```
1. Run the `build` command using whichever manifest version you desire (`2` or
   `3`)
   ```
   yarn build 3
   ```
1. The resulting build exists in the `dist` directory which can be used to load
   an unpacked extension in your browser

# Developing

After following the dependency installation instructions above, use the
`start:*` command to start a development server using a given manifest version.
For version 2:

```
yarn start:2
```

File changes can be seen in real-time and may require the extension to be
reloaded.

# Packaging

1. Bump the version in `package.json`
1. Run the `package` command, targeting the correct manifest version
   ```
   yarn package 3
   ```
1. The resulting package exists in the `versions` directory which is to be used
   when uploading a new version to the extension stores
