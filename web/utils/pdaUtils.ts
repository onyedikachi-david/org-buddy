import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { OrgBuddy } from '@org-buddy/anchor';

export async function getOrgPDA(
  payer: { publicKey: { toBuffer: () => Buffer | Uint8Array } },
  program: anchor.Program<OrgBuddy>
) {
  const [orgPDA, bump] = await PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('organization'),
      payer.publicKey.toBuffer(),
    ],
    program.programId
  );
  return { orgPDA, bump };
}

export async function getBudgetPDA(
  payer: { publicKey: { toBuffer: () => Buffer | Uint8Array } },
  program: anchor.Program<OrgBuddy>
) {
  const [budgetPDA, _bump] = await PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode('budget'), payer.publicKey.toBuffer()],
    program.programId
  );
  return { budgetPDA, _bump };
}
