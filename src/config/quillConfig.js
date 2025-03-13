// src/components/quillConfig.js

export const modules = {
  toolbar: [
    [{ 'font': ['times-new-roman', 'arial', 'serif', 'sans-serif'] }],
    [{ 'header': '1' }, { 'header': '2' }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean'],['formula']
  ],
};

export const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image',
];
