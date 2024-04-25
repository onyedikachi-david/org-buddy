'use client';

import { programId, OrgBuddyIDL } from '@org-buddy/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { getBudgetPDA, getOrgPDA } from '@/utils/pdaUtils';
import { useState } from 'react';

export function useOrgBuddyProgram() {
  const [pdas, setPDAs] = useState({ orgPDA: null, budgetPDA: null });
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = new Program(OrgBuddyIDL, programId, provider);
  const wallet = useWallet();


  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const greet = useMutation({
    mutationKey: ['orgBuddy', 'greet', { cluster }],
    mutationFn: (keypair: Keypair) => program.methods.greet().rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });

  // Organization Functions
  async function fetchPDAs(payer) {
    const { orgPDA } = await getOrgPDA(payer, program);
    const { budgetPDA } = await getBudgetPDA(payer, program);
    setPDAs({ orgPDA, budgetPDA });
  }
  const createOrganization = useMutation({
    mutationKey: ['orgBuddy', 'createOrganization', { cluster }],
    mutationFn: ({ keypair, name }: { keypair: Keypair; name: string }) => program.methods.createOrganization(name).accounts({
      organization: pdas.orgPDA!,
      user: wallet.publicKey!,
    }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: () => toast.error('Failed to run program')
  })
  // const addMember = useMutation({
  //   mutationKey: ['orgBuddy', 'addMember', { cluster }],
  //   mutationFn: ({ keypair, memberPubKey }: { keypair: Keypair; memberPubKey: PublicKey }) => {
  //     if (!pdas.orgPDA || !pdas.budgetPDA) {
  //       throw new Error("PDAs not initialized");
  //     }
  //     program.methods.addMember(memberPubKey).accounts({ organization: pdas.orgPDA, member:  })
  //   },
  //   onSuccess: (signature) => {
  //     transactionToast(signature)
  //   },
  //   onError: () => toast.error('Failed to run program')
  // })
  // update_member_role
  // remove_member

  // // Finance Functions.
  // const update_budget
  // get_balance
  // create_payout
  // approve_payout
  // reject_payout
  // execute_payout


  return {
    program,
    programId,
    getProgramAccount,
    greet,
    createOrganization,
  };
}
