import { HfInferenceEndpoint } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
import { experimental_buildLlama2Prompt } from 'ai/prompts'

// Create a new HuggingFace Inference instance
// For more information, see https://sdk.vercel.ai/docs/guides/providers/huggingface#guide-using-production-ready-inference-endpoints
const Hf = new HfInferenceEndpoint(
  process.env.HUGGINGFACE_INFERENCE_ENDPOINT_URL!,
  process.env.HUGGINGFACE_API_KEY
)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Create a text generation stream
  const response = Hf.textGenerationStream({
    // @ts-ignore
    model: 'meta-llama/Llama-2-7b-chat-hf',
    inputs: experimental_buildLlama2Prompt(messages),
    parameters: {
      max_new_tokens: 500,
      repetition_penalty: 1,
      truncate: 4000,
      return_full_text: false
    }
  })

  // Convert the response into a friendly text-stream
  const stream = HuggingFaceStream(response)

  // Respond with the stream
  return new StreamingTextResponse(stream, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
    }
  })
}
