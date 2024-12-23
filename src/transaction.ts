import { Tool } from '@langchain/core/tools';
import { ScoringWalletKit } from './scoringWallet';
import { PublicKey } from '@solana/web3.js';

class FetchTx extends Tool {
	name: string = 'fetch_transactions';
	description: string = `Fetch transactions for a wallet on Solana blockchain.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000,`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);

			return JSON.stringify({
				status: 'success',
				message: `Fetched transactions for wallet: ${parsedInput.walletAdress}`,
			});
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
			throw new Error('Failed to fetch transactions');
		}
	}
}

class CalcTxFreq extends Tool {
	name: string = 'calculate_transaction_frequency';
	description: string = `Calculate transaction frequency score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const freqScore = this.scoringWalletKit.calcTxFreq();
			return JSON.stringify({
				status: 'success',
				message: `Transaction Frequency Score for ${parsedInput.walletAdress} is ${freqScore} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate transaction frequency:', error);
			throw new Error('Failed to calculate transaction frequency');
		}
	}
}

class CalcVol extends Tool {
	name: string = 'calculate_transaction_volume';
	description: string = `Calculate transaction volume for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const volume = this.scoringWalletKit.calcVol();
			return JSON.stringify({
				status: 'success',
				message: `Transaction Volume for ${parsedInput.walletAdress} is ${volume} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate transaction volume:', error);
			throw new Error('Failed to calculate transaction volume');
		}
	}
}

class CalcProfitability extends Tool {
	name: string = 'calculate_profitability';
	description: string = `Calculate profitability score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const profitability = this.scoringWalletKit.calcProfitability();
			return JSON.stringify({
				status: 'success',
				message: `Profitability Score for ${parsedInput.walletAdress} is ${profitability} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate profitability:', error);
			throw new Error('Failed to calculate profitability');
		}
	}
}

class CalcDexDiversity extends Tool {
	name: string = 'calculate_dex_diversity';
	description: string = `Calculate DEX diversity score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const dexDiversity = this.scoringWalletKit.calcDexDiversity();
			return JSON.stringify({
				status: 'success',
				message: `DEX Diversity Score for ${parsedInput.walletAdress} is ${dexDiversity} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate DEX diversity score:', error);
			throw new Error('Failed to calculate DEX diversity score');
		}
	}
}

class CalcStableTokenVol extends Tool {
	name: string = 'calculate_stable_token_volume';
	description: string = `Calculate stable token volume for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const stableTokenVol = this.scoringWalletKit.calcStableTokenVol();
			return JSON.stringify({
				status: 'success',
				message: `Stable Token Volume for ${parsedInput.walletAdress} is ${stableTokenVol} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate stable token volume:', error);
			throw new Error('Failed to calculate stable token volume');
		}
	}
}

class CalcRiskContract extends Tool {
	name: string = 'calculate_risk_contract';
	description: string = `Calculate risk contract score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const riskScore = this.scoringWalletKit.calcRiskContract();
			return JSON.stringify({
				status: 'success',
				message: `Risk Contract Score for ${parsedInput.walletAdress} is ${riskScore} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate risk contract score:', error);
			throw new Error('Failed to calculate risk contract score');
		}
	}
}

class CalcFinalScore extends Tool {
	name: string = 'calculate_final_score';
	description: string = `Calculate the final performance score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;

	constructor(private scoringWalletKit: ScoringWalletKit) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = JSON.parse(input);
			const walletAddress = new PublicKey(parsedInput.walletAdress);
			const amountOfTx = parsedInput.amountOfTx || 10;

			if (this.scoringWalletKit.transactions.length === 0) {
				await this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
			}

			const finalScore = this.scoringWalletKit.calcFinalScore();
			return JSON.stringify({
				status: 'success',
				message: `Final Score for ${parsedInput.walletAdress} is ${finalScore} on ${this.scoringWalletKit.transactions.length}`,
			});
		} catch (error) {
			console.error('Failed to calculate final score:', error);
			throw new Error('Failed to calculate final score');
		}
	}
}

export function walletScoringTool(scoringWalletKit: ScoringWalletKit) {
	return [
		new FetchTx(scoringWalletKit),
		new CalcTxFreq(scoringWalletKit),
		new CalcVol(scoringWalletKit),
		new CalcProfitability(scoringWalletKit),
		new CalcDexDiversity(scoringWalletKit),
		new CalcStableTokenVol(scoringWalletKit),
		new CalcRiskContract(scoringWalletKit),
		new CalcFinalScore(scoringWalletKit),
	];
}
