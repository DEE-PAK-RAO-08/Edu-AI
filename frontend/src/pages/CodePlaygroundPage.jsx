import { useState, useRef } from 'react';

export default function CodePlaygroundPage() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, World!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef(null);
  const textareaRef = useRef(null);

  const languages = [
    { id: 'javascript', label: 'JavaScript', icon: '🟨', version: '18.15.0' },
    { id: 'python', label: 'Python', icon: '🐍', version: '3.10.0' },
    { id: 'java', label: 'Java', icon: '☕', version: '15.0.2' },
    { id: 'c', label: 'C', icon: '⚙️', version: '10.2.0' },
    { id: 'cpp', label: 'C++', icon: '🔷', version: '10.2.0' },
    { id: 'typescript', label: 'TypeScript', icon: '🔵', version: '5.0.3' },
  ];

  const templates = {
    javascript: '// JavaScript Example\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(`F(${i}) = ${fibonacci(i)}`);\n}',
    python: '# Python Example (Runs locally in browser!)\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nfor i in range(10):\n    print(f"F({i}) = {fibonacci(i)}")',
    java: '// Java Example\npublic class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n    \n    public static void main(String[] args) {\n        for (int i = 0; i < 10; i++) {\n            System.out.println("F(" + i + ") = " + fibonacci(i));\n        }\n    }\n}',
    c: '// C Example\n#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        printf("F(%d) = %d\\n", i, fibonacci(i));\n    }\n    return 0;\n}',
    cpp: '// C++ Example\n#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        cout << "F(" << i << ") = " << fibonacci(i) << endl;\n    }\n    return 0;\n}',
    typescript: '// TypeScript Example (Runs locally!)\nfunction fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(`F(${i}) = ${fibonacci(i)}`);\n}',
  };

  const pistonLangMap = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    c: { language: 'c', version: '10.2.0' },
    cpp: { language: 'c++', version: '10.2.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
  };

  const runCode = async () => {
    setRunning(true);
    setOutput('');
    setError('');

    // Local Execution for JS and TS
    if (language === 'javascript' || language === 'typescript') {
      try {
        let runnerCode = code;
        if (language === 'typescript' && window.ts) {
          runnerCode = window.ts.transpile(code);
        }

        const originalLog = console.log;
        let logs = [];
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        const fn = new Function(runnerCode);
        fn();
        console.log = originalLog;
        setOutput(logs.join('\n') || 'Code executed successfully (no output).');
      } catch (err) {
        setError(err.toString());
      }
      setRunning(false);
      return;
    }

    // Local Execution for Python (Pyodide)
    if (language === 'python') {
      try {
        if (!pyodideRef.current && window.loadPyodide) {
          setOutput('⏳ Initializing local Python engine (Pyodide)...');
          pyodideRef.current = await window.loadPyodide();
          setPyodideReady(true);
        }
        
        if (pyodideRef.current) {
          setOutput('⏳ Running Python...');
          // Redirect stdout to our output
          pyodideRef.current.runPython(`
import sys
import io
sys.stdout = io.StringIO()
          `);
          await pyodideRef.current.runPythonAsync(code);
          const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
          setOutput(stdout || 'Python code executed successfully.');
        } else {
          setError('Python engine not available. Please check your connection to load the Pyodide runtime.');
        }
      } catch (err) {
        setError(err.toString());
      }
      setRunning(false);
      return;
    }

    // Remote Execution for others (C, C++, Java) through our Backend Proxy (bypasses CORS)
    try {
      const config = pistonLangMap[language];
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          language: config.language,
          version: '*', // Use wildcard version for better node compatibility
          files: [{ content: code }]
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('🔒 Remote runner requires login. Please log in to your account.');
          return;
        }
        if (res.status === 429) {
          setError('⚠️ Rate limit reached. Please wait a moment.');
          return;
        }
        setError(data.message || data.error || 'Remote runner is currently busy. (Tip: JS, TS, and Python work offline!)');
      } else if (data.run) {
        setOutput(data.run.stdout || '');
        if (data.run.stderr) setError(data.run.stderr);
        if (data.run.signal === 'SIGKILL') setError('⏱️ Execution timed out');
      }
    } catch (err) {
      setError('Connection to backend failed. Please ensure the server is running.');
    }
    setRunning(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setCode(code.substring(0, start) + '  ' + code.substring(end));
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 2; }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  };

  const lineNumbers = code.split('\n').length;

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>💻 Code Playground</h1>
        <p>Write, run, and experiment with code in multiple languages</p>
      </div>

      {/* Language & Actions Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {languages.map(lang => (
          <button key={lang.id} className={`btn ${language === lang.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => { setLanguage(lang.id); setCode(templates[lang.id] || ''); setOutput(''); setError(''); }}
            style={{ borderRadius: 16 }}>
            {lang.icon} {lang.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={() => { setCode(templates[language] || ''); setOutput(''); setError(''); }}
          style={{ borderRadius: 16 }}>📋 Template</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setCode(''); setOutput(''); setError(''); }}
          style={{ borderRadius: 16 }}>🗑️ Clear</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Editor */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{languages.find(l => l.id === language)?.icon} Editor</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lineNumbers} lines • Ctrl+Enter to run</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 40, height: '100%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', paddingTop: 12, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', userSelect: 'none', borderRight: '1px solid var(--border-color)' }}>
              {Array.from({ length: lineNumbers }, (_, i) => (
                <div key={i} style={{ height: '20.8px', lineHeight: '20.8px' }}>{i + 1}</div>
              ))}
            </div>
            <textarea ref={textareaRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleKeyDown}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 400, padding: '12px 16px 12px 52px', background: 'var(--bg-card)',
                border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
                fontSize: 14, lineHeight: '20.8px', resize: 'vertical', whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto'
              }} />
          </div>
        </div>

        {/* Output */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>📤 Output</span>
            <button className="btn btn-primary btn-sm" onClick={runCode} disabled={running} style={{ borderRadius: 16, padding: '6px 16px' }}>
              {running ? '⏳ Running...' : '▶ Run Code'}
            </button>
          </div>
          <div style={{ flex: 1, padding: 16, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: 400, overflowY: 'auto' }}>
            {running && <div style={{ color: 'var(--accent-primary)' }}>⏳ Executing...</div>}
            {output && <div style={{ color: 'var(--accent-success)' }}>{output}</div>}
            {error && <div style={{ color: 'var(--accent-danger)', marginTop: 8 }}>⚠️ {error}</div>}
            {!running && !output && !error && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>▶</div>
                <p>Click "Run Code" or press Ctrl+Enter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
