export const getCurrentUser = async (req, res) => {
  try {
    // user already middleware se aa chuka hai
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
    console.log("getCurrentUser exported");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};