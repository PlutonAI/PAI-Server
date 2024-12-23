import {
	Connection,
	ParsedTransactionWithMeta,
	PublicKey,
} from '@solana/web3.js';
import {
	calc_dex_diversity,
	calc_final_score,
	calc_profitability,
	calc_risky_contract,
	calc_stabel_token_vol,
	calc_tx_freq,
	calc_vol,
	fetch_tx,
} from './utils/helper';

export class ScoringWalletKit {
	public connection: Connection;
	public transactions: (ParsedTransactionWithMeta | null)[] = [];
	public frequency: number = 0;
	public volume: number = 0;
	public profitability: number = 0;
	public dexDiversity: number = 0;
	public stablecoinActivity: number = 0;
	public riskyContracts: number = 0;

	constructor(rpc_url: string) {
		this.connection = new Connection(rpc_url);
	}

	async fetchTx(walletAddress: PublicKey, amountOfTx?: number) {
		return fetch_tx(this, walletAddress, amountOfTx);
	}

	calcTxFreq() {
		return calc_tx_freq(this);
	}

	calcVol() {
		return calc_vol(this);
	}

	calcProfitability() {
		return calc_profitability(this);
	}

	calcDexDiversity() {
		return calc_dex_diversity(this);
	}

	calcStableTokenVol() {
		return calc_stabel_token_vol(this);
	}

	calcRiskContract() {
		return calc_risky_contract(this);
	}

	calcFinalScore() {
		return calc_final_score(this);
	}
}
