import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import * as dotenv from 'dotenv';
import { ScoringWalletKit } from './scoringWallet';
import { walletScoringTool } from './transaction';

dotenv.config();

async function initializeAgent() {
	const openAIKey = process.env.OPENAI_API_KEY;
	const rpcUrl = process.env.SOLANA_RPC_URL;
	const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;
	const tavilyKey = process.env.TAVILY_AI_KEY;

	const llm = new ChatOpenAI({
		model: 'gpt-4o',
		temperature: 0,
		maxTokens: undefined,
		timeout: undefined,
		openAIApiKey: openAIKey,
	});

	const solanaKit = new SolanaAgentKit(solanaPrivateKey!, rpcUrl, openAIKey!);
	const scoringWalletKit = new ScoringWalletKit(rpcUrl!);

	const solanaTools = createSolanaTools(solanaKit);
	const scoringTools = walletScoringTool(scoringWalletKit);

	const tools = [
		...solanaTools,
		new TavilySearchResults({ maxResults: 3, apiKey: tavilyKey }),
		...scoringTools,
	];

	const memory = new MemorySaver();

	return createReactAgent({
		llm,
		tools,
		checkpointSaver: memory,
	});
}

export { initializeAgent };
