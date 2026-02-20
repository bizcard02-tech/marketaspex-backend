const sendSuccessResponse = (res, status = 200, success = true, message = '', type = '', results = {}) => {
    const successObject = {
        status,
        success,
        message,
    };
    if (type) successObject.type = type;
    if (Object.keys(results).length > 0) successObject.results = results;
    return res.status(status).json(successObject);
};

export default sendSuccessResponse;
