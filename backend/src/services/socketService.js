const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try { socket.userId = jwt.verify(token, process.env.JWT_SECRET).id; }
      catch { /* guest */ }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user_${socket.userId}`);

    socket.on('track:subscribe',   ({ donationId }) => socket.join(`donation_${donationId}`));
    socket.on('track:unsubscribe', ({ donationId }) => socket.leave(`donation_${donationId}`));

    socket.on('volunteer:location', ({ donationId, lat, lng, eta }) => {
      io.to(`donation_${donationId}`).emit('donation:location', { lat, lng, eta, timestamp: new Date() });
    });

    socket.on('disconnect', () => {});
  });
};
