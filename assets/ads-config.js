/* Adsterra keys - one place to update all ad codes.
 * Keep high-viewability formats active, but do not run clickunder/popunder
 * tags that hijack normal page clicks.
 */
window.ADSTERRA = {
  // Lean mode: while the site is under AdSense review, keep the page ad count
  // low so it never looks ad-heavy to a reviewer ("more ads than content").
  // Effect: no side rails, at most 1 auto medium rectangle, native banner and
  // the page's own inline slots still run. Set to false after AdSense approval
  // to restore full Adsterra density.
  leanMode: true,

  // Iframe banner keys (used inline in article HTML)
  banner728x90: 'b7d63c1973b341722e34dd6f314916ba', // desktop leaderboard
  banner468x60: null, // legacy size; lower demand and disabled for new injection
  banner300x250: '1fe957d85bb2cf92027de309038cd17b', // medium rectangle, best current CPM placement: 300x250_1 / 30165777
  preferredContentAd: 'banner300x250',
  maxAutoMediumRectangles: 3,
  banner320x50: 'c9b6de5dcbbc4a9a6331cd5534b0ebd2', // mobile banner
  banner160x600: 'da8c75671b236383c52eb13078c2a148', // wide skyscraper
  banner160x300: 'ff3f3758b896daf1842b3be893ed46f2', // half skyscraper

  // Disabled: this script-only tag behaves like an on-click popunder/clickunder.
  // Re-enable only if Adsterra confirms it is a non-click-hijacking Social Bar tag.
  socialBarSrc: null,
  disabledClickunderSrc: '//pl30266273.effectivecpmnetwork.com/38/35/8f/38358fe894e2e2919ff9dbccf8e09481.js',
  disabledDirectLink: 'https://www.effectivecpmnetwork.com/vdj8rvs4q?key=a843db2a4e7a62c1fbab5d7ad4d91a33',
  blockedClickAdNeedles: [
    'pl30266273.effectivecpmnetwork.com',
    '38358fe894e2e2919ff9dbccf8e09481',
    'vdj8rvs4q',
    'a843db2a4e7a62c1fbab5d7ad4d91a33',
    'pl30266280.effectivecpmnetwork.com',
    'e948122feaa7bd58b18c5ad800302247'
  ],

  // Native Banner (in-content, stronger engagement than standard banners)
  nativeBannerSrc: '//pl30266272.effectivecpmnetwork.com/e6d44dd184e6e948eb9c1a7c57155196/invoke.js',
  nativeBannerContainerId: 'container-e6d44dd184e6e948eb9c1a7c57155196',

  // Disabled for UX safety: script-only formats can behave like overlays on some devices.
  inPagePushSrc: null,
  disabledInPagePushSrc: '//pl30266280.effectivecpmnetwork.com/e9/48/12/e948122feaa7bd58b18c5ad800302247.js',
};

/* Adcash — used as fallback fill when an Adsterra slot returns no ad, plus one
 * guaranteed banner slot per page. Requires the aclib.js loader in <body>.
 * Zones here are individually controllable (unlike the removed AutoTag, which
 * could serve pop-unders and would have disqualified the site from AdSense). */
window.ADCASH = {
  enabled: true,

  // Banner zones. Sizes below were measured by rendering each zone live.
  banner728x90: '11810482',
  banner468x60: '11810490',
  banner300x100: '11810498',
  // Vertical skyscrapers — only valid in a narrow side rail, never in-content.
  banner160x600: '11810506',
  banner120x600: '11810534',

  /* Intrusive formats: implemented and ready, but OFF while AdSense reviews the
   * site. An overlay push widget and a sticky auto-playing video slider hurt
   * approval odds and cut against the no-intrusive-ads rule. To switch either
   * on later, move the id from the "disabled" key up to the live key. */
  inPagePush: null,
  videoSlider: null,
  disabledInPagePush: '11810542',
  disabledInPagePushMaxAds: 2,
  disabledVideoSlider: '11810550',
};
