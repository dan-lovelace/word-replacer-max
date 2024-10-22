import Benchmark from "benchmark";

import { regExpReplace } from "@worm/shared/src/replace/lib/regex";

const suite = new Benchmark.Suite();

suite.add("standard replace", function () {
  "hello world".replace(/(hello)\s(world)/, "$2 $1");
});

suite.add("custom regexp replace", function () {
  regExpReplace("\\U$2\\E \\L$1\\E")("", "hello", "world");
});

suite
  .on("cycle", function (event: Event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
