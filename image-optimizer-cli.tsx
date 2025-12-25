import React, { useState, useRef } from 'react';
import { Upload, Image, Zap, CheckCircle, XCircle, Download, Settings, Trash2, FolderOpen, Info } from 'lucide-react';

export default function ImageOptimizerCLI() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([
    '> Image Optimizer CLI v2.0.0',
    '> Ready to optimize your images...',
    '> Type "help" for available commands',
    ''
  ]);
  const [settings, setSettings] = useState({
    quality: 80,
    format: 'webp',
    maxWidth: 1920,
    maxHeight: 1080,
    keepOriginal: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const terminalRef = useRef(null);
  const fileInputRef = useRef(null);

  const addTerminalLine = (text, type = 'normal') => {
    setTerminalOutput(prev => [...prev, { text, type }]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        addTerminalLine(`> Error: ${file.name} is not an image file`, 'error');
      }
      return isImage;
    });
    
    if (selectedFiles.length === 0) {
      addTerminalLine('> No valid image files selected', 'error');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    addTerminalLine(`> Added ${selectedFiles.length} image(s) to queue`, 'success');
    selectedFiles.forEach(file => {
      addTerminalLine(`  └─ ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'info');
    });
    addTerminalLine('');
  };

  const simulateCompression = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const originalSize = file.size;
            const qualityFactor = settings.quality / 100;
            const formatFactor = settings.format === 'webp' ? 0.7 : settings.format === 'avif' ? 0.6 : 0.85;
            const compressionRatio = qualityFactor * formatFactor * (Math.random() * 0.2 + 0.9);
            const newSize = Math.floor(originalSize * compressionRatio);
            const savings = ((1 - compressionRatio) * 100).toFixed(1);
            
            resolve({
              name: file.name,
              originalSize,
              newSize,
              savings,
              format: settings.format,
              success: true,
              dimensions: `${img.width}x${img.height}`,
              originalFormat: file.type.split('/')[1],
              dataUrl: e.target.result
            });
          };
          img.onerror = () => {
            resolve({
              name: file.name,
              success: false,
              error: 'Failed to load image'
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }, 1500);
    });
  };

  const optimizeImages = async () => {
    if (files.length === 0) {
      addTerminalLine('> Error: No images in queue', 'error');
      addTerminalLine('> Use "add" command or click upload button', 'info');
      addTerminalLine('');
      return;
    }

    setProcessing(true);
    addTerminalLine('> ═══════════════════════════════════════', 'info');
    addTerminalLine('> Starting optimization process...', 'success');
    addTerminalLine(`> Settings: Quality=${settings.quality}%, Format=${settings.format.toUpperCase()}`, 'info');
    addTerminalLine('> ═══════════════════════════════════════', 'info');
    addTerminalLine('');

    const optimizedResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addTerminalLine(`> [${i + 1}/${files.length}] Processing: ${file.name}`, 'info');
      addTerminalLine(`  ├─ Original format: ${file.type.split('/')[1].toUpperCase()}`, 'normal');
      addTerminalLine(`  ├─ Target format: ${settings.format.toUpperCase()}`, 'normal');
      addTerminalLine(`  ├─ Quality setting: ${settings.quality}%`, 'normal');
      
      const result = await simulateCompression(file);
      
      if (result.success) {
        optimizedResults.push(result);
        addTerminalLine(`  ├─ Dimensions: ${result.dimensions}`, 'normal');
        addTerminalLine(`  ├─ Original: ${(result.originalSize / 1024).toFixed(2)} KB`, 'normal');
        addTerminalLine(`  ├─ Optimized: ${(result.newSize / 1024).toFixed(2)} KB`, 'normal');
        addTerminalLine(`  └─ ✓ Saved: ${result.savings}%`, 'success');
      } else {
        addTerminalLine(`  └─ ✗ Failed: ${result.error}`, 'error');
      }
      addTerminalLine('');
    }

    const successCount = optimizedResults.filter(r => r.success).length;
    const totalOriginal = optimizedResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = optimizedResults.reduce((sum, r) => sum + r.newSize, 0);
    const totalSavings = totalOriginal > 0 ? ((1 - totalNew / totalOriginal) * 100).toFixed(1) : 0;

    addTerminalLine('> ═══════════════════════════════════════', 'info');
    addTerminalLine('> ✓ Optimization complete!', 'success');
    addTerminalLine(`> Success: ${successCount}/${files.length} images`, 'success');
    addTerminalLine(`> Total space saved: ${totalSavings}% (${((totalOriginal - totalNew) / 1024).toFixed(2)} KB)`, 'success');
    addTerminalLine('> ═══════════════════════════════════════', 'info');
    addTerminalLine('');

    setResults(optimizedResults);
    setProcessing(false);
  };

  const downloadAll = () => {
    if (results.length === 0) {
      addTerminalLine('> Error: No optimized images to download', 'error');
      return;
    }
    
    addTerminalLine('> Preparing download package...', 'info');
    addTerminalLine(`> ${results.length} file(s) ready for download`, 'success');
    addTerminalLine('> Note: This is a simulation - real CLI would save files', 'info');
    addTerminalLine('');
  };

  const removeFile = (index) => {
    const removed = files[index];
    setFiles(files.filter((_, i) => i !== index));
    addTerminalLine(`> Removed: ${removed.name}`, 'info');
  };

  const clearQueue = () => {
    if (files.length === 0) {
      addTerminalLine('> Queue is already empty', 'info');
      return;
    }
    const count = files.length;
    setFiles([]);
    addTerminalLine(`> Cleared ${count} file(s) from queue`, 'success');
    addTerminalLine('');
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setTerminalOutput([
      { text: '> Image Optimizer CLI v2.0.0', type: 'normal' },
      { text: '> System reset complete', type: 'success' },
      { text: '> Ready to optimize your images...', type: 'normal' },
      { text: '', type: 'normal' }
    ]);
  };

  const handleCommand = (cmd) => {
    const command = cmd.trim().toLowerCase();
    addTerminalLine(`$ ${cmd}`, 'command');
    
    switch(command) {
      case 'help':
        addTerminalLine('> Available commands:', 'info');
        addTerminalLine('  - help: Show this help message', 'normal');
        addTerminalLine('  - clear: Clear terminal output', 'normal');
        addTerminalLine('  - reset: Reset entire application', 'normal');
        addTerminalLine('  - queue: Show files in queue', 'normal');
        addTerminalLine('  - settings: Show current settings', 'normal');
        addTerminalLine('  - optimize: Start optimization', 'normal');
        break;
      case 'clear':
        setTerminalOutput([{ text: '> Terminal cleared', type: 'success' }]);
        break;
      case 'reset':
        reset();
        break;
      case 'queue':
        if (files.length === 0) {
          addTerminalLine('> Queue is empty', 'info');
        } else {
          addTerminalLine(`> ${files.length} file(s) in queue:`, 'info');
          files.forEach((file, i) => {
            addTerminalLine(`  ${i + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'normal');
          });
        }
        break;
      case 'settings':
        addTerminalLine('> Current settings:', 'info');
        addTerminalLine(`  - Quality: ${settings.quality}%`, 'normal');
        addTerminalLine(`  - Format: ${settings.format.toUpperCase()}`, 'normal');
        addTerminalLine(`  - Max dimensions: ${settings.maxWidth}x${settings.maxHeight}`, 'normal');
        addTerminalLine(`  - Keep original: ${settings.keepOriginal ? 'Yes' : 'No'}`, 'normal');
        break;
      case 'optimize':
        optimizeImages();
        break;
      default:
        addTerminalLine(`> Unknown command: ${command}`, 'error');
        addTerminalLine('> Type "help" for available commands', 'info');
    }
    addTerminalLine('');
    setCommandInput('');
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Zap className="text-gray-400" size={32} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Image Optimizer CLI</h1>
                <p className="text-sm text-gray-500">Advanced compression & conversion tool</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded transition-colors"
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Optimization Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Quality: {settings.quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-1">Higher = better quality, larger file</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings({...settings, format: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2"
                >
                  <option value="webp">WebP (Recommended)</option>
                  <option value="avif">AVIF (Best compression)</option>
                  <option value="jpg">JPEG (Universal)</option>
                  <option value="png">PNG (Lossless)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Width (px)</label>
                <input
                  type="number"
                  value={settings.maxWidth}
                  onChange={(e) => setSettings({...settings, maxWidth: parseInt(e.target.value) || 1920})}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Height (px)</label>
                <input
                  type="number"
                  value={settings.maxHeight}
                  onChange={(e) => setSettings({...settings, maxHeight: parseInt(e.target.value) || 1080})}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <FolderOpen size={20} />
              File Queue ({files.length})
            </h2>
            
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={processing}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                  className="flex-1 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg p-4 text-center transition-colors disabled:opacity-50"
                >
                  <Upload className="mx-auto mb-2 text-gray-500" size={24} />
                  <p className="text-sm text-gray-400">Add Images</p>
                </button>
                
                <button
                  onClick={clearQueue}
                  disabled={processing || files.length === 0}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-300 px-4 rounded-lg transition-colors"
                  title="Clear queue"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* File List */}
              <div className="bg-gray-950 rounded border border-gray-800 max-h-64 overflow-y-auto">
                {files.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <Image className="mx-auto mb-2" size={32} />
                    <p className="text-sm">No files in queue</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {files.map((file, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-900 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 truncate">{file.name}</p>
                          <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          disabled={processing}
                          className="ml-2 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={optimizeImages}
                  disabled={processing || files.length === 0}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-200 py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {processing ? 'Processing...' : 'Optimize Now'}
                </button>

                <button
                  onClick={downloadAll}
                  disabled={results.length === 0}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-200 py-3 px-4 rounded-lg transition-colors flex items-center gap-2"
                  title="Download all"
                >
                  <Download size={18} />
                </button>
              </div>

              <button
                onClick={reset}
                disabled={processing}
                className="w-full bg-gray-950 hover:bg-gray-900 disabled:bg-gray-950 disabled:text-gray-700 text-gray-400 py-2 px-4 rounded-lg transition-colors border border-gray-800 text-sm"
              >
                Reset All
              </button>
            </div>

            {/* Results Summary */}
            {results.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Optimized ({results.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((result, idx) => (
                    <div key={idx} className="bg-gray-950 p-3 rounded border border-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {result.success ? (
                              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle size={14} className="text-red-500 flex-shrink-0" />
                            )}
                            <span className="text-sm text-gray-300 truncate">{result.name}</span>
                          </div>
                          {result.success ? (
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <div>{result.originalFormat.toUpperCase()} → {result.format.toUpperCase()}</div>
                              <div>{(result.originalSize / 1024).toFixed(2)} KB → {(result.newSize / 1024).toFixed(2)} KB</div>
                              <div className="text-green-400 font-semibold">↓ {result.savings}% smaller</div>
                            </div>
                          ) : (
                            <div className="text-xs text-red-400">{result.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Terminal Output */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 flex flex-col h-[700px]">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Info size={20} />
              Terminal
            </h2>
            
            <div 
              ref={terminalRef}
              className="flex-1 bg-black rounded border border-gray-900 p-4 overflow-y-auto mb-4"
            >
              <div className="space-y-1">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="text-sm">
                    {line.type === 'command' ? (
                      <span className="text-cyan-400">{line.text}</span>
                    ) : line.type === 'success' ? (
                      <span className="text-green-400">{line.text}</span>
                    ) : line.type === 'error' ? (
                      <span className="text-red-400">{line.text}</span>
                    ) : line.type === 'info' ? (
                      <span className="text-blue-400">{line.text}</span>
                    ) : (
                      <span className="text-gray-500">{line.text}</span>
                    )}
                  </div>
                ))}
                {processing && (
                  <div className="text-gray-400 animate-pulse">
                    <span className="inline-block">▊</span>
                  </div>
                )}
              </div>
            </div>

            {/* Command Input */}
            <div className="flex gap-2">
              <span className="text-cyan-400">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && commandInput && handleCommand(commandInput)}
                placeholder="Type 'help' for commands..."
                disabled={processing}
                className="flex-1 bg-transparent text-gray-300 outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-400">
            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="text-gray-300 font-semibold mb-2">🎯 Batch Processing</div>
              <div>Optimize multiple images at once with queue management</div>
            </div>
            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="text-gray-300 font-semibold mb-2">⚙️ Custom Settings</div>
              <div>Adjust quality, format, and dimensions to your needs</div>
            </div>
            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="text-gray-300 font-semibold mb-2">💻 CLI Commands</div>
              <div>Control everything via terminal commands</div>
            </div>
            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="text-gray-300 font-semibold mb-2">📊 Real-time Stats</div>
              <div>See detailed compression results and savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}