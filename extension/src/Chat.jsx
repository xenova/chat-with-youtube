
import { useChat } from 'ai/react'
import { useEffect, useRef } from 'react';

// NOTE: If deploying remotely, change this to the server's URL.
const CHAT_API_ENDPOINT = 'http://localhost:3000/api/chat';

export default function Chat({
    info: { transcript, metadata }
}) {

    // Parse the transcript into a single string
    const parsed = transcript.events
        // Remove invalid segments
        .filter(x => x.segs)

        // Concatenate into single long string
        .map(x => x.segs
            .map(y => y.utf8).join(' ')
        ).join(' ')

        // Remove invalid characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')

        // Replace any whitespace with a single space
        .replace(/\s+/g, ' ');

    // The useChat hook handles the chat logic.
    // See https://sdk.vercel.ai/docs/api-reference/use-chat for more information.
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        // The API endpoint to send messages to
        api: CHAT_API_ENDPOINT,

        // Add system prompt
        initialMessages: [{
            // https://huggingface.co/blog/llama2#how-to-prompt-llama-2
            id: '0',
            role: 'system',
            content: [
                'You are a helpful assistant. Given the metadata and transcript of a YouTube video, your purpose is to answer any questions that follow.',
                '',
                'START OF METADATA',
                `Author: ${metadata.author}`,
                `Title: ${metadata.title}`,
                'END OF METADATA',
                '',
                'START OF TRANSCRIPT',
                parsed,
                'END OF TRANSCRIPT',
            ].join('\n'),
        }]
    })

    // Create a reference to the conversation container
    const conversationContainer = useRef(null);

    // Update the scrollbar (to the bottom) on message update
    useEffect(() => {
        const elem = conversationContainer.current;
        if (elem) {
            elem.scrollTo({ top: elem.scrollHeight });
        }
    }, [messages])

    return (
        <div className='chat-with-youtube-container' >
            <div className='cwy-label'>Chat with YouTube</div>
            <div ref={conversationContainer} className='cwy-conversation-container'>
                {messages
                    .filter(x => x.role !== 'system') // Skip system messages
                    .map(m => (
                        <div key={m.id} className={`message message-${m.role}`}>
                            {m.content}
                        </div>
                    ))
                }
            </div>

            <form className='cwy-form' onSubmit={handleSubmit}>
                <input
                    className='cwy-textbox'
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    )
}