import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import './style.scss'
import { formats } from '../../../config/quillConfig';
import { message } from 'antd';
import { uploadFile } from '../../../services/fileUploadService';

const Size = Quill.import('attributors/style/size');
Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px'];
Quill.register(Size, true);

const TextEditor = ({ value, onChange }) => {
  const reactQuillRef = useRef(null);
  const handleChange = (content, delta, source, editor) => {
    if (onChange) {
      onChange(editor.getHTML()); // Get the HTML content as a string
    }
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await uploadFile(formData);
          const quill = reactQuillRef.current;
          if (quill) {
            const range = quill.getEditorSelection();
            range && quill.getEditor().insertEmbed(range.index, 'image', response?.url);
          }
        } catch (error) {
          console.log(error)
          message.error('Error uploading image:', error);
        }
      }
    };
  },[]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault(); // Prevent the default paste action
          const formData = new FormData();
          formData.append('file', file);

          // Upload the image
          uploadFile(formData)
            .then((response) => {
              const quill = reactQuillRef.current.getEditor();
              const range = quill.getSelection();
              if (range) {
                // Insert the uploaded image into the editor
                quill.insertEmbed(range.index, 'image', response?.url);
              }
            })
            .catch((error) => {
              console.error('Error uploading image:', error);
              message.error('Error uploading image');
            });
        }
      }
    }
  }, []);

  useEffect(() => {
    const quillEditor = reactQuillRef.current.getEditor();
    const quillEditorElement = quillEditor.root;

    if (quillEditorElement) {
      // Attach the paste event listener directly to the Quill editor element
      quillEditorElement.addEventListener('paste', handlePaste);
    }

    // Cleanup the event listener when the component is unmounted
    return () => {
      if (quillEditorElement) {
        quillEditorElement.removeEventListener('paste', handlePaste);
      }
    };
  }, []);
  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={reactQuillRef}
        value={value}
        onChange={handleChange}
        modules={{
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{font: []}],
              [{ size: ['12px', '14px', '16px', '18px', '20px','22px', '24px', '28px', '32px', '36px'] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["link", "image", "video"],
              ["code-block"],
              ["clean"],
            ],
            handlers: {
              image: imageHandler,
            },
          },
          clipboard: {
            matchVisual: false,
          },
        }}
        formats={formats}
        placeholder="Type here"
      />
    </div>
  );
};

export default TextEditor;
