import {
  DEFAULT_THEME_ID,
  FONT_PAIRS,
  getTheme,
  isThemeId,
  THEME_IDS,
  THEMES,
  themeStyle,
  TOKEN_KEYS,
} from "./themes";

describe("theme definitions", () => {
  it("has 7 themes with unique ids", () => {
    expect(THEMES).toHaveLength(7);
    expect(new Set(THEME_IDS).size).toBe(7);
  });

  it("includes the default theme", () => {
    expect(THEME_IDS).toContain(DEFAULT_THEME_ID);
  });

  it("every theme defines every token as a non-empty string", () => {
    for (const theme of THEMES) {
      for (const key of TOKEN_KEYS) {
        expect(typeof theme.tokens[key]).toBe("string");
        expect(theme.tokens[key].length).toBeGreaterThan(0);
      }
    }
  });

  it("every theme uses a known font pair", () => {
    for (const theme of THEMES) {
      expect(FONT_PAIRS[theme.fontPair]).toBeDefined();
    }
  });

  it("colour tokens look like CSS colours and radius like a length", () => {
    for (const theme of THEMES) {
      expect(theme.tokens.background).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(theme.tokens.primary).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(theme.tokens.radius).toMatch(/rem|px|em/);
    }
  });
});

describe("isThemeId", () => {
  it("accepts known ids and rejects everything else", () => {
    expect(isThemeId("everyday")).toBe(true);
    expect(isThemeId("nowruz")).toBe(true);
    expect(isThemeId("halloween")).toBe(false);
    expect(isThemeId(42)).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
  });
});

describe("getTheme", () => {
  it("returns the matching theme", () => {
    expect(getTheme("diwali").name).toBe("Diwali");
  });
  it("falls back to the first theme for an unknown id", () => {
    expect(getTheme("nope").id).toBe(THEMES[0].id);
  });
});

describe("themeStyle", () => {
  it("produces CSS custom properties for tokens and fonts", () => {
    const style = themeStyle("onam") as Record<string, string>;
    expect(style["--background"]).toBe("#fffdf5");
    expect(style["--primary"]).toBe("#2f7d4f");
    expect(style["--radius"]).toBe("1.1rem");
    expect(style["--font-serif"]).toContain("--font-dm-serif");
    expect(style["--font-sans"]).toContain("--font-dm-sans");
  });
});
