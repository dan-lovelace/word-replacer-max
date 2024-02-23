import { replace } from "@worm/shared/src/replace";

function assertDefined<T>(obj: T | null | undefined): T {
  expect(obj).toBeDefined();

  return obj as T;
}

describe("replace", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum", [], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "lorem ipsum", [], "sit");
      expect(target.textContent).toBe("sit dolor");
    });

    it("does not affect element attributes", () => {
      document.body.innerHTML = `
        <div>
          <p id="target" class="ipsum">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum", [], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
    });

    it("does not recursively replace", () => {
      document.body.innerHTML = `
        <div>
          <p id="target" class="ipsum">Lorem Ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "Lo", [], "Losit");
      replace(target.firstChild, "Lo", [], "Losit");
      replace(target.firstChild, "Lo", [], "Losit");

      expect(target.textContent).toBe("Lositrem Ipsum");
    });
  });

  describe("'case' query pattern only", () => {
    it("works for single words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum", ["case"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor Ipsum sit ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum", ["case"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor Ipsum sit sit");
    });
  });

  describe("'regex' query pattern only", () => {
    it("works with basic patterns", () => {
      document.body.innerHTML = `
        <div>
          <p id="target1">Lorem ipsum dolor</p>
          <p id="target2">Lorem ipsum dolor</p>
          <p id="target3">Lorem ipsum dolor</p>
        </div>
      `;

      const target1 = assertDefined(document.getElementById("target1"));
      replace(target1.firstChild, "ipsum", ["regex"], "sit");
      expect(target1.textContent).toBe("Lorem sit dolor");

      const target2 = assertDefined(document.getElementById("target2"));
      replace(target2.firstChild as HTMLElement, "ipsum.*", ["regex"], "sit");
      expect(target2.textContent).toBe("Lorem sit");

      const target3 = assertDefined(document.getElementById("target3"));
      replace(
        target3.firstChild as HTMLElement,
        "^(Lo)+rem[\\s]+i{1}",
        ["regex"],
        "sit"
      );
      expect(target3.textContent).toBe("sitpsum dolor");
    });
  });

  describe("'wholeWord' query pattern only", () => {
    it("works for single words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor ipsum.</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum.", ["wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem ipsum dolor sit");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor Ipsum. sit ipsum.</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "ipsum.", ["wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem ipsum dolor sit sit sit");
    });

    it("works with punctuation", () => {
      document.body.innerHTML = `
        <div>
          <p id="target1">Lorem 'Ipsum' dolor</p>
        </div>
      `;

      const target1 = assertDefined(document.getElementById("target1"));
      replace(target1.firstChild, "'Ipsum'", ["wholeWord"], "sit");
      expect(target1.textContent).toBe("Lorem sit dolor");

      document.body.innerHTML = `
        <div>
          <p id="target2">Lorem 'Ipsum' dolor</p>
        </div>
      `;

      const target2 = assertDefined(document.getElementById("target2"));
      replace(target2.firstChild, "Ipsum", ["wholeWord"], "sit");
      expect(target2.textContent).toBe("Lorem 'Ipsum' dolor");
    });
  });

  describe("'case' and 'wholeWord' query patterns together", () => {
    it("works for single words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor sIpsum ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "Ipsum", ["case", "wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor sIpsum ipsum");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor sIpsum Ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target.firstChild, "Ipsum", ["case", "wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor sIpsum sit");
    });
  });
});
