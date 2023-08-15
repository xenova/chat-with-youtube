# Chat with YouTube

Introducing **Chat with YouTube**, a browser extension that lets you chat with YouTube videos! This is a small project that demonstrates how easy it is to build conversational browser extensions using [Hugging Face Inference Endpoints](https://huggingface.co/inference-endpoints) and the [Vercel AI SDK](https://sdk.vercel.ai/docs/guides/providers/hugging-face).

![Demo Application](https://github.com/xenova/chat-with-youtube/assets/26504141/d7995856-0f8c-42bb-aa4a-ed94cf80d0ae)


Since the license is MIT, feel free to [fork](https://github.com/xenova/chat-with-youtube/fork) the project, make improvements, and release it yourself on the Chrome/Firefox Web Store!


## Running Locally

We recommend opening up two terminal windows side-by-side, one for the server and one for the extension.

1. Clone the repository
    ```bash
    git clone https://github.com/xenova/chat-with-youtube.git
    ```

1. Set up the server
    
    1. Switch to the `server` directory:

        ```bash
        cd server
        ```

    1. Install the necessary dependencies:

        ```bash
        npm install
        ```

    1. Create a file `.env.local` with your Hugging Face Access Token and Inference Endpoint URL. See `.env.local.example` for an example. If you haven't got these yet, this [guide](https://huggingface.co/inference-endpoints) will help you get started.

        ```bash
        HUGGINGFACE_API_KEY=hf_xxx
        HUGGINGFACE_INFERENCE_ENDPOINT_URL=https://YOUR_ENDPOINT.endpoints.huggingface.cloud
        ```

    1. Start the server:

        ```bash
        npm run dev
        ```


1. Set up the extension
    1. Switch to the `extension` folder:
        ```bash
        cd extension
        ```

    1. Install the necessary dependencies:
        ```bash
        npm install 
        ```

    1. Build the project:
        ```bash
        npm run build 
        ```

    1. Add the extension to your browser. To do this, go to `chrome://extensions/`, enable developer mode (top right), and click "Load unpacked". Select the `build` directory from the dialog which appears and click "Select Folder".

    1. That's it! You should now be able to open the extenion's popup and use the model in your browser!

## How does it work?

Well, it's quite simple actually: just add the transcript and video metadata to the prompt for additional context. For this demo, we use [Llama-2-7b-hf](meta-llama/Llama-2-7b-hf), which has a context length of 4096 tokens, and can easily handle most videos. Of course, for longer videos, it would be best to implement segmentation and retrieval augmented generation, but that's beyond the scope of this project.
