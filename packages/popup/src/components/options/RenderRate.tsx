import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

import { debounce } from "@worm/shared";
import {
  DEFAULT_RENDER_RATE_MS,
  MAX_RENDER_RATE_MS,
  MIN_RENDER_RATE_MS,
} from "@worm/shared/src/replace/lib/render";
import { storageSetByKeys } from "@worm/shared/src/storage";
import { RenderRate as TRenderRate } from "@worm/types/src/rules";

import { Indented } from "../../containers/Indented";
import { useConfig } from "../../store/Config";

import Button from "../button/Button";
import Slide from "../transition/Slide";

const IS_ENABLED_INPUT_ID = "render-rate-enabled-checkbox";
const SLIDER_INPUT_ID = "render-rate-frequency-slider";

const debouncedFrequencyUpdate = debounce(
  (newRenderRate: TRenderRate) => {
    storageSetByKeys({
      renderRate: newRenderRate,
    });
  },
  () => 200,
  false
);

export default function RenderRate() {
  const [rangeValue, setRangeValue] = useState("");

  const {
    storage: {
      sync: { renderRate },
    },
  } = useConfig();

  useEffect(() => {
    if (renderRate === undefined) {
      return;
    }

    const frequencyString = renderRate.frequency.toString();

    setRangeValue(frequencyString);
  }, [renderRate?.frequency]);

  const handleActiveChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newActive = event.currentTarget.checked;
    const newRenderRate = { ...renderRate } as TRenderRate;
    newRenderRate.active = newActive;

    if (!newActive) {
      newRenderRate.frequency = DEFAULT_RENDER_RATE_MS;
    }

    storageSetByKeys({
      renderRate: newRenderRate,
    });
  };

  const handleDefaultsClick = () => {
    const newRenderRate = { ...renderRate } as TRenderRate;
    newRenderRate.frequency = DEFAULT_RENDER_RATE_MS;

    storageSetByKeys({
      renderRate: newRenderRate,
    });
  };

  const handleRangeChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const newValue = Number(event.currentTarget.value);

    if (isNaN(newValue)) {
      throw new Error(`New value is not a number: ${newValue}`);
    } else if (newValue < MIN_RENDER_RATE_MS) {
      throw new Error(`New value cannot be less than: ${MIN_RENDER_RATE_MS}`);
    }

    const newRenderRate = { ...renderRate } as TRenderRate;
    newRenderRate.frequency = newValue;

    // to avoid hitting storage write operation quotas
    debouncedFrequencyUpdate(newRenderRate);

    setRangeValue(newValue.toString());
  };

  const isActive = Boolean(renderRate?.active);

  return (
    <div data-testid="render-rate">
      <div
        className="form-check form-switch ps-0 d-flex align-items-center gap-2"
        data-testid="render-rate-input-wrapper"
      >
        <input
          checked={isActive}
          className="form-check-input m-0"
          id={IS_ENABLED_INPUT_ID}
          role="switch"
          type="checkbox"
          onChange={handleActiveChange}
          data-testid="render-rate-toggle-button"
        />
        <label
          className="form-check-label user-select-none fw-medium"
          for={IS_ENABLED_INPUT_ID}
        >
          Custom replacement frequency
        </label>
      </div>

      <Indented data-testid="render-rate-description">
        <div className="fs-sm">
          Control how fast replacements occur on dynamic websites. If you're
          experiencing performance problems, using a slower frequency can help.
        </div>
      </Indented>

      <Slide isOpen={isActive}>
        <Indented className="py-1" data-testid="render-rate-options">
          <div style={{ maxWidth: 300 }}>
            <div className="d-flex align-items-center"></div>
            <div className="input-group">
              <div className="input-group-text">Fast</div>
              <div className="form-control flex-fill d-flex align-items-center">
                <label className="visually-hidden" for={SLIDER_INPUT_ID}>
                  Frequency (ms)
                </label>
                <input
                  className="form-range"
                  id={SLIDER_INPUT_ID}
                  min={MIN_RENDER_RATE_MS}
                  max={MAX_RENDER_RATE_MS}
                  step="10"
                  type="range"
                  value={rangeValue}
                  onChange={handleRangeChange}
                />
              </div>
              <div className="input-group-text">Slow</div>
            </div>
            <div className="position-relative">
              <div className="text-secondary fs-sm text-center pt-1">
                {rangeValue}ms
              </div>
              <div className="position-absolute end-0 top-0">
                <Button
                  className="btn btn-link text-decoration-none p-0 fs-sm"
                  onClick={handleDefaultsClick}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Indented>
      </Slide>
    </div>
  );
}
