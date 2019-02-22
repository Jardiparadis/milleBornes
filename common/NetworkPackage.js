module.exports = {
    networkPackage: {
        code: undefined,
        success: undefined,
        data: undefined
    },
    convertToString(networkPackage) {
        return JSON.stringify(networkPackage);
    },
    convertToNetworkPackage(string) {
        return JSON.parse(string);
    },
    createNetworkPackage(code, success, data) {
        return {
            code: code,
            success: success,
            data: data
        }
    }
};
