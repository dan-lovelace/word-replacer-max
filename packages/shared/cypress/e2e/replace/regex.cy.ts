import { selectors as s } from "../../support/selectors";

import { searchAndReplace } from "./lib";

describe("PCRE-style case modifications", () => {
  const testCases = [
    {
      description: "uppercase first word and lowercase second word",
      input: "hello world",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\U$1\\E \\L$2\\E",
      expected: "HELLO world",
    },
    {
      description: "lowercase first word and uppercase second word",
      input: "hello world",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\L$1\\E \\U$2\\E",
      expected: "hello WORLD",
    },
    {
      description: "titlecase both words",
      input: "hello world",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\F$1\\E \\F$2\\E",
      expected: "Hello World",
    },
    {
      description: "uppercase then lowercase in a single replacement",
      input: "hello WORLD",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\U$1\\L$2\\E",
      expected: "HELLOworld",
    },
    {
      description:
        "titlecase first word and uppercase second word with mixed input",
      input: "HeLLo WoRLD",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\F$1\\E \\U$2\\E",
      expected: "Hello WORLD",
    },
    {
      description: "apply case modifications with punctuation",
      input: "hello, world!",
      pattern: "(\\w+),\\s(\\w+)!",
      replacement: "\\U$1\\E, \\F$2\\E!",
      expected: "HELLO, World!",
    },
    {
      description: "handle nested case modifications",
      input: "nested case test",
      pattern: "(\\w+)\\s(\\w+)\\s(\\w+)",
      replacement: "\\U$1\\L\\U$2\\E$3\\E",
      expected: "NESTEDCASEtest",
    },
    {
      description:
        "apply case modifications with numbers and special characters",
      input: "test123 @example",
      pattern: "(\\w+)(\\d+)\\s(@\\w+)",
      replacement: "\\U$1\\E$2 \\L$3\\E",
      expected: "TEST123 @example",
    },
    {
      description: "handle multiple occurrences in a string",
      input: "one two three",
      pattern: "(\\w+)",
      replacement: "\\F$1\\E",
      expected: "One Two Three",
    },
    {
      description: "handle escaped backslashes",
      input: "escape\\test",
      pattern: "(\\w+)\\\\(\\w+)",
      replacement: "\\U$1\\E\\\\\\L$2\\E",
      expected: "ESCAPE\\test",
    },
    {
      description: "mix backreferences and literal text",
      input: "mix test",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "\\U$1\\E-literal-\\L$2\\E",
      expected: "MIX-literal-test",
    },
    {
      description: "apply case modifications at the end of the string",
      input: "end test",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "$1 \\U$2",
      expected: "end TEST",
    },
    {
      description: "capitalize first letter after dash",
      input: "Lorem - ipsum",
      pattern: "(- )(\\w)",
      replacement: "$1\\U$2\\E",
      expected: "Lorem - Ipsum",
    },
    {
      description: "capitalize first letter after multiple dashes",
      input: "Lorem - ipsum - dolor - sit",
      pattern: "(- )(\\w)",
      replacement: "$1\\U$2\\E",
      expected: "Lorem - Ipsum - Dolor - Sit",
    },
  ];

  testCases.forEach(
    ({ description, input, pattern, replacement, expected }) => {
      it(`should ${description}`, () => {
        cy.visitMock({
          targetContents: input,
        });

        s.target().then(($element) => {
          const target = $element.get(0);

          searchAndReplace(target, pattern, ["regex"], replacement);
          cy.wrap(target).should("have.text", expected);
        });
      });
    }
  );
});

describe("JavaScript regex backwards compatibility", () => {
  const testCases = [
    {
      description: "perform basic replacement",
      input: "hello world",
      pattern: "world",
      replacement: "JavaScript",
      expected: "hello JavaScript",
    },
    {
      description: "handle capture groups correctly",
      input: "hello world",
      pattern: "(\\w+)\\s(\\w+)",
      replacement: "$2 $1",
      expected: "world hello",
    },
    {
      description: "respect ignore case flag",
      input: "HELLO WORLD",
      pattern: "hello",
      replacement: "hi",
      flags: "i",
      expected: "hi WORLD",
    },
    {
      description: "perform global replacement",
      input: "test test test",
      pattern: "test",
      replacement: "exam",
      flags: "g",
      expected: "exam exam exam",
    },
    {
      description: "respect word boundaries",
      input: "The cat scattered the cards",
      pattern: "\\bcat\\b",
      replacement: "dog",
      expected: "The dog scattered the cards",
    },
    {
      description: "handle lookahead assertions",
      input: "hello there",
      pattern: "hello(?=\\sthere)",
      replacement: "hi",
      expected: "hi there",
    },
    {
      description: "handle lookbehind assertions",
      input: "100 dollars",
      pattern: "(?<=\\d+\\s)dollars",
      replacement: "euros",
      expected: "100 euros",
    },
    {
      description: "handle backreferences in pattern",
      input: "hello hello",
      pattern: "(\\w+)\\s\\1",
      replacement: "$1 world",
      expected: "hello world",
    },
    {
      description: "handle non-capturing groups",
      input: "abc123def",
      pattern: "a(?:bc)(\\d+)",
      replacement: "x$1y",
      expected: "x123ydef",
    },
    {
      description: "handle escaping of special characters",
      input: "a+b=c",
      pattern: "\\+",
      replacement: "plus",
      expected: "aplusb=c",
    },
    {
      description: "support unicode characters",
      input: "こんにちは世界",
      pattern: "世界",
      replacement: "ワールド",
      expected: "こんにちはワールド",
    },
    {
      description: "handle complex regex with quantifiers",
      input: "aabbccddee",
      pattern: "(a+)b+(c+)",
      replacement: "$1-$2",
      expected: "aa-ccddee",
    },
  ];

  testCases.forEach(
    ({ description, input, pattern, replacement, expected }) => {
      it(`should ${description}`, () => {
        cy.visitMock({
          targetContents: input,
        });

        s.target().then(($element) => {
          const target = $element.get(0);

          searchAndReplace(target, pattern, ["regex"], replacement);
          cy.wrap(target).should("have.text", expected);
        });
      });
    }
  );
});
