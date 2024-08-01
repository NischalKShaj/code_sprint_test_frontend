// file to add the ide for the admin side
"use client";

// Importing the required modules
import React from "react";
import Editor from "@monaco-editor/react";

const AddProblemIde = () => {
  const handleSubmit = () => {
    // Add logic to verify the test here
  };

  return (
    <div className="w-full max-w-4xl p-4 border">
      <form onSubmit={handleSubmit}>
        <div className="">
          <label htmlFor="comment" className="sr-only">
            Add your code
          </label>
          <Editor
            height="50vh"
            defaultLanguage="javascript"
            defaultValue='console.log("Hello World");'
            theme="vs-dark"
          />
        </div>
        <div className="flex justify-between pt-2">
          <div className="flex items-center space-x-5"></div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Verify Test
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProblemIde;
