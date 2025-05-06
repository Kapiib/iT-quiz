/**
 * Wraps async route handlers to catch errors and pass them to next()
 * @param {Function} fn - The async route handler function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

/**
 * Creates a custom error with status code and title
 */
class AppError extends Error {
    constructor(message, statusCode = 500, title = 'Error') {
        super(message);
        this.statusCode = statusCode;
        this.title = title;
    }
}

module.exports = { catchAsync, AppError };