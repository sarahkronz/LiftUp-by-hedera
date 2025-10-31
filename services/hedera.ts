import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    TokenCreateTransaction,
    TokenType,
    TokenId,
    TokenSupplyType,
    TransferTransaction,
    TokenAssociateTransaction,
    AccountBalanceQuery,
} from "@hashgraph/sdk";
import { HederaWallet } from "../types";

// --- Environment ---
const OPERATOR_ID = import.meta.env.VITE_HEDERA_OPERATOR_ID;
const OPERATOR_KEY = import.meta.env.VITE_HEDERA_OPERATOR_KEY;

const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);
client.setDefaultMaxTransactionFee(new Hbar(100));

export class HederaService {
    
    async createNewAccount(initialBalance: number = 10): Promise<HederaWallet> {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.publicKey;

        const tx = new AccountCreateTransaction()
            .setKey(publicKey)
            .setInitialBalance(new Hbar(initialBalance));
        
        const txResponse = await tx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        if (!receipt.accountId) {
            throw new Error("Account creation failed: no account ID in receipt.");
        }

        return {
            accountId: receipt.accountId.toString(),
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString(),
        };
    }

    async createProjectToken(
        creatorWallet: HederaWallet,
        tokenName: string,
        tokenSymbol: string
    ): Promise<{ tokenId: string; treasuryAccountId: string }> {
        const creatorAccountId = AccountId.fromString(creatorWallet.accountId);
        const creatorPrivateKey = PrivateKey.fromString(creatorWallet.privateKey);

        const userClient = Client.forTestnet().setOperator(creatorAccountId, creatorPrivateKey);

        const tx = new TokenCreateTransaction()
            .setTokenName(tokenName)
            .setTokenSymbol(tokenSymbol)
            .setTokenType(TokenType.FungibleCommon)
            .setDecimals(0)
            .setInitialSupply(1_000_000)
            .setTreasuryAccountId(creatorAccountId)
            .setSupplyType(TokenSupplyType.Infinite)
            .setAdminKey(creatorPrivateKey.publicKey)
            .setSupplyKey(creatorPrivateKey.publicKey)
            .freezeWith(userClient);

        const signTx = await tx.sign(creatorPrivateKey);
        const txResponse = await signTx.execute(userClient);
        const receipt = await txResponse.getReceipt(userClient);

        if (!receipt.tokenId) {
            throw new Error("Token creation failed: no token ID in receipt.");
        }

        return {
            tokenId: receipt.tokenId.toString(),
            treasuryAccountId: creatorAccountId.toString(),
        };
    }

    async associateToken(wallet: HederaWallet, tokenId: string): Promise<string> {
        const accountId = AccountId.fromString(wallet.accountId);
        const privateKey = PrivateKey.fromString(wallet.privateKey);

        const userClient = Client.forTestnet().setOperator(accountId, privateKey);

        const tx = await new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([tokenId])
            .freezeWith(userClient);

        const signTx = await tx.sign(privateKey);
        const txResponse = await signTx.execute(userClient);
        await txResponse.getReceipt(userClient);

        return txResponse.transactionId.toString();
    }

    async investInProject(investorWallet: HederaWallet, amount: number): Promise<string> {
        const investorAccountId = AccountId.fromString(investorWallet.accountId);
        const investorPrivateKey = PrivateKey.fromString(investorWallet.privateKey);

        const userClient = Client.forTestnet().setOperator(investorAccountId, investorPrivateKey);

        const tx = new TransferTransaction()
            .addHbarTransfer(investorAccountId, new Hbar(-amount))
            .addHbarTransfer(OPERATOR_ID, new Hbar(amount))
            .freezeWith(userClient);

        const signTx = await tx.sign(investorPrivateKey);
        const txResponse = await signTx.execute(userClient);
        await txResponse.getReceipt(userClient);

        return txResponse.transactionId.toString();
    }

    async releaseMilestoneFunds(creatorTreasuryAccountId: string, amount: number): Promise<string> {
        const tx = new TransferTransaction()
            .addHbarTransfer(OPERATOR_ID, new Hbar(-amount))
            .addHbarTransfer(AccountId.fromString(creatorTreasuryAccountId), new Hbar(amount))
            .setTransactionMemo("Milestone Payout");

        const txResponse = await tx.execute(client);
        await txResponse.getReceipt(client);

        return txResponse.transactionId.toString();
    }

    async investWithProjectToken(
        investorWallet: HederaWallet,
        treasuryAccountId: string,
        tokenId: string,
        amount: number
    ): Promise<string> {
        if (!tokenId || !treasuryAccountId) {
        throw new Error("Hedera Service Error: Token ID or Treasury Account ID is missing.");
    }
        const investorAccountId = AccountId.fromString(investorWallet.accountId);
        const investorPrivateKey = PrivateKey.fromString(investorWallet.privateKey);

        const userClient = Client.forTestnet().setOperator(investorAccountId, investorPrivateKey);

        const tx = new TransferTransaction()
            .addTokenTransfer(tokenId, investorAccountId, -amount)
            .addTokenTransfer(tokenId, AccountId.fromString(treasuryAccountId), amount)
            .freezeWith(userClient);

        const signTx = await tx.sign(investorPrivateKey);
        const txResponse = await signTx.execute(userClient);
        await txResponse.getReceipt(userClient);

        return txResponse.transactionId.toString();
    }

    async getAccountBalances(accountId: string): Promise<{ hbars: Hbar; tokens: Map<string, number> }> {
        const query = new AccountBalanceQuery().setAccountId(accountId);
        const accountBalance = await query.execute(client);

        const tokenMap = new Map<string, number>();
        if (accountBalance.tokens) {
            for (const [tokenId, balance] of accountBalance.tokens._map) {
                tokenMap.set(tokenId.toString(), balance.toNumber());
            }
        }

        return {
            hbars: accountBalance.hbars,
            tokens: tokenMap,
        };
    }
    async checkTokenAssociation(accountId: string, tokenId: string): Promise<boolean> {
    try {
        const query = new AccountBalanceQuery().setAccountId(accountId);
        const accountBalance = await query.execute(client);
        
        const tokenIdObject = AccountId.fromString(tokenId); 
    
        const tokenBalance = accountBalance.tokens.get(tokenIdObject);
        return tokenBalance !== undefined && tokenBalance !== null;
        
    } catch (e) {
        console.error("Error checking token association:", e);
        return false;
    }
}
}

export const hederaService = new HederaService();
