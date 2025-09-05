# @web-extension/popup

This is the
[popup](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups)
that displays when the extension is clicked in the toolbar.

## Technologies

- [Bootstrap v5](https://getbootstrap.com/docs/5.3)
- [Preact](https://preactjs.com/)
- [Sass](https://sass-lang.com/documentation/js-api/)

## Running tests

### Unit

```sh
yarn jest packages/popup
```

See also: https://jestjs.io/

### End to end

1. Open a new terminal session and open two tabs
1. In the first tab, start the development server using test mode
   ```sh
   VITE_MODE=test yarn workspace @web-extension/popup dev
   ```
1. In the second tab, run Cypress using the desired mode:
   - **GUI** - `yarn workspace @web-extension/popup cypress:open`
   - **Headless** - `yarn workspace @web-extension/popup cypress:run`

See also: https://www.cypress.io/
