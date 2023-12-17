"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const validateToken = (req, res, next) => {
    try {
        const accessToken = req.header("Authorization").split(" ")[1];
        console.log(accessToken);
        if (!accessToken) {
            return res.sendStatus(401);
        }
        const payload = (0, jsonwebtoken_1.verify)(accessToken, process.env.JWTPRIVATEKEY);
        req.user = payload;
        req.token = accessToken;
        return next();
    }
    catch (err) {
        return res.sendStatus(401);
    }
};
exports.default = validateToken;
//# sourceMappingURL=validateToken.js.map