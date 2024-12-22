import { ParsedTransactionWithMeta, TokenBalance } from '@solana/web3.js';

// List of stablecoin mint addresses (SPL tokens)
const stablecoinMints = new Set([
	'Es9vMFrzaCERk8wUM7b9tUN1odcJZzAoBLW1bPqxf9ud', // USDT
	'4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC
]);

// Metric: Calculate transaction frequency
function calculateTransactionFrequency(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	if (transactions.length === 0) return 0;

	// Sort transactions by timestamp to determine the time window
	const sortedTransactions = transactions
		.filter((tx) => tx?.blockTime)
		.sort((a, b) => a!.blockTime! - b!.blockTime!);

	// Calculate the time difference between the first and last transaction
	const firstTxTime = sortedTransactions[0]!.blockTime!;
	const lastTxTime =
		sortedTransactions[sortedTransactions.length - 1]!.blockTime!;
	const timeWindowInDays = (lastTxTime - firstTxTime) / (60 * 60 * 24); // Total transaction on total day

	// Calculate the transaction frequency (transactions per day)
	const transactionFrequency = transactions.length / timeWindowInDays;

	// Normalize the frequency (optional, for scoring purposes)
	const maxFrequency = 100; // Define maximum frequency for normalization (e.g., max frequency a trader could have)
	return Math.min(transactionFrequency / maxFrequency, 1); // Normalize between 0 and 1
}

// Metric: Calculate volume traded in SOL (simple calculation)
function calculateVolume(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	let totalVolume = 0;
	transactions.forEach((tx) => {
		if (tx && tx.meta) {
			const solChange =
				(tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9; // Convert lamports to SOL
			totalVolume += Math.abs(solChange);
		}
	});
	return totalVolume; // Normalize this value later
}

// Metric: Estimate profitability (simplified PnL calculation)
function calculateProfitability(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	let profit = 0;
	transactions.forEach((tx) => {
		// Analyze token movements to infer profitability (placeholder logic)
		if (tx && tx.meta) {
			const solChange =
				(tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9;
			profit += solChange; // Example logic: Positive change as profit
		}
	});
	return profit; // Normalize this value later
}

// Metric: Calculate DEX interaction diversity
function calculateDexDiversity(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	const dexPrograms = new Set<string>();

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
function calculateStablecoinVolume(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	let stablecoinVolume = 0;

	transactions.forEach((tx) => {
		// Check if tx and tx.meta are not null
		if (tx && tx.meta) {
			tx.meta.preTokenBalances?.forEach(
				(preBalance: TokenBalance, index: number) => {
					const postBalance = tx.meta?.postTokenBalances?.[index];
					if (
						postBalance &&
						stablecoinMints.has(preBalance.mint) &&
						preBalance.owner === postBalance.owner
					) {
						// Calculate the token change (convert to decimal)
						const tokenChange =
							(parseInt(postBalance.uiTokenAmount.amount, 10) -
								parseInt(preBalance.uiTokenAmount.amount, 10)) /
							10 ** postBalance.uiTokenAmount.decimals;

						stablecoinVolume += Math.abs(tokenChange);
					}
				},
			);
		}
	});

	return stablecoinVolume; // Normalize this value later
}

// Metric: Avoidance of risky contracts
function calculateRiskyContractScore(
	transactions: (ParsedTransactionWithMeta | null)[],
): number {
	const flaggedContracts = new Set([
		'FlaggedProgramId1',
		'FlaggedProgramId2', //TODO: Add actual flagged program IDs
	]);

	let flaggedContractInteractions: number = 0;

	for (const tx of transactions) {
		if (tx && tx.transaction && tx.transaction.message) {
			const instructions = tx.transaction.message.instructions;

			if (
				instructions.some(
					(ix): boolean =>
						'programId' in ix &&
						flaggedContracts.has(ix.programId.toString()),
				)
			) {
				flaggedContractInteractions++;
			}
		}
	}

	if (flaggedContractInteractions > 10) return 0;
	return 1; // No flagged contracts
}

// Helper: Calculate the overall score of a wallet
function calculateScore(metrics: {
	frequency: number;
	volume: number;
	profitability: number;
	dexDiversity: number;
	stablecoinActivity: number;
	riskyContracts: number;
}): number {
	const weights = {
		frequency: 0.1,
		volume: 0.2,
		profitability: 0.3,
		dexDiversity: 0.1,
		stablecoinActivity: 0.1,
		riskyContracts: 0.2,
	};
	return (
		metrics.frequency * weights.frequency +
		metrics.volume * weights.volume +
		metrics.profitability * weights.profitability +
		metrics.dexDiversity * weights.dexDiversity +
		metrics.stablecoinActivity * weights.stablecoinActivity +
		metrics.riskyContracts * weights.riskyContracts
	);
}

export {
	calculateDexDiversity,
	calculateProfitability,
	calculateRiskyContractScore,
	calculateScore,
	calculateStablecoinVolume,
	calculateTransactionFrequency,
	calculateVolume,
};
