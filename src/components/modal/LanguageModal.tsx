// file to perform the language selection
"use client";

// importing the required modules
import React, { useState } from "react";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (language: string, id: string) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [language, setLanguage] = useState("");
  const [id, setId] = useState("");

  const handleSave = () => {
    onSave(language, id);
    setLanguage("");
    setId("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Language</h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <input
              type="text"
              name="language"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="id"
              className="block text-sm font-medium text-gray-700"
            >
              ID
            </label>
            <input
              type="text"
              name="id"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-1"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
