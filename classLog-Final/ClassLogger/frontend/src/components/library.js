import React, { useState, useEffect } from 'react';
import './libray.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

const Library = () => {
    const [storedFiles, setStoredFiles] = useState(() => {
        const stored = localStorage.getItem('generatedFiles');
        return stored ? JSON.parse(stored) : [];
    });
    const [selectedFileContent, setSelectedFileContent] = useState(null);

    useEffect(() => {
        localStorage.setItem('generatedFiles', JSON.stringify(storedFiles));
    }, [storedFiles]);

     // Function to handle storing notes/quizzes after they are generated successfully
     const handleStoreFile = (id, heading, fileName, content) => {
        const newFile = {
            id: id, // Use the provided ID
            heading: heading,
            fileName: fileName,
            content: content,
            dateAdded: new Date().toLocaleString()
        };
        setStoredFiles((prevFiles) => [...prevFiles, newFile]);
    };


    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'generatedFiles') {
                const stored = localStorage.getItem('generatedFiles');
                if (stored) {
                    setStoredFiles(JSON.parse(stored));
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleViewClick = (file) => {
       setSelectedFileContent(file);
    };

    const handleClosePreview = () => {
        setSelectedFileContent(null);
    };
    
   const handleDeleteClick = (fileId) => {
    const updatedFiles = storedFiles.filter((file) => file.id !== fileId);
    setStoredFiles(updatedFiles);
    localStorage.setItem('generatedFiles', JSON.stringify(updatedFiles));
    if (selectedFileContent && selectedFileContent.id === fileId) {
      setSelectedFileContent(null);
     }
   };

    const renderers = {
        input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
                return (
                    <input
                        type="checkbox"
                        checked={checked || false}
                        readOnly
                        {...props}
                    />
                );
            }
            return <input {...props} />;
        },
    };

    return (
        <div className="library-page">
            <h1>Your Generated Files</h1>
            {storedFiles.length === 0 ? (
                <p>No files have been generated yet.</p>
            ) : (
                <ul className="file-list">
                    {storedFiles.map((file) => (
                        <li key={file.id} className="file-item">
                            <div className="file-details">
                                <span className="file-name">{file.heading}: {file.fileName}</span>
                                <span className="file-date">Added on: {file.dateAdded}</span>
                            </div>
                            <div className="button-container">
                                <button onClick={() => handleViewClick(file)} className="view-button">View</button>
                                <button onClick={() => handleDeleteClick(file.id)} className="delete-button">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {selectedFileContent && (
                <div className="preview-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedFileContent.heading}: {selectedFileContent.fileName}</h2>
                            <button onClick={handleClosePreview} className="close-button">
                                Close
                            </button>
                        </div>
                        <div className="modal-body scrollable-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={renderers}
                            >
                                {selectedFileContent.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;
