let ioInstance;

// Add in-memory unread count tracking (for demo; use DB for production)
const departmentUnread = {};

function setSocketIo(io) {
    ioInstance = io;
    io.on('connection', (socket) => {
        socket.on('joinDepartment', (department) => {
            socket.join(`dept_${department}`);
        });
        socket.on('departmentMessage', (msg) => {
            // Increment unread for all users in department except sender
            const dept = msg.department;
            departmentUnread[dept] = departmentUnread[dept] || {};
            io.to(`dept_${dept}`).clients((err, clients) => {
                if (!err && clients) {
                    clients.forEach((clientId) => {
                        if (clientId !== socket.id) {
                            departmentUnread[dept][clientId] = (departmentUnread[dept][clientId] || 0) + 1;
                            io.to(clientId).emit('departmentChatUnread', departmentUnread[dept][clientId]);
                        }
                    });
                }
            });
        });
        socket.on('departmentChatRead', ({ department, userId }) => {
            if (departmentUnread[department]) {
                departmentUnread[department][socket.id] = 0;
                io.to(socket.id).emit('departmentChatUnread', 0);
    }
        });
    });
}

function getSocketIo() {
    return ioInstance;
}

module.exports = { setSocketIo, getSocketIo };
