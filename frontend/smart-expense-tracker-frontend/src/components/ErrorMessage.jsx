import React from 'react';

const ErrorMessage = ({ error }) => {
    if (!error) return null;

    return (
        <div className="text-red-600 text-sm mt-1">
            {error}
        </div>
    );
};

export default ErrorMessage;
