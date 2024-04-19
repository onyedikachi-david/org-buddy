// Here we export some useful types and functions for interacting with the Anchor program.
import { PublicKey } from '@solana/web3.js';
import type { OrgBuddy } from '../target/types/org_buddy';
import { IDL as OrgBuddyIDL } from '../target/types/org_buddy';

// Re-export the generated IDL and type
export { OrgBuddy, OrgBuddyIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const programId = new PublicKey(
  '78pb7tZ1xG5yimX9quKGpFTvpbTKCVZ2kQkBw39uoazR'
);
