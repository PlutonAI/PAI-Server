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
exports.walletScoringTool = walletScoringTool;
const tools_1 = require("@langchain/core/tools");
const web3_js_1 = require("@solana/web3.js");
class FetchTx extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'fetch_transactions';
        this.description = `Fetch transactions for a wallet on Solana blockchain.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000,`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                return JSON.stringify({
                    status: 'success',
                    message: `Fetched transactions for wallet: ${parsedInput.walletAdress}`,
                });
            }
            catch (error) {
                console.error('Failed to fetch transactions:', error);
                throw new Error('Failed to fetch transactions');
            }
        });
    }
}
class CalcTxFreq extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_transaction_frequency';
        this.description = `Calculate transaction frequency score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const freqScore = this.scoringWalletKit.calcTxFreq();
                return JSON.stringify({
                    status: 'success',
                    message: `Transaction Frequency Score for ${parsedInput.walletAdress} is ${freqScore} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate transaction frequency:', error);
                throw new Error('Failed to calculate transaction frequency');
            }
        });
    }
}
class CalcVol extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_transaction_volume';
        this.description = `Calculate transaction volume for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const volume = this.scoringWalletKit.calcVol();
                return JSON.stringify({
                    status: 'success',
                    message: `Transaction Volume for ${parsedInput.walletAdress} is ${volume} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate transaction volume:', error);
                throw new Error('Failed to calculate transaction volume');
            }
        });
    }
}
class CalcProfitability extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_profitability';
        this.description = `Calculate profitability score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const profitability = this.scoringWalletKit.calcProfitability();
                return JSON.stringify({
                    status: 'success',
                    message: `Profitability Score for ${parsedInput.walletAdress} is ${profitability} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate profitability:', error);
                throw new Error('Failed to calculate profitability');
            }
        });
    }
}
class CalcDexDiversity extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_dex_diversity';
        this.description = `Calculate DEX diversity score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const dexDiversity = this.scoringWalletKit.calcDexDiversity();
                return JSON.stringify({
                    status: 'success',
                    message: `DEX Diversity Score for ${parsedInput.walletAdress} is ${dexDiversity} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate DEX diversity score:', error);
                throw new Error('Failed to calculate DEX diversity score');
            }
        });
    }
}
class CalcStableTokenVol extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_stable_token_volume';
        this.description = `Calculate stable token volume for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const stableTokenVol = this.scoringWalletKit.calcStableTokenVol();
                return JSON.stringify({
                    status: 'success',
                    message: `Stable Token Volume for ${parsedInput.walletAdress} is ${stableTokenVol} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate stable token volume:', error);
                throw new Error('Failed to calculate stable token volume');
            }
        });
    }
}
class CalcRiskContract extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_risk_contract';
        this.description = `Calculate risk contract score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const riskScore = this.scoringWalletKit.calcRiskContract();
                return JSON.stringify({
                    status: 'success',
                    message: `Risk Contract Score for ${parsedInput.walletAdress} is ${riskScore} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate risk contract score:', error);
                throw new Error('Failed to calculate risk contract score');
            }
        });
    }
}
class CalcFinalScore extends tools_1.Tool {
    constructor(scoringWalletKit) {
        super();
        this.scoringWalletKit = scoringWalletKit;
        this.name = 'calculate_final_score';
        this.description = `Calculate the final performance score for a wallet.

		Inputs (input is a JSON string):
		walletAdress: string, e.g., "9uVDGba5CygE7Fmv28SZgTRWfA4LUYAXGnsMhzMz2iKw" (required)
		amountOfTx: number, e.g., 10 (optional), between 1 and 1000`;
    }
    _call(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedInput = JSON.parse(input);
                const walletAddress = new web3_js_1.PublicKey(parsedInput.walletAdress);
                const amountOfTx = parsedInput.amountOfTx || 10;
                if (this.scoringWalletKit.transactions.length === 0) {
                    yield this.scoringWalletKit.fetchTx(walletAddress, amountOfTx);
                }
                const finalScore = this.scoringWalletKit.calcFinalScore();
                return JSON.stringify({
                    status: 'success',
                    message: `Final Score for ${parsedInput.walletAdress} is ${finalScore} on ${this.scoringWalletKit.transactions.length}`,
                });
            }
            catch (error) {
                console.error('Failed to calculate final score:', error);
                throw new Error('Failed to calculate final score');
            }
        });
    }
}
function walletScoringTool(scoringWalletKit) {
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
