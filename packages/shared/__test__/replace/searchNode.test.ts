import { searchNode } from "@worm/shared/src/replace";

const DEFAULT_TEST_STRING = "Lorem ipsum dolor sit amet";

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
