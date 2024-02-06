import { useContext } from "preact/hooks";

import { storageSetByKeys } from "@worm/shared";
import { Matcher } from "@worm/types";

import ReplacementInput from "../components/ReplacementInput";
import QueryInput from "../components/QueryInput";
import { Config } from "../store/Config";

export default function Home() {
  const config = useContext(Config);

  const handleActiveChange = (identifier: string) => () => {
    const newMatchers = [...(config.storage.matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx].active = !newMatchers[matcherIdx].active;

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  const handleClick = () => {
    storageSetByKeys({
      matchers: [
        ...(config.storage.matchers ?? []),
        {
          active: true,
          identifier: new Date().getTime().toString(),
          queries: ["lorem"],
          queryPatterns: ["case"],
          replacement: "ipsum",
        },
      ],
    });
  };

  const handleMatcherInputChange = <K extends keyof Matcher>(
    identifier: string,
    key: K,
    newValue: Matcher[K]
  ) => {
    const newMatchers = [...(config.storage.matchers || [])];
    const matcherIdx = newMatchers.findIndex(
      (matcher) => matcher.identifier === identifier
    );

    if (matcherIdx < 0) return;

    newMatchers[matcherIdx][key] = newValue;

    storageSetByKeys({
      matchers: newMatchers,
    });
  };

  return (
    <div>
      <div className="container-fluid">
        {Boolean(config.storage.matchers?.length) && (
          <div className="list-group list-group-flush">
            {config.storage.matchers?.map(
              (
                { active, identifier, queries, queryPatterns, replacement },
                idx
              ) => (
                <div key={idx} className="list-group-item row d-flex">
                  <div className="col-auto d-flex align-items-center form-check form-switch ps-2">
                    <input
                      checked={active}
                      className="form-check-input m-0"
                      id={`active-check-${identifier}`}
                      role="switch"
                      type="checkbox"
                      onChange={handleActiveChange(identifier)}
                    />
                    <label
                      className="form-check-label visually-hidden"
                      for={`active-check-${identifier}`}
                    >
                      Active
                    </label>
                  </div>
                  <div className="col">
                    <QueryInput
                      identifier={identifier}
                      queries={queries}
                      queryPatterns={queryPatterns}
                      onChange={handleMatcherInputChange}
                    />
                  </div>
                  <div className="col-auto">
                    <i className="material-icons-sharp">swap_horiz</i>
                  </div>
                  <div className="col-auto">
                    <ReplacementInput
                      identifier={identifier}
                      replacement={replacement}
                      onChange={handleMatcherInputChange}
                    />
                  </div>
                  <div className="col-auto d-flex align-items-center">
                    <button className="btn">
                      <i className="material-icons-sharp">close</i>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
      <p>
        <button className="btn btn-primary" onClick={handleClick}>
          Add one
        </button>
      </p>
      <p>
        <div>{JSON.stringify(config, null, 2)}</div>
      </p>
    </div>
  );
}
