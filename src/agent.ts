import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import * as dotenv from 'dotenv';
// import { WalletScoringTool } from './transaction';

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

	const solanaTools = createSolanaTools(solanaKit);

	const tools = [
		...solanaTools,
		// new WalletScoringTool(),
		new TavilySearchResults({ maxResults: 3, apiKey: tavilyKey }),
	];
	const memory = new MemorySaver();

	return createReactAgent({
		llm,
		tools,
		checkpointSaver: memory,
	});
}

export { initializeAgent };
