(function(global){
/*
  Licensed CompuBox data adapter.

  Do not copy beta.compuboxdata.com statistics into this file without permission.
  CompuBox directs fantasy-sports products to request an approved data feed.

  Supported profile fields:
  totalThrownPerRound, totalLandedPerRound, totalConnectPct,
  jabThrownPerRound, jabLandedPerRound, jabConnectPct,
  powerThrownPerRound, powerLandedPerRound, powerConnectPct,
  opponentLandedPerRound, opponentConnectPct, opponentPowerConnectPct, plusMinus.
*/
const profiles={};
function registerProfiles(licensedProfiles={},metadata={}){
  Object.assign(profiles,licensedProfiles);
  global.COMPUBOX_DATA.metadata={...metadata,licensed:true};
}
function profileFor(fighter){
  return profiles[fighter.id]||profiles[fighter.name]||null;
}
global.COMPUBOX_DATA={
  profiles,profileFor,registerProfiles,
  metadata:{licensed:false,provider:"CompuBox",contact:"info@compuboxdata.com"}
};
})(typeof window!=="undefined"?window:globalThis);
