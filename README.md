# Finance Solana

Finance Solana is a Solana blockchain-based program designed to manage organizational finances, including budgeting, fund allocation, and payouts. It leverages the power of the Solana network to provide a decentralized solution for organizations to handle their financial operations securely and efficiently.

## Features

- **Budget Management**: Create and update budgets, track spending, and monitor remaining funds.
- **Fund Allocation**: Allocate funds to specific needs or projects within an organization.
- **Payout Management**: Manage payouts to members or external parties, including creation, approval, execution, and rejection of payouts.
- **Organization and Member Management**: Create organizations, add and remove members, and update member roles.

## Accounts

The program utilizes several account types to store essential data:

- **Budget**: Holds details such as the allocated amount, spent amount, and remaining amount.
- **Organization**: Contains organizational data including the owner and members.
- **Member**: Records member-specific information such as their public key and role.
- **Payout**: Keeps track of payout details like the recipient, amount, and status.

## Instructions

Finance Solana provides the following callable instructions:

- **create_budget**: Initializes a new budget account for an organization.
- **update_budget**: Modifies the allocated amount in a budget.
- **get_balance**: Retrieves the current balance from a budget.
- **allocate_funds**: Dedicates funds from a budget for specific purposes.
- **create_payout**: Initiates a new payout to a specified recipient.
- **approve_payout**: Confirms a pending payout request.
- **reject_payout**: Declines a pending payout request.
- **execute_payout**: Completes an approved payout, transferring the designated funds.
- **get_pending_payouts**: Lists all pending payout requests associated with a budget.
- **create_organization**: Establishes a new organization and sets up its members.
- **add_member**: Enrolls a new member into an organization.
- **update_member_role**: Alters the role of an existing member.
- **remove_member**: Excludes a member from an organization.

## Events

The program emits specific events to signal state changes:

- **BudgetUpdated**: Triggered when a budget is updated.
- **PayoutCreated**: Occurs when a new payout is initiated.
- **PayoutApproved**: Fired when a payout is approved.
- **PayoutRejected**: Emitted upon the rejection of a payout.
- **PayoutExecuted**: Announced when a payout is successfully executed.
- **MemberAdded**: Indicated when a new member is added to an organization.
- **MemberRemoved**: Notified when a member is removed from an organization.

## Error Handling

Errors are managed through an `ErrorCode` enum, which includes:

- **BudgetAlreadyExists**: Returned when an attempt is made to create a budget that already exists.

## Contributing

Contributions to enhance or expand the functionalities of Finance Solana are welcome. Please fork the repository, make your changes, and submit a pull request. Ensure that your contributions adhere to the existing coding standards and include appropriate tests.

## License

Finance Solana is open-sourced under the MIT License. For more details, see the LICENSE file in the repository.

## Installation

To use Finance Solana, you need to have the Anchor framework and Solana CLI installed on your machine. Follow the instructions from the [official Solana documentation](https://docs.solana.com/cli/install-solana-cli-tools) and the [Anchor framework setup guide](https://project-serum.github.io/anchor/getting-started/installation.html) to set up your development environment.

### Clone the Repository

git clone <https://github.com/your-repository/finance-solana.git>
cd finance-solana
