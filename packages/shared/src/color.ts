class ColorGenerator {
  private recentHues: number[] = [];
  private readonly HUE_DIFFERENCE_THRESHOLD = 30;
  private readonly SATURATION_RANGE = { min: 70, max: 80 };
  private readonly LIGHTNESS_RANGE = { min: 45, max: 65 };
  private readonly UNIQUE_COLOR_MEMORY_SIZE = 5; // Number of previous colors to ensure uniqueness against

  private hslToHex(hue: number, saturation: number, lightness: number): string {
    const hslToRgb = (
      chromaMax: number,
      chromaMin: number,
      huePrime: number
    ): number => {
      if (huePrime < 0) huePrime += 1;
      if (huePrime > 1) huePrime -= 1;
      if (huePrime < 1 / 6)
        return chromaMax + (chromaMin - chromaMax) * 6 * huePrime;
      if (huePrime < 1 / 2) return chromaMin;
      if (huePrime < 2 / 3)
        return chromaMax + (chromaMin - chromaMax) * (2 / 3 - huePrime) * 6;

      return chromaMax;
    };

    saturation /= 100;
    lightness /= 100;

    // Calculate chroma (color intensity) and grayscale adjustment
    const chromaMax =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const chromaMin = 2 * lightness - chromaMax;

    const r = Math.round(
      hslToRgb(chromaMin, chromaMax, hue / 360 + 1 / 3) * 255
    );
    const g = Math.round(hslToRgb(chromaMin, chromaMax, hue / 360) * 255);
    const b = Math.round(
      hslToRgb(chromaMin, chromaMax, hue / 360 - 1 / 3) * 255
    );

    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  private isTooSimilar(hue: number): boolean {
    return this.recentHues.some((recentHue) => {
      const diff = Math.abs(hue - recentHue);

      return Math.min(diff, 360 - diff) < this.HUE_DIFFERENCE_THRESHOLD;
    });
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateUniqueHue(): number {
    let hue: number;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    do {
      hue = this.randomInRange(0, 359);
      attempts++;

      if (attempts >= MAX_ATTEMPTS) {
        this.recentHues = []; // Reset if we can't find a unique hue

        break;
      }
    } while (this.isTooSimilar(hue));

    this.recentHues.push(hue);

    if (this.recentHues.length > this.UNIQUE_COLOR_MEMORY_SIZE) {
      this.recentHues.shift();
    }

    return hue;
  }

  /**
   * Generates a new semi-random HEX color (i.e. `#ff11cd`). Uniqueness is
   * enforced by keeping a history of generated colors and ensuring any new
   * colors are not too-similar to any in memory.
   */
  public generate(): string {
    const hue = this.generateUniqueHue();
    const saturation = this.randomInRange(
      this.SATURATION_RANGE.min,
      this.SATURATION_RANGE.max
    );
    const lightness = this.randomInRange(
      this.LIGHTNESS_RANGE.min,
      this.LIGHTNESS_RANGE.max
    );

    return this.hslToHex(hue, saturation, lightness);
  }
}

export const colorGenerator = new ColorGenerator();
