"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv")); // Import dotenv
const node_cron_1 = __importDefault(require("node-cron")); //dependency
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
//develpment or production
let client_path = '';
if (process.env.NODE_ENV === 'production') {
    client_path = process.env.CLIENT_PATH_PROD;
}
else {
    client_path = process.env.CLIENT_PATH_DEV;
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    origin: client_path
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
server.listen(8000, () => {
    console.log('Server running on http://localhost:8000/');
});
const MONGO_URL = process.env.MONGO_URL; // DB URI
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(MONGO_URL);
mongoose_1.default.connection.on('error', (error) => console.log(error));
mongoose_1.default.connection.once('open', () => {
    console.log('Connected to the database');
});
//test route
app.get('/', (req, res) => {
    res.send('Hello World! From Recapeo');
});
//import routes
const AuthRoute_1 = __importDefault(require("./routes/AuthRoute"));
const ResetPasswordRoute_1 = __importDefault(require("./routes/ResetPasswordRoute"));
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
const FolderRoute_1 = __importDefault(require("./routes/FolderRoute"));
const ImageRoute_1 = __importDefault(require("./routes/ImageRoute"));
const StorageRoute_1 = __importDefault(require("./routes/StorageRoute"));
const UsageRoute_1 = __importDefault(require("./routes/UsageRoute"));
const usage_1 = require("./db/usage");
//use routes
app.use('/api/auth', AuthRoute_1.default);
app.use('/api/user', UserRoute_1.default);
app.use('/api/reset-password', ResetPasswordRoute_1.default);
app.use('/api/folder', FolderRoute_1.default);
app.use('/api/image', ImageRoute_1.default);
app.use('/api/storage', StorageRoute_1.default);
app.use('/api/usage', UsageRoute_1.default);
// cron job
// Schedule a task to reset daily usage at midnight (00:00)
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        // Reset daily usage for all users to 0
        await usage_1.UsageModel.updateMany({}, { $set: { usage: 0 } });
        console.log('Daily usage reset successful.');
    }
    catch (error) {
        console.error('Error resetting daily usage:', error);
    }
}, {
    timezone: 'Asia/Karachi',
});
//# sourceMappingURL=index.js.map