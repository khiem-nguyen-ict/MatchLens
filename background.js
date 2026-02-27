// ✅ This function runs in PAGE world - must be fully self-contained
function typeaheadPageWorldLogic(selector, newValue) {
  return new Promise((resolve, reject) => {
    const input = document.querySelector(selector);
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;

    // Step 1: Set the search text and trigger input event so LinkedIn fetches matching results
    nativeSetter.call(input, newValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // Step 2: Open dropdown via React fiber
    const fiberKey = Object.keys(input).find((k) =>
      k.startsWith("__reactFiber"),
    );
    let current = input[fiberKey];
    while (current) {
      const props = current.memoizedProps;
      if (props?.onFocus)
        props.onFocus({ target: input, currentTarget: input, bubbles: true });
      if (props?.onClick)
        props.onClick({ target: input, currentTarget: input, bubbles: true });
      if (props?.onChange)
        props.onChange({ target: input, currentTarget: input, bubbles: true });
      current = current.return;
    }

    // Step 3: Poll until the matching option appears
    const maxAttempts = 20;
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      const options = document.querySelectorAll('[role="option"]');
      const target = Array.from(options).find((o) =>
        o.textContent.toLowerCase().includes(newValue.toLowerCase()),
      );

      if (target) {
        clearInterval(interval);
        console.log("Selecting:", target.textContent.trim());

        target.click();
        const fiberKey = Object.keys(target).find((k) =>
          k.startsWith("__reactFiber"),
        );
        let current = target[fiberKey];
        while (current) {
          const props = current.memoizedProps;
          if (props?.onClick)
            props.onClick({
              target,
              currentTarget: target,
              bubbles: true,
              preventDefault: () => {},
            });
          if (props?.onMouseDown)
            props.onMouseDown({
              target,
              currentTarget: target,
              bubbles: true,
              preventDefault: () => {},
            });
          current = current.return;
        }

        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn(
          "Option not found. Available:",
          Array.from(document.querySelectorAll('[role="option"]')).map((o) =>
            o.textContent.trim(),
          ),
        );
        reject(new Error(`Option "${newValue}" not found`));
      }
    }, 300);
  });
}