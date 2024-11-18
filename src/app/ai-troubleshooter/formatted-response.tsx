import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FormattedResponseProps {
  content: string;
}

const FormattedResponse: React.FC<FormattedResponseProps> = ({ content }) => {
  return (
    <div className="formatted-response">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default FormattedResponse;
