"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.initializeAgent = initializeAgent;
const solana_agent_kit_1 = require("solana-agent-kit");
const openai_1 = require("@langchain/openai");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const langgraph_1 = require("@langchain/langgraph");
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const dotenv = __importStar(require("dotenv"));
const scoringWallet_1 = require("./scoringWallet");
const transaction_1 = require("./transaction");
dotenv.config();
function initializeAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        const openAIKey = process.env.OPENAI_API_KEY;
        const rpcUrl = process.env.SOLANA_RPC_URL;
        const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;
        const tavilyKey = process.env.TAVILY_AI_KEY;
        const llm = new openai_1.ChatOpenAI({
            model: 'gpt-4o',
            temperature: 0,
            maxTokens: undefined,
            timeout: undefined,
            openAIApiKey: openAIKey,
        });
        const solanaKit = new solana_agent_kit_1.SolanaAgentKit(solanaPrivateKey, rpcUrl, openAIKey);
        const scoringWalletKit = new scoringWallet_1.ScoringWalletKit(rpcUrl);
        const solanaTools = (0, solana_agent_kit_1.createSolanaTools)(solanaKit);
        const scoringTools = (0, transaction_1.walletScoringTool)(scoringWalletKit);
        const tools = [
            ...solanaTools,
            new tavily_search_1.TavilySearchResults({ maxResults: 3, apiKey: tavilyKey }),
            ...scoringTools,
        ];
        const memory = new langgraph_1.MemorySaver();
        return (0, prebuilt_1.createReactAgent)({
            llm,
            tools,
            checkpointSaver: memory,
        });
    });
}
