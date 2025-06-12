"use client";

import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";

interface SqlEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
  database?: string;
}

export function SqlEditor({
  initialValue = "SELECT * FROM users WHERE id = 1;",
  onChange,
  height = "300px",
}: SqlEditorProps) {
  const [value, setValue] = useState(initialValue);
  const { theme } = useTheme();

  const handleChange = React.useCallback(
    (val: string) => {
      setValue(val);
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <CodeMirror
        value={value}
        height={height}
        extensions={[sql()]}
        onChange={handleChange}
        theme={theme === "dark" ? vscodeDark : vscodeLight}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          autocompletion: true,
          foldGutter: true,
          indentOnInput: true,
        }}
        className="text-sm"
      />
    </div>
  );
}
