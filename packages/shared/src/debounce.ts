export function debounce(
  fn: Function,
  wait: () => number,
  leading = true,
  trailing = true
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let isLeadingInvoked = false;

  return function (this: any, ...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (leading && !timeoutId) {
      fn.apply(this, args);
      isLeadingInvoked = true;
    } else {
      isLeadingInvoked = false;
    }

    timeoutId = setTimeout(() => {
      if (trailing && !isLeadingInvoked) {
        fn.apply(this, args);
      }

      timeoutId = undefined;
    }, wait());
  };
}
