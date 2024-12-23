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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const agent_1 = require("./agent");
const messages_1 = require("@langchain/core/messages");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
    },
});
const onConnected = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`A user connected: ${socket.id}`);
    const agent = yield (0, agent_1.initializeAgent)();
    function runChat(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            console.log('received_message: ', message);
            const config = { configurable: { thread_id: 'Solana Agent Kit!' } };
            // Send a command to the agent
            const stream = yield agent.stream({
                messages: [new messages_1.HumanMessage(message)],
            }, config);
            let aiResponse = '';
            try {
                // Handle the response from the AI agent
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    if ('agent' in chunk) {
                        aiResponse = chunk.agent.messages[0].content;
                    }
                    else if ('tools' in chunk) {
                        aiResponse = chunk.tools.messages[0].content;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return aiResponse;
        });
    }
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const aiResponse = yield runChat(data);
        socket.emit('received_message', aiResponse);
    }));
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
io.on('connection', onConnected);
