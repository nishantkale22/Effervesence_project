let io;

const setSocketIo = (socketIoInstance) => {
    io = socketIoInstance;
};

const getSocketIo = () => {
    if (!io) {
        throw new Error("Socket.io instance is not initialized.");
    }
    return io;
};

module.exports = { setSocketIo, getSocketIo };
