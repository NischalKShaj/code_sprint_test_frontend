// ================== file to show the server side error page of the admin for the application =================== //

import React from "react";

const ServerError = () => {
  return (
    <div className="bg-white h-auto mt-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <h1 className="text-red-600 text-4xl font-bold text-center my-6 sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
        500 ERROR
      </h1>
      <div className="bg-white w-full max-w-3xl mx-auto h-auto p-6 border border-gray-300 rounded-lg">
        <h2 className="text-red-600 text-lg leading-snug mb-4 sm:text-base md:text-lg lg:text-lg xl:text-xl">
          Sorry, something went wrong on our end. We are currently trying to fix
          the problem.
        </h2>
        <p className="text-gray-800 text-base leading-relaxed mb-4">
          In the meantime, you can:
        </p>
        <div className="flex items-center mb-4">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 489.711 489.711"
          >
            <path d="M112.156,97.111c72.3-65.4,180.5-66.4,253.8-6.7l-58.1,2.2c-7.5,0.3-13.3,6.5-13,14c0.3,7.3,6.3,13,13.5,13    c0.2,0,0.3,0,0.5,0l89.2-3.3c7.3-0.3,13-6.2,13-13.5v-1c0-0.2,0-0.3,0-0.5v-0.1l0,0l-3.3-88.2c-0.3-7.5-6.6-13.3-14-13    c-7.5,0.3-13.3,6.5-13,14l2.1,55.3c-36.3-29.7-81-46.9-128.8-49.3c-59.2-3-116.1,17.3-160,57.1    c-60.4,54.7-86,137.9-66.8,217.1    c1.5,6.2,7,10.3,13.1,10.3c1.1,0,2.1-0.1,3.2-0.4c7.2-1.8,11.7-9.1,9.9-16.3C36.656,218.211,59.056,145.111,112.156,97.111z"></path>
            <path d="M462.456,195.511c-1.8-7.2-9.1-11.7-16.3-9.9c-7.2,1.8-11.7,9.1-9.9,16.3c16.9,69.6-5.6,142.7-58.7,190.7    c-37.3,33.7-84.1,50.3-130.7,50.3c-44.5,0-88.9-15.1-124.7-44.9l58.8-5.3c7.4-0.7,12.9-7.2,12.2-14.7s-7.2-12.9-14.7-12.2l-88.9,8    c-7.4,0.7-12.9,7.2-12.2,14.7l8,88.9c0.6,7,6.5,12.3,13.4,12.3c0.4,0,0.8,0,1.2-0.1c7.4-0.7,12.9-7.2,12.2-14.7l-4.8-54.1    c36.3,29.4,80.8,46.5,128.3,48.9c3.8,0.2,7.6,0.3,11.3,0.3c55.1,0,107.5-20.2,148.7-57.4    C456.056,357.911,481.656,274.811,462.456,195.511z"></path>
          </svg>
          <p className="text-base leading-normal">Refresh the page</p>
        </div>
        <div className="flex items-center mb-4">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 60"
          >
            <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30   S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"></path>
            <path d="M30,6c-0.552,0-1,0.447-1,1v23H14c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1V7C31,6.447,30.552,6,30,6z"></path>
          </svg>
          <p className="text-base leading-normal">Wait a few minutes</p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
