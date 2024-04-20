#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("78pb7tZ1xG5yimX9quKGpFTvpbTKCVZ2kQkBw39uoazR");

// make organization a pda
// use init_if_needed for organization pda and budget

// The current implementation wont allow having multiple budgets
// for an org, add a count or something to the seed or a budget name that will be
// passed from the instruction data. The second for now.

#[program]
pub mod finance_solana {
    use anchor_lang::system_program;

    use super::*;

    pub fn create_budget(ctx: Context<CreateBudget>, allocated_amount: u64) -> Result<()> {
        let budget = &mut ctx.accounts.budget;
        budget.owner = *ctx.accounts.user.key;
        budget.allocated_amount = allocated_amount;
        budget.spent_amount = 0;
        budget.remaining_amount = allocated_amount;
        budget.bump = ctx.bumps.budget;
        // Transfer Sol from user to PDA account.
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.budget.to_account_info(),
            },
        );
        let res = system_program::transfer(cpi_context, allocated_amount);
        if res.is_ok() {
            return Ok(());
        } else {
            return err!(MyError::TransferFailed);
        }
    }

    pub fn update_budget(ctx: Context<UpdateBudget>, new_amount: u64) -> Result<()> {
        let budget_info = ctx.accounts.budget.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        let budget = &mut ctx.accounts.budget;
        require!(*ctx.accounts.user.key == budget.owner, MyError::NotOwner);

        let amount_change = new_amount as i64 - budget.allocated_amount as i64;

        if amount_change != 0 {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: if amount_change > 0 {
                        user_info.clone()
                    } else {
                        budget_info.clone()
                    },
                    to: if amount_change > 0 {
                        budget_info.clone()
                    } else {
                        user_info
                    },
                },
            );
            let transfer_amount = amount_change.abs() as u64;
            let res = system_program::transfer(cpi_context, transfer_amount);
            require!(res.is_ok(), MyError::TransferFailed);
        }

        budget.allocated_amount = new_amount;
        budget.remaining_amount = (budget.remaining_amount as i64 + amount_change) as u64;

        emit!(BudgetUpdated {
            owner: budget.owner,
            allocated_amount: budget.allocated_amount,
            remaining_amount: budget.remaining_amount,
        });

        Ok(())
    }

    pub fn get_balance(ctx: Context<GetBalance>) -> Result<()> {
        let budget = &ctx.accounts.budget;
        msg!("The remaining balance is: {}", budget.remaining_amount);
        Ok(())
    }

    // share = total_revenue / number_of_recipients
    // share = 1,000,000 / 5
    // share = 200,000
    pub fn create_payout(ctx: Context<CreatePayout>, share: u64) -> Result<()> {
        let payout = &mut ctx.accounts.payout;
        let budget = &ctx.accounts.budget;

        // Ensure the budget has enough funds to cover the payout
        require!(budget.remaining_amount >= share, MyError::InsufficientFunds);

        // Collect recipient addresses from remaining_accounts
        let recipients: Vec<Pubkey> = ctx.remaining_accounts.iter().map(|a| a.key()).collect();

        // Save recipient addresses and share to the Payout PDA
        payout.recipient = recipients;
        payout.amount = share;
        payout.status = PayoutStatus::Pending;

        // No funds are transferred here; just setup the payout details
        Ok(())
    }

    pub fn approve_payout(ctx: Context<ApprovePayout>) -> Result<()> {
        let payout = &mut ctx.accounts.payout;

        require!(
            ctx.accounts.user.key() == ctx.accounts.org.key(),
            MyError::Unauthorized
        );
        require!(
            payout.status == PayoutStatus::Pending,
            MyError::InvalidPayoutStatus
        );

        payout.status = PayoutStatus::Approved;

        Ok(())
    }

    pub fn reject_payout(ctx: Context<RejectPayout>) -> Result<()> {
        let payout = &mut ctx.accounts.payout;
        require!(
            ctx.accounts.user.key() == ctx.accounts.org.key(),
            MyError::Unauthorized
        );
        require!(
            payout.status == PayoutStatus::Pending,
            MyError::InvalidPayoutStatus
        );

        payout.status = PayoutStatus::Cancelled;
        Ok(())
    }

    pub fn execute_payout<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, ExecutePayout<'info>>,
    ) -> Result<()> {
        let payout = &mut ctx.accounts.payout;
        let budget = &mut ctx.accounts.budget;
        let org_admin = &ctx.accounts.org.key();
        let user = &ctx.accounts.user.key();

        let system_program = &ctx.accounts.system_program;

        // Ensure that the executor is authorized to execute payouts
        // This might involve checking if the executor is an admin or the budget owner, etc.
        require!(user == org_admin, MyError::Unauthorized);

        // Check if the payout is approved
        require!(
            payout.status == PayoutStatus::Approved,
            MyError::InvalidPayoutStatus
        );

        // Ensure the budget has enough funds to cover the payout
        require!(
            budget.remaining_amount >= payout.amount * payout.recipient.len() as u64,
            MyError::InsufficientFunds
        );

        // Transfer funds from the Budget PDA to each recipient
        for recipient_key in &payout.recipient {
            let recipient_info = ctx
                .remaining_accounts
                .iter()
                .find(|a| a.key() == *recipient_key)
                .unwrap()
                .to_account_info();
            let cpi_context = CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: budget.to_account_info(),
                    to: recipient_info,
                },
            );
            system_program::transfer(cpi_context, payout.amount)?;
        }

        // Update the budget's remaining amount
        budget.remaining_amount = budget
            .remaining_amount
            .checked_sub(payout.amount * payout.recipient.len() as u64)
            .ok_or(MyError::MathError)?;

        // Update the payout status to Completed
        payout.status = PayoutStatus::Completed;

        Ok(())
    }

    // pub fn get_pending_payouts(ctx: Context<GetPendingPayouts>) -> Result<()> {
    //     todo!()
    // }

    pub fn create_organization(ctx: Context<CreateOrganization>, name: String) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        let creator = &ctx.accounts.user;

        organization.owner = *creator.key;
        organization.name = name;
        organization.members = vec![];

        emit!(OrganizationCreated {
            owner: organization.owner,
            name: organization.name.clone(),
        });

        Ok(())
    }

    pub fn add_member(ctx: Context<AddMember>, member_pubkey: Pubkey) -> Result<()> {
        let organization = &mut ctx.accounts.organization;
        let user = &ctx.accounts.user;

        // Ensure that the user is authorized to add members, typically the organization owner
        require!(organization.owner == *user.key, MyError::Unauthorized);

        // Optionally, check for duplicate members or other business rules
        if organization
            .members
            .iter()
            .any(|m| m.pubkey == member_pubkey)
        {
            return err!(MyError::MemberAlreadyExists);
        }

        // Add the new member to the organization
        organization.members.push(Member {
            pubkey: member_pubkey,
            role: Role::Member, // Assuming a default role; adjust as necessary
        });

        // Optionally, emit an event here to log the addition of a new member
        emit!(MemberAdded {
            organization: organization.key(),
            member: member_pubkey,
        });

        Ok(())
    }

    pub fn update_member_role(
        ctx: Context<UpdateMemberRole>,
        member: Pubkey,
        role: Role,
    ) -> Result<()> {
        todo!()
    }

    pub fn remove_member(ctx: Context<RemoveMember>, member: Pubkey) -> Result<()> {
        todo!()
    }
}
//size_of::
#[derive(Accounts)]
pub struct CreateBudget<'info> {
    #[account(init_if_needed, payer = user, space = 32 + 8 + 8 + 8 + 8, seeds = [b"budget", org.owner.key().as_ref()], bump)]
    pub budget: Account<'info, Budget>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    pub system_program: Program<'info, System>,
}

