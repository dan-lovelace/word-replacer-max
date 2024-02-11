import { replace, searchNode } from "./parse";

const DEFAULT_TEST_STRING = "Lorem ipsum dolor sit amet";

function assertDefined<T>(obj: T | null | undefined): T {
  expect(obj).toBeDefined();
  return obj as T;
}

describe("searchNode", () => {
  describe("default query pattern", () => {
    it("can return empty", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "shrike", []);
      expect(result.length).toBe(0);
    });

    it("matches a single node", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "ipsum", []);
      expect(result.length).toBe(1);
    });

    it("matches a multiple nodes", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "ipsum", []);
      expect(result.length).toBe(2);
    });

    it("matches child text", () => {
      document.body.innerHTML = `
        <div>
          <p>
            <span>This is a test</span>
            ${DEFAULT_TEST_STRING}
          </p>
        </div>
      `;
      const result = searchNode(document.body, "ipsum", []);
      expect(result.length).toBe(1);
    });
  });

  describe("'case' query pattern only", () => {
    it("can return empty", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "Ipsum", ["case"]);

      expect(result.length).toBe(0);
    });

    it("matches a single node", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "ipsum", ["case"]);
      expect(result.length).toBe(1);
    });

    it("matches a multiple nodes", () => {
      const testString = "Lorem Ipsum dolor";
      document.body.innerHTML = `
        <div>
          <p>${testString}</p>
          <p>
            <span>${testString}</span>
          </p>
        </div>
      `;

      const result = searchNode(document.body, "Ipsum", ["case"]);
      expect(result.length).toBe(2);
    });

    it("only matches same case", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">${DEFAULT_TEST_STRING.toUpperCase()}</p>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "IPSUM", ["case"]);
      expect(result.length).toBe(1);
    });
  });

  describe("'wholeWord' query pattern only", () => {
    it("can return empty", () => {
      document.body.innerHTML = `
      <div>
        <p>Lorem dolor ipsumit</p>
        <p>Lorem dolor sipsum</p>
        <p>Lorem dolor sipsumit</p>
        <p>Lorem dolor sipsum.</p>
      </div>
    `;

      const result = searchNode(document.body, "ipsum", ["wholeWord"]);
      expect(result.length).toBe(0);
    });

    it("matches a single node", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "ipsum", ["wholeWord"]);
      expect(result.length).toBe(1);
    });

    it("matches a multiple nodes", () => {
      document.body.innerHTML = `
        <div>
          <span>${DEFAULT_TEST_STRING}</span>
          <span>Lorem Ipsum dolor</span>
        </div>
      `;

      const result = searchNode(document.body, "Ipsum", ["wholeWord"]);
      expect(result.length).toBe(2);
    });

    it("matches with puncutation", () => {
      document.body.innerHTML = `
        <div>
          <span>Lorem Ipsum.</span>

          <span>Lorem .Ipsum.</span>
          <span>Lorem .Ipsum</span>
          <span>Lorem Ipsum/</span>
          <span>Lorem Ipsum-</span>
          <span>Lorem Ipsum_</span>
        </div>
      `;
      expect(searchNode(document.body, "Ipsum.", ["wholeWord"]).length).toBe(1);

      document.body.innerHTML = `
        <div>
          <span>Lorem Ipsum-</span>

          <span>Lorem -Ipsum-</span>
          <span>Lorem -Ipsum</span>
          <span>Lorem Ipsum/</span>
          <span>Lorem Ipsum_</span>
          <span>Lorem Ipsum .</span>
        </div>
      `;
      expect(searchNode(document.body, "Ipsum-", ["wholeWord"]).length).toBe(1);
    });

    it("is case-insensitive", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
          <p>Lorem Ipsum dolor</p>
        </div>
      `;

      const result = searchNode(document.body, "ipsum", ["wholeWord"]);
      expect(result.length).toBe(2);
    });
  });

  describe("'case' and 'wholeWord' query patterns together", () => {
    it("can return empty", () => {
      document.body.innerHTML = `
        <div>
          <p>${DEFAULT_TEST_STRING}</p>
        </div>
      `;

      const result = searchNode(document.body, "Ipsum", ["case", "wholeWord"]);
      expect(result.length).toBe(0);
    });

    it("matches a single node", () => {
      document.body.innerHTML = `
        <div>
          <p>Lorem Ipsum dolor</p>
          <p>Lorem ipsum dolor</p>
          <p>Lorem ipsum dolor sIpsumit</p>
        </div>
      `;

      const result = searchNode(document.body, "Ipsum", ["case", "wholeWord"]);
      expect(result.length).toBe(1);
    });
  });
});

describe("replace", () => {
  describe("default query pattern", () => {
    it("works for single words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "ipsum", [], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "lorem ipsum", [], "sit");
      expect(target.textContent).toBe("sit dolor");
    });

    it("does not affect element attributes", () => {
      document.body.innerHTML = `
        <div>
          <p id="target" class="ipsum">Lorem Ipsum dolor</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "ipsum", [], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
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
      replace(target, "ipsum", ["case"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor Ipsum sit ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "ipsum", ["case"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor Ipsum sit sit");
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
      replace(target, "ipsum.", ["wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem ipsum dolor sit");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem ipsum dolor Ipsum. sit ipsum.</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "ipsum.", ["wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem ipsum dolor sit sit sit");
    });

    it("works with punctuation", () => {
      document.body.innerHTML = `
        <div>
          <p id="target1">Lorem 'Ipsum' dolor</p>
        </div>
      `;

      const target1 = assertDefined(document.getElementById("target1"));
      replace(target1, "'Ipsum'", ["wholeWord"], "sit");
      expect(target1.textContent).toBe("Lorem sit dolor");

      document.body.innerHTML = `
        <div>
          <p id="target2">Lorem 'Ipsum' dolor</p>
        </div>
      `;

      const target2 = assertDefined(document.getElementById("target2"));
      replace(target2, "Ipsum", ["wholeWord"], "sit");
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
      replace(target, "Ipsum", ["case", "wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor sIpsum ipsum");
    });

    it("works for multiple words", () => {
      document.body.innerHTML = `
        <div>
          <p id="target">Lorem Ipsum dolor sIpsum Ipsum</p>
        </div>
      `;

      const target = assertDefined(document.getElementById("target"));
      replace(target, "Ipsum", ["case", "wholeWord"], "sit");
      expect(target.textContent).toBe("Lorem sit dolor sIpsum sit");
    });
  });
});
