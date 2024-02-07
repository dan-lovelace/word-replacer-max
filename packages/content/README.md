# @worm/content

This is the
[content script](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts).

## Main purposes

- Crawl the current webpage for instances of user-defined queries and define a
  list of HTML nodes whose text content match.
- Consider query pattern optionss such as "match case" and "match whole word."
- Update all or parts of the resulting nodes' text content with a user-defined
  replacement.

## Secondary purposes

- Serve the project's only distributed `public` directory for static assets.
