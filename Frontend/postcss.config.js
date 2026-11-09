// daisyUI ships a range slider whose :focus rule drops the outline. The app has no
// range input, so its rules are left out of the build (keeps every focus ring visible).
const dropUnusedRange = () => ({
  postcssPlugin: "drop-unused-range",
  Rule(rule) {
    if (/(^|[\s,.])\\?!?range\b/.test(rule.selector) && /\brange\b/.test(rule.selector)) {
      const kept = rule.selectors.filter((sel) => !/\.\\?!?range\b/.test(sel));
      if (!kept.length) rule.remove();
      else rule.selectors = kept;
    }
  },
});
dropUnusedRange.postcss = true;

export default {
  plugins: [
    (await import("tailwindcss")).default,
    (await import("autoprefixer")).default,
    dropUnusedRange,
  ],
};
