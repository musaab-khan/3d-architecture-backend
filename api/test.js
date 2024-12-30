module.exports = (req, res) => {
    // Send the request body back as the response
    res.status(200).json({
      message: 'Request received successfully!',
      data: req.body,
    });
  };
  