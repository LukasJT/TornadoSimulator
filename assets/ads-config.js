/* Adsterra keys - one place to update all ad codes.
 * Keep high-viewability formats active, but do not run clickunder/popunder
 * tags that hijack normal page clicks.
 */
window.ADSTERRA = {
  // Iframe banner keys (used inline in article HTML)
  banner728x90: 'b7d63c1973b341722e34dd6f314916ba', // desktop leaderboard
  banner468x60: null, // legacy size; lower demand and disabled for new injection
  banner300x250: '1fe957d85bb2cf92027de309038cd17b', // medium rectangle
  banner320x50: 'c9b6de5dcbbc4a9a6331cd5534b0ebd2', // mobile banner
  banner160x600: 'da8c75671b236383c52eb13078c2a148', // wide skyscraper
  banner160x300: 'ff3f3758b896daf1842b3be893ed46f2', // half skyscraper

  // Disabled: this script-only tag behaves like an on-click popunder/clickunder.
  // Re-enable only if Adsterra confirms it is a non-click-hijacking Social Bar tag.
  socialBarSrc: null,
  disabledClickunderSrc: '//pl30266273.effectivecpmnetwork.com/38/35/8f/38358fe894e2e2919ff9dbccf8e09481.js',
  disabledDirectLink: 'https://www.effectivecpmnetwork.com/vdj8rvs4q?key=a843db2a4e7a62c1fbab5d7ad4d91a33',

  // Native Banner (in-content, stronger engagement than standard banners)
  nativeBannerSrc: '//pl30266272.effectivecpmnetwork.com/e6d44dd184e6e948eb9c1a7c57155196/invoke.js',
  nativeBannerContainerId: 'container-e6d44dd184e6e948eb9c1a7c57155196',

  // In-Page Push (game/tool pages only)
  inPagePushSrc: '//pl30266280.effectivecpmnetwork.com/e9/48/12/e948122feaa7bd58b18c5ad800302247.js',
};
