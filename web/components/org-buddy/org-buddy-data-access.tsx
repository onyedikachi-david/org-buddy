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

  // const greet = useMutation({
  //   mutationKey: ['orgBuddy', 'greet', { cluster }],
  //   mutationFn: (keypair: Keypair) => program.methods.greet().rpc(),
  //   onSuccess: (signature) => {
  //     transactionToast(signature);
  //   },
  //   onError: () => toast.error('Failed to run program'),
  // });



  return {
    program,
    programId,
    getProgramAccount,
    // greet,
    // createOrganization,
  };
}
