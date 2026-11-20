export const KNOT_TO_MS = 1852 / 3600;

// Inputs use SI units and nonnegative, right-moving SRH.
export function calculateEnvironment({ cape, lcl, shear, srh }) {
  const factors = {
    cape: cape / 1500,
    cloudBase: Math.min(1, Math.max(0, (2000 - lcl) / 1000)),
    helicity: srh / 150,
    shear: shear < 12.5 ? 0 : Math.min(1.5, shear / 20)
  };
  return {
    stp: factors.cape * factors.cloudBase * factors.helicity * factors.shear,
    ehi: cape * srh / 160000,
    updraft: Math.sqrt(2 * cape),
    factors
  };
}
