import React, { useState } from 'react';
import axios from 'axios';
import './NotePage.css';

const NotePage = () => {
    const [transcript, setTranscript] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedNotes, setGeneratedNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateNotes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8080/notes', { // Changed port to 8080
                User_prompt: userPrompt,
                Transcript: transcript
            });
            setGeneratedNotes(response.data.notes_content);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="note-page">
            <h1>Generate Notes</h1>
            <div className="note-inputs">
                <textarea 
                    placeholder="Paste your lecture transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows="10"
                    cols="50"
                    aria-label="Lecture Transcript"
                />
                <textarea 
                    placeholder="Enter your note requirements here..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows="5"
                    cols="50"
                    aria-label="Note Requirements"
                />
                <button onClick={handleGenerateNotes} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Notes'}
                </button>
                {error && <p className="error">{error}</p>}
            </div>
            {generatedNotes && (
                <div className="generated-notes">
                    <h2>Generated Notes</h2>
                    <div dangerouslySetInnerHTML={{ __html: generatedNotes }} />
                </div>
            )}
        </div>
    );
};

export default NotePage;