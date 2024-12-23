"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize_value = normalize_value;
exports.fetch_tx = fetch_tx;
exports.calc_tx_freq = calc_tx_freq;
exports.calc_vol = calc_vol;
exports.calc_profitability = calc_profitability;
exports.calc_dex_diversity = calc_dex_diversity;
exports.calc_stabel_token_vol = calc_stabel_token_vol;
exports.calc_risky_contract = calc_risky_contract;
exports.calc_final_score = calc_final_score;
// Helper: Normalize a value between 0 and 1
function normalize_value(value, max) {
    return Math.min(value / max, 1);
}
// Helper: Fetch transactions for a wallet
function fetch_tx(agent, walletAddress, amountOfTx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the transaction signatures
            const signatures = yield agent.connection.getSignaturesForAddress(walletAddress, {
                limit: amountOfTx !== null && amountOfTx !== void 0 ? amountOfTx : 10,
            });
            if (signatures.length === 0) {
                console.log('No transactions found for this wallet.');
                return [];
            }
            const signatureAddresses = signatures.map((signature) => signature.signature);
            const transactions = [];
            for (const signature of signatureAddresses) {
                const tx = yield agent.connection.getParsedTransaction(signature, {
                    maxSupportedTransactionVersion: 0,
                });
                transactions.push(tx);
            }
            agent.transactions = transactions;
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Failed to fetch transactions');
        }
    });
}
// List of stablecoin mint addresses (SPL tokens)
const stablecoinMints = new Set([
    'Es9vMFrzaCERk8wUM7b9tUN1odcJZzAoBLW1bPqxf9ud', // USDT
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC
]);
// Metric: Calculate transaction frequency
function calc_tx_freq(agent) {
    const transactions = agent.transactions;
    if (transactions.length === 0)
        return 0;
    // Sort transactions by timestamp to determine the time window
    const sortedTransactions = transactions
        .filter((tx) => tx === null || tx === void 0 ? void 0 : tx.blockTime)
        .sort((a, b) => a.blockTime - b.blockTime);
    // Calculate the time difference between the first and last transaction
    const firstTxTime = sortedTransactions[0].blockTime;
    const lastTxTime = sortedTransactions[sortedTransactions.length - 1].blockTime;
    const timeWindowInDays = (lastTxTime - firstTxTime) / (60 * 60 * 24); // Total transaction on total day
    // Calculate the transaction frequency (transactions per day)
    const transactionFrequency = transactions.length / timeWindowInDays;
    // Normalize the frequency (optional, for scoring purposes)
    const maxFrequency = 100; // Define maximum frequency for normalization (e.g., max frequency a trader could have)
    return Math.min(transactionFrequency / maxFrequency, 1); // Normalize between 0 and 1
}
// Metric: Calculate volume traded in SOL (simple calculation)
function calc_vol(agent) {
    const transactions = agent.transactions;
    if (transactions.length === 0)
        return 0;
    let totalVolume = 0;
    transactions.forEach((tx) => {
        if (tx && tx.meta) {
            const solChange = (tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9; // Convert lamports to SOL
            totalVolume += Math.abs(solChange);
        }
    });
    return totalVolume; // Normalize this value later
}
// Metric: Estimate profitability (simplified PnL calculation)
function calc_profitability(agent) {
    const transactions = agent.transactions;
    if (transactions.length === 0)
        return 0;
    let profit = 0;
    transactions.forEach((tx) => {
        // Analyze token movements to infer profitability (placeholder logic)
        if (tx && tx.meta) {
            const solChange = (tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9;
            profit += solChange; // Example logic: Positive change as profit
        }
    });
    return profit; // Normalize this value later
}
// Metric: Calculate DEX interaction diversity
function calc_dex_diversity(agent) {
    const transactions = agent.transactions;
    if (transactions.length === 0)
        return 0;
    const dexPrograms = new Set();
    transactions.forEach((tx) => {
        if (tx && tx.transaction && tx.transaction.message) {
            const instructions = tx.transaction.message.instructions;
            instructions.forEach((ix) => {
                // Type guard for PartiallyDecodedInstruction
                if ('programId' in ix) {
                    //TODO: Add the programId to the set to track unique DEX programs
                    dexPrograms.add(ix.programId.toString());
                }
            });
        }
    });
    return dexPrograms.size; // Return the number of unique DEX programs
}
// Metric: Calculate stablecoin volume
function calc_stabel_token_vol(agent) {
    const transactions = agent.transactions;
    if (transactions.length === 0)
        return 0;
    let stablecoinVolume = 0;
    transactions.forEach((tx) => {
        var _a;
        // Check if tx and tx.meta are not null
        if (tx && tx.meta) {
            (_a = tx.meta.preTokenBalances) === null || _a === void 0 ? void 0 : _a.forEach((preBalance, index) => {
                var _a, _b;
                const postBalance = (_b = (_a = tx.meta) === null || _a === void 0 ? void 0 : _a.postTokenBalances) === null || _b === void 0 ? void 0 : _b[index];
                if (postBalance &&
                    stablecoinMints.has(preBalance.mint) &&
                    preBalance.owner === postBalance.owner) {
                    // Calculate the token change (convert to decimal)
                    const tokenChange = (parseInt(postBalance.uiTokenAmount.amount, 10) -
                        parseInt(preBalance.uiTokenAmount.amount, 10)) /
                        10 ** postBalance.uiTokenAmount.decimals;
                    stablecoinVolume += Math.abs(tokenChange);
                }
            });
        }
    });
    return stablecoinVolume; // Normalize this value later
}
// Metric: Avoidance of risky contracts
function calc_risky_contract(agent) {
    const transactions = agent.transactions;
    const flaggedContracts = new Set([
        'FlaggedProgramId1',
        'FlaggedProgramId2', //TODO: Add actual flagged program IDs
    ]);
    let flaggedContractInteractions = 0;
    for (const tx of transactions) {
        if (tx && tx.transaction && tx.transaction.message) {
            const instructions = tx.transaction.message.instructions;
            if (instructions.some((ix) => 'programId' in ix &&
                flaggedContracts.has(ix.programId.toString()))) {
                flaggedContractInteractions++;
            }
        }
    }
    if (flaggedContractInteractions > 10)
        return 0;
    return 1; // No flagged contracts
}
// Helper: Calculate the overall score of a wallet
function calc_final_score(agent) {
    const weights = {
        frequency: 0.1,
        volume: 0.2,
        profitability: 0.3,
        dexDiversity: 0.1,
        stablecoinActivity: 0.1,
        riskyContracts: 0.2,
    };
    const frequency = normalize_value(agent.calcTxFreq(), 100);
    const volume = normalize_value(agent.calcVol(), 1000);
    const profitability = normalize_value(agent.calcProfitability(), 100);
    const dexDiversity = normalize_value(agent.calcDexDiversity(), 10);
    const stablecoinActivity = normalize_value(agent.calcStableTokenVol(), 1000);
    const riskyContracts = agent.calcRiskContract();
    return (frequency * weights.frequency +
        volume * weights.volume +
        profitability * weights.profitability +
        dexDiversity * weights.dexDiversity +
        stablecoinActivity * weights.stablecoinActivity +
        riskyContracts * weights.riskyContracts);
}
