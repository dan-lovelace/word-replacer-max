import { replaceAll } from "@worm/shared/src/replace";

jest.useFakeTimers().setSystemTime(new Date("2024-01-01"));

describe("replaceAll", () => {
  // describe("document cases", () => {
  //   it("includes 'title' elements in the head", () => {
  //     document.documentElement.innerHTML = `
  //       <html>
  //         <head>
  //           <title>Lorem ipsum dolor</title>
  //         </head>
  //         <body>
  //           <p>
  //             Lorem ipsum dolor
  //           </p>
  //         </body>
  //       </html>
  //     `;
  //     replaceAll([
  //       {
  //         active: true,
  //         identifier: "1234",
  //         queries: ["ipsum"],
  //         queryPatterns: [],
  //         replacement: "sit",
  //       },
  //     ]);
  //     expect(document.documentElement).toMatchSnapshot();
  //   });
  //   it("does not overwrite 'script' elements", () => {
  //     document.documentElement.innerHTML = `
  //       <html>
  //         <head>
  //           <title>Lorem ipsum dolor</title>
  //           <script>
  //             function ipsum() {
  //             }
  //           </script>
  //         </head>
  //         <body>
  //           <p>
  //             Lorem ipsum dolor
  //           </p>
  //           <script>
  //             const html = document.createElement("html");
  //             html.innerHTML = "<body>Lorem ipsum dolor sit</body>";
  //           </script>
  //         </body>
  //       </html>
  //     `;
  //     replaceAll([
  //       {
  //         active: true,
  //         identifier: "1234",
  //         queries: ["ipsum"],
  //         queryPatterns: [],
  //         replacement: "sit",
  //       },
  //     ]);
  //     expect(document.documentElement).toMatchSnapshot();
  //   });
  //   it("maintains text enhancement elements", () => {
  //     document.documentElement.innerHTML = `
  //       <html>
  //         <body>
  //           <p>
  //             Lorem <u>ipsum</u> dolor
  //           </p>
  //         </body>
  //       </html>
  //     `;
  //     replaceAll([
  //       {
  //         active: true,
  //         identifier: "1234",
  //         queries: ["ipsum"],
  //         queryPatterns: [],
  //         replacement: "sit",
  //       },
  //     ]);
  //     expect(document.documentElement).toMatchSnapshot();
  //   });
  //   it("does not match across element boundaries", () => {
  //     document.documentElement.innerHTML = `
  //       <html>
  //         <body>
  //           <p>
  //             Lorem <u>ipsum</u> dolor
  //           </p>
  //         </body>
  //       </html>
  //     `;
  //     replaceAll([
  //       {
  //         active: true,
  //         identifier: "1234",
  //         queries: ["ipsum dolor"],
  //         queryPatterns: [],
  //         replacement: "sit",
  //       },
  //     ]);
  //     expect(document.documentElement).toMatchSnapshot();
  //   });
  // });
});
