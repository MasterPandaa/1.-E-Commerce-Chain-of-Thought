// Reasoning: Response helpers for consistent API responses
function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function created(res, data = null, message = 'Created') {
  return success(res, data, message, 201);
}

module.exports = { success, created };
