export type OrgBuddy = {
  version: '0.1.0';
  name: 'finance_solana';
  instructions: [
    {
      name: 'createBudget';
      accounts: [
        { name: 'budget'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'allocatedAmount'; type: 'u64' }];
    },
    {
      name: 'updateBudget';
      accounts: [
        { name: 'budget'; isMut: true; isSigner: false },
        { name: 'user'; isMut: false; isSigner: true },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'newAmount'; type: 'u64' }];
    },
    {
      name: 'getBalance';
      accounts: [
        { name: 'budget'; isMut: false; isSigner: false },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: 'createPayout';
      accounts: [
        { name: 'payout'; isMut: true; isSigner: false },
        { name: 'budget'; isMut: true; isSigner: false },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'share'; type: 'u64' }];
    },
    {
      name: 'approvePayout';
      accounts: [
        { name: 'payout'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: 'rejectPayout';
      accounts: [
        { name: 'payout'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: 'executePayout';
      accounts: [
        { name: 'payout'; isMut: true; isSigner: false },
        { name: 'budget'; isMut: true; isSigner: false },
        { name: 'org'; isMut: false; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: 'createOrganization';
      accounts: [
        { name: 'organization'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'name'; type: 'string' }];
    },
    {
      name: 'addMember';
      accounts: [
        { name: 'organization'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'memberPubkey'; type: 'publicKey' }];
    },
    {
      name: 'updateMemberRole';
      accounts: [
        { name: 'organization'; isMut: true; isSigner: false },
        { name: 'user'; isMut: false; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false }
      ];
      args: [{ name: 'member'; type: 'publicKey' }];
    },
    {
      name: 'removeMember';
      accounts: [
        { name: 'organization'; isMut: true; isSigner: false },
        { name: 'user'; isMut: false; isSigner: true }
      ];
      args: [{ name: 'member'; type: 'publicKey' }];
    }
  ];
  accounts: [
    {
      name: 'Budget';
      type: {
        kind: 'struct';
        fields: [
          { name: 'owner'; type: 'publicKey' },
          { name: 'allocatedAmount'; type: 'u64' },
          { name: 'spentAmount'; type: 'u64' },
          { name: 'remainingAmount'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ];
      };
    },
    {
      name: 'Organization';
      type: {
        kind: 'struct';
        fields: [
          { name: 'owner'; type: 'publicKey' },
          { name: 'name'; type: 'string' },
          { name: 'members'; type: { vec: 'publicKey' } }
        ];
      };
    },
    {
      name: 'Payout';
      type: {
        kind: 'struct';
        fields: [
          { name: 'recipient'; type: { vec: 'publicKey' } },
          { name: 'amount'; type: 'u64' },
          { name: 'status'; type: { defined: 'PayoutStatus' } }
        ];
      };
    }
  ];
  types: [
    {
      name: 'PayoutStatus';
      type: {
        kind: 'enum';
        variants: [
          { name: 'Pending' },
          { name: 'Completed' },
          { name: 'Cancelled' },
          { name: 'Approved' }
        ];
      };
    }
  ];
  events: [
    {
      name: 'BudgetUpdated';
      fields: [
        { name: 'owner'; type: 'publicKey'; index: false },
        { name: 'allocatedAmount'; type: 'u64'; index: false },
        { name: 'remainingAmount'; type: 'u64'; index: false }
      ];
    },
    {
      name: 'OrganizationCreated';
      fields: [
        { name: 'owner'; type: 'publicKey'; index: false },
        { name: 'name'; type: 'string'; index: false }
      ];
    },
    {
      name: 'MemberAdded';
      fields: [
        { name: 'organization'; type: 'publicKey'; index: false },
        { name: 'member'; type: 'publicKey'; index: false }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'BudgetAlreadyExists';
      msg: 'The budget account already exists.';
    },
    {
      code: 6001;
      name: 'NotOwner';
      msg: 'You are are not the owner of the PDA account';
    },
    { code: 6002; name: 'TransferFailed'; msg: 'The transfer failed' },
    { code: 6003; name: 'InsufficientFunds'; msg: 'Insufficient funds' },
    {
      code: 6004;
      name: 'Unauthorized';
      msg: 'Not authorized to perform this operation';
    },
    { code: 6005; name: 'InvalidPayoutStatus'; msg: 'Invalid payout status' },
    { code: 6006; name: 'MathError'; msg: 'A math error occurred' },
    {
      code: 6007;
      name: 'MemberAlreadyExists';
      msg: 'Pubkey already exist as member.';
    }
  ];
};

export const IDL: OrgBuddy = {
  version: '0.1.0',
  name: 'finance_solana',
  instructions: [
    {
      name: 'createBudget',
      accounts: [
        { name: 'budget', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'allocatedAmount', type: 'u64' }],
    },
    {
      name: 'updateBudget',
      accounts: [
        { name: 'budget', isMut: true, isSigner: false },
        { name: 'user', isMut: false, isSigner: true },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'newAmount', type: 'u64' }],
    },
    {
      name: 'getBalance',
      accounts: [
        { name: 'budget', isMut: false, isSigner: false },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'createPayout',
      accounts: [
        { name: 'payout', isMut: true, isSigner: false },
        { name: 'budget', isMut: true, isSigner: false },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'share', type: 'u64' }],
    },
    {
      name: 'approvePayout',
      accounts: [
        { name: 'payout', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'rejectPayout',
      accounts: [
        { name: 'payout', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'executePayout',
      accounts: [
        { name: 'payout', isMut: true, isSigner: false },
        { name: 'budget', isMut: true, isSigner: false },
        { name: 'org', isMut: false, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'createOrganization',
      accounts: [
        { name: 'organization', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'name', type: 'string' }],
    },
    {
      name: 'addMember',
      accounts: [
        { name: 'organization', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'memberPubkey', type: 'publicKey' }],
    },
    {
      name: 'updateMemberRole',
      accounts: [
        { name: 'organization', isMut: true, isSigner: false },
        { name: 'user', isMut: false, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'member', type: 'publicKey' }],
    },
    {
      name: 'removeMember',
      accounts: [
        { name: 'organization', isMut: true, isSigner: false },
        { name: 'user', isMut: false, isSigner: true },
      ],
      args: [{ name: 'member', type: 'publicKey' }],
    },
  ],
  accounts: [
    {
      name: 'Budget',
      type: {
        kind: 'struct',
        fields: [
          { name: 'owner', type: 'publicKey' },
          { name: 'allocatedAmount', type: 'u64' },
          { name: 'spentAmount', type: 'u64' },
          { name: 'remainingAmount', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Organization',
      type: {
        kind: 'struct',
        fields: [
          { name: 'owner', type: 'publicKey' },
          { name: 'name', type: 'string' },
          { name: 'members', type: { vec: 'publicKey' } },
        ],
      },
    },
    {
      name: 'Payout',
      type: {
        kind: 'struct',
        fields: [
          { name: 'recipient', type: { vec: 'publicKey' } },
          { name: 'amount', type: 'u64' },
          { name: 'status', type: { defined: 'PayoutStatus' } },
        ],
      },
    },
  ],
  types: [
    {
      name: 'PayoutStatus',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Pending' },
          { name: 'Completed' },
          { name: 'Cancelled' },
          { name: 'Approved' },
        ],
      },
    },
  ],
  events: [
    {
      name: 'BudgetUpdated',
      fields: [
        { name: 'owner', type: 'publicKey', index: false },
        { name: 'allocatedAmount', type: 'u64', index: false },
        { name: 'remainingAmount', type: 'u64', index: false },
      ],
    },
    {
      name: 'OrganizationCreated',
      fields: [
        { name: 'owner', type: 'publicKey', index: false },
        { name: 'name', type: 'string', index: false },
      ],
    },
    {
      name: 'MemberAdded',
      fields: [
        { name: 'organization', type: 'publicKey', index: false },
        { name: 'member', type: 'publicKey', index: false },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'BudgetAlreadyExists',
      msg: 'The budget account already exists.',
    },
    {
      code: 6001,
      name: 'NotOwner',
      msg: 'You are are not the owner of the PDA account',
    },
    { code: 6002, name: 'TransferFailed', msg: 'The transfer failed' },
    { code: 6003, name: 'InsufficientFunds', msg: 'Insufficient funds' },
    {
      code: 6004,
      name: 'Unauthorized',
      msg: 'Not authorized to perform this operation',
    },
    { code: 6005, name: 'InvalidPayoutStatus', msg: 'Invalid payout status' },
    { code: 6006, name: 'MathError', msg: 'A math error occurred' },
    {
      code: 6007,
      name: 'MemberAlreadyExists',
      msg: 'Pubkey already exist as member.',
    },
  ],
};
