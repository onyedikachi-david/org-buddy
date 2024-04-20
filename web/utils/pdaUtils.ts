import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export async function getOrgPDA(payer, program) {
  const [orgPDA, bump] = await PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('organization'),
      payer.publicKey.toBuffer(),
    ],
    program.programId
  );
  return { orgPDA, bump };
}

export async function getBudgetPDA(payer, program) {
  const [budgetPDA, _bump] = await PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode('budget'), payer.publicKey.toBuffer()],
    program.programId
  );
  return { budgetPDA, _bump };
}
