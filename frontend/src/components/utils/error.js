export const handleError = (error) => {
    console.error(error);
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.response) {
        // Server responded with a status other than 200 range
        if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else {
            errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        }
    } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response received from the server. Please check your network connection.';
    } else if (error.message) {
        // Something happened in setting up the request
        errorMessage = error.message;
    }

    return errorMessage;
};