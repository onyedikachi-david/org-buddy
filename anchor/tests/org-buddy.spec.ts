import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { OrgBuddy } from '../target/types/org_buddy';
import { PublicKey } from '@solana/web3.js';

async function airdropSol(publicKey, amount) {
  let airdropTx = await anchor
    .getProvider()
    .connection.requestAirdrop(publicKey, amount);
  await confirmTransaction(airdropTx);
}

async function confirmTransaction(tx) {
  const latestBlockHash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
}

describe('org-buddy', () => {
  // Configure the client to use the local cluster.
  // anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OrgBuddy as Program<OrgBuddy>;
  const payer = provider.wallet as anchor.Wallet;

  it('should create budget', async () => {
    // Add your test here.
    const newKeypair = anchor.web3.Keypair.generate();
    await airdropSol(newKeypair.publicKey, 1e9); // 1 SOL
    const [orgPDA, bump] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('organization'),
        payer.publicKey.toBuffer(),
      ],
      program.programId
    );
    const [budgetPDA, _bump] = await PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('budget'), payer.publicKey.toBuffer()],
      program.programId
    );
    const tx = await program.methods
      .createBudget(6)
      .accounts({
        budget: budgetPDA,
        org: orgPDA,
        user: payer.publicKey,
      })
      .signers(newKeypair)
      .rpc();
    console.log('Your transaction signature', tx);
  });
});