//#[account(mut, seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)]
// pub user_stats: Account<'info, UserStats>,
#[derive(Accounts)]
pub struct UpdateBudget<'info> {
    #[account(mut, seeds = [b"budget", org.owner.key().as_ref()], bump)]
    pub budget: Account<'info, Budget>,
    pub user: Signer<'info>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account(seeds = [b"budget", org.owner.key().as_ref()], bump)]
    pub budget: Account<'info, Budget>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct AllocateFunds<'info> {
//     #[account(mut, seeds = [b"budget", org.owner.key().as_ref()], bump)]
//     pub budget: Account<'info, Budget>,
//     pub user: Signer<'info>,
//     #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
//     pub org: Account<'info, Organization>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
pub struct CreatePayout<'info> {
    #[account(init_if_needed, payer = user, space = 32 * 10 + 8, seeds = [b"payout", org.owner.key().as_ref()], bump)]
    pub payout: Account<'info, Payout>,
    #[account(mut, seeds = [b"budget", org.owner.key().as_ref()], bump)]
    pub budget: Account<'info, Budget>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct CreatePayout<'info> {
//     #[account(mut, seeds = [b"budget", org.owner.key().as_ref()], bump)]
//     pub budget: Account<'info, Budget>,

//     #[account(mut, seeds = [b"payout", org.owner.key().as_ref()], bump)]
//     pub payout: Payout,
//     #[account(init_if_needed, space = size_of::<Payout>() + 8, payer = user, seeds = [b"organization", org.owner.key().as_ref()], bump)]
//     pub org: Account<'info, Organization>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
pub struct ApprovePayout<'info> {
    #[account(mut,seeds = [b"payout", org.owner.key().as_ref()], bump)]
    pub payout: Account<'info, Payout>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RejectPayout<'info> {
    #[account(mut,seeds = [b"payout", org.owner.key().as_ref()], bump)]
    pub payout: Account<'info, Payout>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecutePayout<'info> {
    #[account(mut, seeds = [b"payout", org.owner.key().as_ref()], bump)]
    pub payout: Account<'info, Payout>,
    #[account(mut, seeds = [b"budget", org.owner.key().as_ref()], bump)]
    pub budget: Account<'info, Budget>,
    #[account(seeds = [b"organization", org.owner.key().as_ref()], bump)]
    pub org: Account<'info, Organization>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(mut, seeds = [b"organization", organization.owner.key().as_ref()], bump)]
    pub organization: Account<'info, Organization>,
    #[account(mut, seeds = [b"member", organization.name.as_bytes()], bump)]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMemberRole<'info> {
    #[account(mut, seeds = [b"organization", organization.owner.key().as_ref()], bump)]
    pub organization: Account<'info, Organization>,
    #[account(mut,seeds = [b"member", organization.name.as_bytes()], bump)]
    pub member: Account<'info, Member>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveMember<'info> {
    #[account(mut, seeds = [b"organization", organization.owner.key().as_ref()], bump)]
    pub organization: Account<'info, Organization>,
    #[account(mut, seeds = [b"member", organization.name.as_bytes()], bump)]
    pub member: Account<'info, Member>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateOrganization<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + name.len(), seeds = [b"organization", user.key().as_ref()], bump)]
    pub organization: Account<'info, Organization>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init, payer = user, space = 8 + 32 + 8, seeds = [b"member", name.as_bytes()], bump)]
    pub member: Account<'info, Member>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum MyError {
    #[msg("The budget account already exists.")]
    BudgetAlreadyExists,
    #[msg("You are are not the owner of the PDA account")]
    NotOwner,
    #[msg("The transfer failed")]
    TransferFailed,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Not authorized to perform this operation")]
    Unauthorized,
    #[msg("Invalid payout status")]
    InvalidPayoutStatus,
    #[msg["A math error occurred"]]
    MathError,
    #[msg("Pubkey already exist as member.")]
    MemberAlreadyExists,
}

#[event]
pub struct BudgetUpdated {
    owner: Pubkey,
    allocated_amount: u64,
    remaining_amount: u64,
}

#[event]
pub struct OrganizationCreated {
    owner: Pubkey,
    name: String,
}

#[event]
pub struct MemberAdded {
    organization: Pubkey,
    member: Pubkey,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Role {
    // Define roles
    Admin,
    Member,
}

#[account]
#[derive(InitSpace)]
pub struct Budget {
    pub owner: Pubkey,
    pub allocated_amount: u64,
    pub spent_amount: u64,
    pub remaining_amount: u64,
    pub bump: u8,
}

#[account]
pub struct Member {
    pub pubkey: Pubkey,
    pub role: Role,
}

#[account]
pub struct Organization {
    pub owner: Pubkey,
    pub name: String,
    pub members: Vec<Member>,
}

#[account]
pub struct Payout {
    pub recipient: Vec<Pubkey>,
    pub amount: u64,
    pub status: PayoutStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PayoutStatus {
    Pending,
    Completed,
    Cancelled,
    Approved,
}
