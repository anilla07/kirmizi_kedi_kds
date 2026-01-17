const simpleCheck = (req, res, next) => {
    console.log(`[GÜVENLİK] ${req.url} rotası kontrol edildi.`);
    next(); 
};

module.exports = simpleCheck;