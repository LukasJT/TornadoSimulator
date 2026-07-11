/* Adsterra keys — one place to update all ad codes.
 * Get keys from your Adsterra publisher dashboard → Websites → Add Code.
 * Set null (or empty string) to disable that format.
 *
 * TO ENABLE HIGHER-CPM FORMATS:
 *  1. Log in to publisher.adsterra.com
 *  2. Choose your website (tornadosimulator.net)
 *  3. Click "Add Code" and pick the format
 *  4. Copy the key from the generated code and paste below
 */
window.ADSTERRA = {
  // Standard banner iframes — currently deployed
  banner728x90:  'b7d63c1973b341722e34dd6f314916ba',
  banner160x600: 'da8c75671b236383c52eb13078c2a148',
  banner160x300: 'ff3f3758b896daf1842b3be893ed46f2',

  // ★ Social Bar (highest CPM lever, 2-10x banner)
  //   In Adsterra dashboard: Add Code → Social Bar
  //   Paste the invoke.js key (looks like: pl12345678.profitableratecpm.com/xx/xx/xx)
  socialBarSrc: '',  // e.g., '//pl12345678.profitableratecpm.com/aa/bb/cc/xxx.js'

  // ★ Native Banner (in-content, 3-5x banner CPM)
  //   In Adsterra dashboard: Add Code → Native Banner
  //   Paste the container id and script src
  nativeBannerSrc: '',   // e.g., '//pl12345678.profitableratecpm.com/xxxxxxxx/invoke.js'
  nativeBannerContainerId: '',  // e.g., 'container-xxxxxxxx'

  // ★ In-Page Push (for interactive/game pages)
  //   In Adsterra dashboard: Add Code → In-Page Push
  inPagePushSrc: '',  // e.g., '//groleegni.net/xxxx/xxxx.js'
};
