import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, FileText, Eye, EyeOff } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import './PDFPreview.css';
import { Rings } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';

const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi', icon: 'ह' },
    { label: 'Telugu', value: 'te', icon: 'తె' },
    // Add more language options here
];

const PDFPreview = ({ pdfFileName = 'file.md', heading }) => {
    const { lectureId } = useParams();
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const [mdFileContent, setMdFileContent] = useState('');
    const [messages, setMessages] = useState([
        {
            text: `Hey Teach, here is the current ${heading.toLowerCase()}. What changes would you like me to make?`,
            sender: "bot",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetchedInitialContent, setHasFetchedInitialContent] = useState(false);
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState('en');
     const [languageChangeTrigger, setLanguageChangeTrigger] = useState(0);
    const initialMessagesRef = useRef(messages);


    const preprocessContentForPageBreaks = (content) => {
        return content.replace(/(---PAGEBREAK---)/g, '<div style="page-break-before: always;"></div>');
    };

    const handleDownload = () => {
        const processedContent = preprocessContentForPageBreaks(mdFileContent);
        const htmlContent = marked(processedContent);

        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        element.style.maxWidth = '800px';
        element.style.margin = '0 auto';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';

        const options = {
            margin: 10,
            filename: pdfFileName.replace('.md', '.pdf'),
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, scrollY: 0 },
            jsPDF: { unit: 'pt', orientation: 'portrait' },
        };

         html2pdf().from(element).set(options).save();

        const stored = localStorage.getItem('generatedFiles');
        const existingFiles = stored ? JSON.parse(stored) : [];
        const newFileId = uuidv4()
        const newFile = {
            id: newFileId, // generate unique ID
            heading:heading,
            fileName: pdfFileName.replace('.md', '.pdf'),
            content: mdFileContent,
            dateAdded: new Date().toLocaleString()
        };
        const updatedFiles = [...existingFiles, newFile];
        localStorage.setItem('generatedFiles', JSON.stringify(updatedFiles));
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

    const togglePreview = () => {
        setIsPreviewVisible(!isPreviewVisible);
    };

     const handleLibraryClick = () => {
        navigate('/library');
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const handleLanguageIconClick = (lang) => {
       setSelectedLanguage(lang);
        setLanguageChangeTrigger(prev => prev + 1);
    };

    const translateMessage = async (text, targetLanguage) => {
        if (targetLanguage === 'en') return text; // No translation needed for English
        try {
             const response = await fetch(`http://localhost:8080/translate?text=${text}&target=${targetLanguage}`, {
                 method: 'GET',
                 headers: {
                     'Content-Type': 'application/json',
                 }
              });
             const data = await response.json();
                if(response.ok && data.translated_text) {
                     return data.translated_text;
                  } else {
                       console.error("Failed to translate the message:", data.message);
                       return text;
                 }

        } catch (error) {
            console.error("Error during translation:", error);
            return text; // Return original text if translation fails
        }
    };

    const getContent = async () => {
       setIsLoading(true);
        try {
            console.log(`Fetching content for lectureId: ${lectureId}, heading: ${heading}, language: ${selectedLanguage}`);
           
             const apiUrl =
                heading === "Generate Quiz"
                    ? `http://localhost:8080/get_quiz?id=${lectureId}&language=${selectedLanguage}`
                    : `http://localhost:8080/get_notes?id=${lectureId}&language=${selectedLanguage}`;


            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                const content = heading === "Generate Quiz"
                    ? data.quiz_content || "No quiz content available."
                    : data.notes_content || "No notes content available.";

                console.log("Content fetched successfully:", content);
                setMdFileContent(content);
            } else {
                console.error("Failed to fetch content:", data.message);
                setMdFileContent(`Error: ${data.message || "Unable to retrieve content"}`);
            }
        } catch (error) {
            console.error("Error during API call:", error);
            setMdFileContent("An error occurred while fetching content. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


     useEffect(() => {
      const translateInitialMessages = async () => {
        const translated = await Promise.all(initialMessagesRef.current.map(async (msg) => {
            const translatedText = await translateMessage(msg.text, selectedLanguage);
            return { ...msg, text: translatedText };
        }));
        setMessages(translated);
        };
        translateInitialMessages();
     }, [selectedLanguage, languageChangeTrigger]);


    const handleSendMessage = async () => {
         if (input.trim() === '') return;
         setIsLoading(true);
        let translatedInput;
        let translatedResponse;
      try {
           translatedInput = await translateMessage(input, selectedLanguage);

           const newMessages = [...messages, { text: translatedInput, sender: "user" }];
            setMessages(newMessages);
             setInput('');

              console.log(`Sending message for lectureId: ${lectureId}, heading: ${heading}`);
            const apiData = {
                User_prompt: translatedInput,
                Transcript: mdFileContent, // Use the current content
                Last_quiz: mdFileContent,
                notes_id: lectureId,
                quiz_id: lectureId,
                language: selectedLanguage // Add selected language to API request
            };

            const apiEndpoint =
                heading === "Generate Quiz"
                    ? "http://localhost:8080/quiz"
                    : "http://localhost:8080/notes";

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(apiData),
            });

            const data = await response.json();

            if (response.ok) {
               const updatedContent = heading === "Generate Quiz"
                    ? data.quiz_content
                    : data.notes_content;

               translatedResponse = await translateMessage(`Here's the updated ${heading.toLowerCase()} based on your request.`, selectedLanguage);
              setMessages([...newMessages,{
                        text: translatedResponse,
                        sender: "bot",
                    },]);
                console.log("Content updated successfully:", updatedContent);
                 setMdFileContent(updatedContent);

            } else {
                 translatedResponse =  await translateMessage(`Sorry, I couldn't process your request: ${data.message || "Unknown error"}`, selectedLanguage);
                   setMessages([...newMessages,{
                       text: translatedResponse,
                        sender: "bot",
                    },]);
                console.error("Failed to update content:", data.message);
            }
        } catch (error) {
             translatedResponse =  await translateMessage("An error occurred. Please try again later.", selectedLanguage);
             setMessages([...messages, {
                    text: translatedResponse,
                        sender: "bot",
                  }]);
           console.error("Error:", error);

       } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (lectureId && !hasFetchedInitialContent) {
            console.log("useEffect triggered, calling getContent");
            getContent();
            setHasFetchedInitialContent(true);
        }
          if (lectureId) {
            getContent();
        }
    }, [lectureId, heading, hasFetchedInitialContent, selectedLanguage, languageChangeTrigger]);

    return (
         <div className="pdf-preview-container">
            <div className="max-w-md mx-auto">
                <h1 className="heading">{heading}</h1>
                <Card className="pdf-card">
                    <CardHeader className="pdf-card-header">
                        <CardTitle className="pdf-card-title">{heading}</CardTitle>
                        <div className="icon-buttons">
                            {languageOptions
                                .filter((option) => option.icon)
                                .map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleLanguageIconClick(option.value)}
                                        className="icon-button language-icon"
                                        title={`Translate to ${option.label}`}
                                    >
                                        {option.icon}
                                    </button>
                                ))}
                            <button onClick={handleLibraryClick} className="icon-button" title="Go to Library">
                                Library
                            </button>
                            <button
                                onClick={togglePreview}
                                className="icon-button"
                                title={isPreviewVisible ? "Hide Preview" : "Show Preview"}
                            >
                                {isPreviewVisible ? <Eye className="icon" /> : <EyeOff className="icon" />}
                            </button>
                            <button onClick={handleDownload} className="icon-button" title="Download PDF">
                                <Download className="icon" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="scrollable-container">
                            {isPreviewVisible && (
                                <div className="markdown-content pdf-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={renderers}
                                    >
                                        {mdFileContent}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="chat-containers">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat-bubble ${message.sender === "bot" ? "assistant" : "user"}`}
                        >
                            <p>{message.text}</p>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="loader-container">
                            <Rings color="#00BFFF" height={80} width={80} />
                        </div>
                    )}

                    <div className="input-container">
                        <input
                            type="text"
                            placeholder={`Message ${heading}`}
                            className="input-field"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="send-button">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFPreview;
