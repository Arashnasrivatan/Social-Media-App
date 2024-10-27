export const errorHandler = (err, req, res, next) => {
   
       console.log("Error name:", err.name);
    console.log("Error details:", err);

    if (err.name === 'ValidationError') {
        // Get the error messages directly from the 'errors' array
        const errorMessages = err.errors; 
        console.log("Validation error messages:", errorMessages);
        req.flash("error", errorMessages.join(', '));
        return res.redirect("back");
    }

    console.error("Stack trace:", err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};
