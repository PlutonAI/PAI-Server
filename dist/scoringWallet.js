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
exports.ScoringWalletKit = void 0;
const web3_js_1 = require("@solana/web3.js");
const helper_1 = require("./utils/helper");
class ScoringWalletKit {
    constructor(rpc_url) {
        this.transactions = [];
        this.frequency = 0;
        this.volume = 0;
        this.profitability = 0;
        this.dexDiversity = 0;
        this.stablecoinActivity = 0;
        this.riskyContracts = 0;
        this.connection = new web3_js_1.Connection(rpc_url);
    }
    fetchTx(walletAddress, amountOfTx) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, helper_1.fetch_tx)(this, walletAddress, amountOfTx);
        });
    }
    calcTxFreq() {
        return (0, helper_1.calc_tx_freq)(this);
    }
    calcVol() {
        return (0, helper_1.calc_vol)(this);
    }
    calcProfitability() {
        return (0, helper_1.calc_profitability)(this);
    }
    calcDexDiversity() {
        return (0, helper_1.calc_dex_diversity)(this);
    }
    calcStableTokenVol() {
        return (0, helper_1.calc_stabel_token_vol)(this);
    }
    calcRiskContract() {
        return (0, helper_1.calc_risky_contract)(this);
    }
    calcFinalScore() {
        return (0, helper_1.calc_final_score)(this);
    }
}
exports.ScoringWalletKit = ScoringWalletKit;
