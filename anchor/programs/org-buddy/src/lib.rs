use anchor_lang::prelude::*;

declare_id!("78pb7tZ1xG5yimX9quKGpFTvpbTKCVZ2kQkBw39uoazR");

#[program]
pub mod org_buddy {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
