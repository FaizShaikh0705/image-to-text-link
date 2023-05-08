import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import Dropzone from 'react-dropzone';

const ImageToTextConverter = () => {
    const [result, setResult] = useState('');
    // const [redirectLink, setRedirectLink] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default language is English
    const [linkText, setLinkText] = useState('');

    const handleDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            convertImageToText(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const convertImageToText = async (imageUrl) => {
        const { data } = await Tesseract.recognize(imageUrl, 'eng');
        const extractedText = data.text.trim();
        setResult(extractedText);
        // setRedirectLink(getRedirectLink(extractedText));
        findLinkText(extractedText);
    };

    // const getRedirectLink = (text) => {
    //     // Implement your logic to generate the redirect link based on the extracted text
    //     // Here's a simple example that generates a Google search link
    //     const encodedText = encodeURIComponent(text);
    //     return `https://www.google.com/search?q=${encodedText}`;
    // };

    const findLinkText = (text) => {
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(regex);
        if (matches && matches.length > 0) {
            const linkText = matches[0];
            setLinkText(linkText);
            const encodedText = encodeURIComponent(text);
            return `https://www.google.com/search?q=${encodedText}`;
        } else {
            setLinkText('');
        }
    };

    const handleTranslate = async () => {
        try {
            const response = await fetch(
                `https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY&q=${encodeURIComponent(
                    result
                )}&target=${selectedLanguage}`
            );
            const { data } = await response.json();
            const translatedText = data.translations[0].translatedText;
            setTranslatedText(translatedText);
        } catch (error) {
            console.error('Translation error:', error);
        }
    };

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    return (
        <div>
            <h1>Image to Text Converter</h1>
            <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone">
                        <input {...getInputProps()} />
                        <p>Drag and drop an image here, or click to select a file</p>
                    </div>
                )}
            </Dropzone>
            {result && (
                <div>
                    <h2>Result:</h2>
                    <p>{result}</p>
                    {linkText && (
                        <div>
                        <h3>Link Found:</h3>
                        <a href={linkText} target="_blank" rel="noopener noreferrer">
                          {linkText}
                        </a>
                      </div>
                    )}
                    <div>
                        <label htmlFor="language">Translate to:</label>
                        <select id="language" value={selectedLanguage} onChange={handleLanguageChange}>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            {/* Add more language options as needed */}
                        </select>
                        <button onClick={handleTranslate}>Translate</button>
                    </div>
                    {translatedText && (
                        <div>
                            <h2>Translated Text:</h2>
                            <p>{translatedText}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageToTextConverter;