const socketio = require('socket.io');
const Message = require('./models/message');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const socketIO = (server) => {
    const io = socketio(server);

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded._id);
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`${socket.user.firstname} connected`);

        socket.on('sendMessage', async (message) => {
            try {
                const newMessage = new Message({
                    content: message,
                    user_id: socket.user._id,
                });
                await newMessage.save();

                io.emit('receiveMessage', {
                    content: message,
                    user: { firstname: socket.user.firstname, lastname: socket.user.lastname },
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`${socket.user.firstname} disconnected`);
        });
    });

    return io;
};

module.exports = socketIO;