import express from 'express';
import cors from 'cors';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { initializeAgent } from './agent';
import { HumanMessage } from '@langchain/core/messages';
import { Server as HttpServer } from 'http';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	}),
);

const server = app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

const io = new SocketIOServer(server as HttpServer, {
	cors: {
		origin: '*', // Allow all origins
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	},
});

const onConnected = async (socket: Socket) => {
	console.log(`A user connected: ${socket.id}`);

	const agent = await initializeAgent();

	async function runChat(message: string) {
		console.log('received_message: ', message);
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

	socket.on('send_message', async (data) => {
		const aiResponse = await runChat(data);

		socket.emit('received_message', aiResponse);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
};

io.on('connection', onConnected);
