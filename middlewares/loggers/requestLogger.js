const requestLogger = (req, res, next) => {
    const tarih = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[LOG] ${tarih} | İstek: ${req.method} ${req.url}`);
    next(); // İsteğin devam etmesine izin ver
};

module.exports = requestLogger;
