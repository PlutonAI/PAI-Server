import express from 'express';
import cors from 'cors';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { initializeAgent } from './agent';
import { HumanMessage } from '@langchain/core/messages';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }));

const server = app.listen(PORT, () => console.log(`Server on port ${PORT}`));

const io = new SocketIOServer(server, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ['GET', 'POST'],
	},
});

const onConnected = async (socket: Socket) => {
	console.log('A user connected');
	console.log('Socket Id: ', socket.id);

	const agent = await initializeAgent();

	async function runChat(message: string) {
		const config = { configurable: { thread_id: 'Solana Agent Kit!' } };

		// Send a command to the agent
		const stream = await agent.stream(
			{
				messages: [new HumanMessage(message)],
			},
			config,
		);

		let aiResponse = '';

		// Handle the response from the AI agent
		for await (const chunk of stream) {
			if ('agent' in chunk) {
				aiResponse = chunk.agent.messages[0].content;
			} else if ('tools' in chunk) {
				aiResponse = chunk.tools.messages[0].content;
			}
		}

		return aiResponse;
	}

	socket.on('message', async (data) => {
		console.log('Received message:', data);

		const aiResponse = await runChat(data);

		socket.emit('message', aiResponse);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
};

io.on('connection', onConnected);
