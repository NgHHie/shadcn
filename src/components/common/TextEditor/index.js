import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import './style.scss'
import { formats, modules } from '../../../config/quillConfig';

const TextEditor = ({value,onChange}) => {

  const handleChange = (content, delta, source, editor) => {
    if (onChange) {
      onChange(editor.getHTML()); // Get the HTML content as a string
    }
  };

  return (
    <div className="rich-text-editor">
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Type here"
      />
    </div>
  );
};

export default TextEditor;
