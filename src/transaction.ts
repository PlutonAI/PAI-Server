import {
	Connection,
	ParsedTransactionWithMeta,
	PublicKey,
} from '@solana/web3.js';
import {
	calculateDexDiversity,
	calculateProfitability,
	calculateRiskyContractScore,
	calculateScore,
	calculateStablecoinVolume,
	calculateTransactionFrequency,
	calculateVolume,
} from './utils/helper';
import { Tool } from '@langchain/core/tools';

// Solana cluster URL
const solanaRPCUrl = process.env.SOLANA_RPC_URL!;
const connection = new Connection(solanaRPCUrl, 'confirmed');

// Helper: Normalize a value between 0 and 1
function normalize(value: number, max: number): number {
	return Math.min(value / max, 1);
}

// Helper: Fetch transactions for a wallet
async function fetchTransactions(walletAddress: string) {
	try {
		const publicKey = new PublicKey(walletAddress);

		// Fetch the transaction signatures
		const signatures = await connection.getSignaturesForAddress(publicKey, {
			limit: 10, // Adjust as needed
		});

		if (signatures.length === 0) {
			console.log('No transactions found for this wallet.');
			return [];
		}

		const signatureAddresses: string[] = signatures.map(
			(signature) => signature.signature,
		);

		const transactions: (ParsedTransactionWithMeta | null)[] = [];
		for (const signature of signatureAddresses) {
			const tx = await connection.getParsedTransaction(signature, {
				maxSupportedTransactionVersion: 0,
			});
			transactions.push(tx);
		}
		return transactions;
	} catch (error) {
		console.error('Error fetching transactions:', error);
		throw new Error('Failed to fetch transactions');
	}
}

export class WalletScoringTool extends Tool {
	name: string = 'wallet_scoring';
	description: string =
		'Calculate performance score of wallet on Solana using transaction onchain data';
	protected async _call(input: string): Promise<string> {
		try {
			// Fetch transactions
			const transactions: (ParsedTransactionWithMeta | null)[] =
				await fetchTransactions(input);
			if (!transactions || transactions.length === 0)
				return 'No transactions to score.';

			// Calculate metrics
			const metrics = {
				frequency: normalize(
					calculateTransactionFrequency(transactions),
					100,
				),
				volume: normalize(calculateVolume(transactions), 1000),
				profitability: normalize(
					calculateProfitability(transactions),
					100,
				),
				dexDiversity: normalize(
					calculateDexDiversity(transactions),
					10,
				),
				stablecoinActivity: normalize(
					calculateStablecoinVolume(transactions),
					1000,
				),
				riskyContracts: calculateRiskyContractScore(transactions),
			};

			// Calculate final score
			const finalScore = calculateScore(metrics);
			console.log(`Wallet Score for ${input}:`, finalScore);
			return String(finalScore);
		} catch (error) {
			console.error('Failed to calculate wallet score:', error);
			throw new Error('Failed to calculate wallet score');
		}
	}
}
