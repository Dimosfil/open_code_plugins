import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const GATEWAY_IMAGE_MODEL = {
  providerID: "gateway",
  modelID: "gpt-4o",
}

const GEMINI_MODEL = {
  providerID: "google",
  modelID: "gemini-2.5-flash",
}

const CLAUDE_HAIKU_MODEL = {
  providerID: "anthropic",
  modelID: "claude-haiku-4-5",
}

const OPENAI_MINI_MODEL = {
  providerID: "openai",
  modelID: "gpt-5.4-mini",
}

const OPENAI_NANO_MODEL = {
  providerID: "openai",
  modelID: "gpt-5.4-nano",
}

const OPENROUTER_FREE_MODEL = {
  providerID: "openrouter",
  modelID: "openrouter/free",
}

const OPENROUTER_NEMOTRON_MODEL = {
  providerID: "openrouter",
  modelID: "nvidia/nemotron-nano-12b-v2-vl:free",
}

const IMAGE_MODEL = GEMINI_MODEL
const GEMINI_GENERATE_CONTENT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://10.0.236.10:1234/v1").replace(/\/+$/, "")
const LMSTUDIO_CHAT_COMPLETIONS_ENDPOINT = `${LMSTUDIO_BASE_URL}/chat/completions`
const LMSTUDIO_VISION_MODEL = process.env.LMSTUDIO_VISION_MODEL || "qwen/qwen3.5-9b"
const OPENROUTER_CHAT_COMPLETIONS_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_IMAGE_PROMPT = "Analyze the attached image. Extract visible text, UI errors, layout details, and important visual facts."
const VISION_EVIDENCE_HEADER = "Extracted facts from the attached image for this turn."

const OPENROUTER_NEMOTRON_OMNI_MODEL = {
  providerID: "openrouter",
  modelID: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
}

const PDF_MODEL = GEMINI_MODEL

const PRIMARY_TEXT_MODEL = {
  providerID: "deepseek",
  modelID: "deepseek-v4-pro",
}

function isPrimaryAgent(agent) {
  return String(agent || "").toLowerCase() === "loom"
}

function getPartMime(part) {
  return String(
    part?.mime ||
    part?.mediaType ||
    part?.contentType ||
    part?.file?.mime ||
    part?.file?.mediaType ||
    part?.file?.contentType ||
    part?.attachment?.mime ||
    part?.attachment?.mediaType ||
    part?.attachment?.contentType ||
    "",
  ).toLowerCase()
}

function getPartName(part) {
  return String(
    part?.filename ||
    part?.name ||
    part?.title ||
    part?.url ||
    part?.path ||
    part?.source ||
    part?.image_url?.url ||
    (typeof part?.image_url === "string" ? part.image_url : "") ||
    part?.image?.url ||
    part?.image?.path ||
    part?.file?.filename ||
    part?.file?.name ||
    part?.file?.url ||
    part?.file?.path ||
    part?.attachment?.filename ||
    part?.attachment?.name ||
    part?.attachment?.url ||
    part?.attachment?.path ||
    "",
  ).toLowerCase()
}

function getTextValue(value) {
  if (!value) return ""
  if (typeof value === "string") return value.trim()
  if (Array.isArray(value)) return value.map(getTextValue).filter(Boolean).join("\n\n")
  if (typeof value !== "object") return ""

  const type = String(value.type || "").toLowerCase()
  if (typeof value.text === "string") return value.text.trim()
  if (typeof value.content === "string") return value.content.trim()
  if (type === "text" && value.content) return getTextValue(value.content)
  if (Array.isArray(value.content)) return getTextValue(value.content)
  return ""
}

function getText(parts = []) {
  return parts.map(getTextValue).filter(Boolean).join("\n\n")
}

function isImagePart(part) {
  const partType = String(part?.type || "").toLowerCase()
  const mime = getPartMime(part)
  const name = getPartName(part)

  return (
    partType === "image" ||
    partType === "image_url" ||
    partType === "input_image" ||
    mime.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|tiff?)($|[?#])/.test(name)
  )
}

function isPdfPart(part) {
  const partType = String(part?.type || "").toLowerCase()
  const mime = getPartMime(part)
  const name = getPartName(part)

  return partType === "file" && (mime === "application/pdf" || /\.pdf($|[?#])/.test(name))
}

function uniqueParts(parts = []) {
  const seen = new Set()
  const result = []

  for (const part of parts) {
    if (!part) continue
    const key = JSON.stringify([
      part.type,
      part.text,
      part.content,
      part.mime,
      part.mediaType,
      part.contentType,
      part.filename,
      part.name,
      part.url,
      part.path,
      part.source,
      part.data,
    ])
    if (seen.has(key)) continue
    seen.add(key)
    result.push(part)
  }

  return result
}

function getMessageParts(input, output) {
  return uniqueParts([
    ...(Array.isArray(output?.parts) ? output.parts : []),
    ...(Array.isArray(input?.parts) ? input.parts : []),
    ...(Array.isArray(output?.message?.parts) ? output.message.parts : []),
    ...(Array.isArray(input?.message?.parts) ? input.message.parts : []),
    ...(Array.isArray(output?.message?.content) ? output.message.content : []),
    ...(Array.isArray(input?.message?.content) ? input.message.content : []),
    ...(Array.isArray(output?.content) ? output.content : []),
    ...(Array.isArray(input?.content) ? input.content : []),
    ...(Array.isArray(output?.attachments) ? output.attachments : []),
    ...(Array.isArray(input?.attachments) ? input.attachments : []),
    ...(Array.isArray(output?.message?.attachments) ? output.message.attachments : []),
    ...(Array.isArray(input?.message?.attachments) ? input.message.attachments : []),
    ...(Array.isArray(output?.experimental_attachments) ? output.experimental_attachments : []),
    ...(Array.isArray(input?.experimental_attachments) ? input.experimental_attachments : []),
    ...(Array.isArray(output?.message?.experimental_attachments) ? output.message.experimental_attachments : []),
    ...(Array.isArray(input?.message?.experimental_attachments) ? input.message.experimental_attachments : []),
    ...(getTextValue(input?.text) ? [{ type: "text", text: getTextValue(input.text) }] : []),
    ...(getTextValue(input?.message?.content) ? [{ type: "text", text: getTextValue(input.message.content) }] : []),
    ...(getTextValue(output?.message?.content) ? [{ type: "text", text: getTextValue(output.message.content) }] : []),
  ])
}

function getMessageText(input, output) {
  return getText(getMessageParts(input, output))
}

function getVisualKind(parts = []) {
  let hasPdf = false

  for (const part of parts) {
    if (isImagePart(part)) return "image"
    if (isPdfPart(part)) hasPdf = true
  }

  return hasPdf ? "pdf" : null
}

function modelMatches(model, target) {
  return model?.providerID === target.providerID && model?.modelID === target.modelID
}

async function partToImageUrl(part) {
  const rawUrl = (
    part?.url ||
    part?.path ||
    part?.source ||
    part?.data ||
    part?.image_url?.url ||
    (typeof part?.image_url === "string" ? part.image_url : "") ||
    part?.image?.url ||
    part?.image?.path ||
    part?.image?.source ||
    part?.image?.data ||
    part?.file?.url ||
    part?.file?.path ||
    part?.file?.source ||
    part?.file?.data ||
    part?.attachment?.url ||
    part?.attachment?.path ||
    part?.attachment?.source ||
    part?.attachment?.data
  )
  if (!rawUrl) throw new Error("Image attachment does not expose a URL or path")

  const value = String(rawUrl)
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  const filePath = value.startsWith("file://") ? fileURLToPath(value) : value
  const mime = getPartMime(part) || "image/png"
  const buffer = await readFile(filePath)
  return `data:${mime};base64,${buffer.toString("base64")}`
}

function extractText(value) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join("\n")

  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text
    if (typeof value.content === "string") return value.content
    if (Array.isArray(value.content)) return extractText(value.content)
    if (Array.isArray(value.parts)) return extractText(value.parts)
    if (Array.isArray(value.candidates)) return extractText(value.candidates.map((candidate) => candidate?.content))
    if (Array.isArray(value.choices)) return extractText(value.choices.map((choice) => choice?.message || choice?.delta))
  }

  return ""
}

function extractAssistantText(body) {
  const choices = Array.isArray(body?.choices) ? body.choices.map((choice) => choice?.message || choice?.delta) : []
  return (extractText(choices) || extractText(body)).trim()
}

function makeInternalVisionContext(analysis, userText) {
  return [
    VISION_EVIDENCE_HEADER,
    analysis.trim(),
    "",
    "Answer the user's request directly from these image facts. Use only the facts needed; do not describe this note or the processing step unless the user explicitly asks how the image was processed.",
    userText ? `\nUser request:\n${userText}` : "",
  ].filter(Boolean).join("\n")
}

function sanitizeFailure(error) {
  return String(error?.message || error || "Unknown vision routing failure")
    .replace(/Bearer\s+[^\s"]+/gi, "Bearer [redacted]")
    .replace(/GOOGLE_GENERATIVE_AI_API_KEY=[^\s"]+/gi, "GOOGLE_GENERATIVE_AI_API_KEY=[redacted]")
    .replace(/LMSTUDIO_API_KEY=[^\s"]+/gi, "LMSTUDIO_API_KEY=[redacted]")
    .replace(/OPENROUTER_API_KEY=[^\s"]+/gi, "OPENROUTER_API_KEY=[redacted]")
}

function makeVisionFailureContext(error, userText) {
  return [
    "Vision analysis failed before the final assistant model received the image.",
    `Reason: ${sanitizeFailure(error)}`,
    "",
    "Tell the user the screenshot was detected but could not be analyzed, include the reason above, and ask them to retry after fixing that specific issue. Do not claim that you cannot read images in general.",
    userText ? `\nUser request:\n${userText}` : "",
  ].filter(Boolean).join("\n")
}

async function callOpenRouterVision(parts, model = OPENROUTER_NEMOTRON_MODEL) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set")

  const userText = getText(parts)
  const content = [
    { type: "text", text: userText || DEFAULT_IMAGE_PROMPT },
  ]

  for (const image of parts.filter(isImagePart)) {
    content.push({
      type: "image_url",
      image_url: {
        url: await partToImageUrl(image),
      },
    })
  }

  const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_ENDPOINT, {
    method: "POST",
    signal: AbortSignal.timeout(120000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "OpenCode Vision Router",
    },
    body: JSON.stringify({
      model: model.modelID,
      messages: [{ role: "user", content }],
      max_tokens: 1200,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.error?.message || body?.message || response.statusText
    throw new Error(`OpenRouter vision request failed: ${detail}`)
  }

  const analysis = extractAssistantText(body)
  if (!analysis) throw new Error("OpenRouter vision request returned empty analysis")
  return { analysis, userText }
}

async function callOpenAICompatibleVision({ parts, endpoint, modelID, apiKey, providerName }) {
  const userText = getText(parts)
  const content = [
    { type: "text", text: userText || DEFAULT_IMAGE_PROMPT },
  ]

  for (const image of parts.filter(isImagePart)) {
    content.push({
      type: "image_url",
      image_url: {
        url: await partToImageUrl(image),
      },
    })
  }

  const headers = {
    "Content-Type": "application/json",
  }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const response = await fetch(endpoint, {
    method: "POST",
    signal: AbortSignal.timeout(120000),
    headers,
    body: JSON.stringify({
      model: modelID,
      messages: [{ role: "user", content }],
      max_tokens: 1200,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.error?.message || body?.message || response.statusText
    throw new Error(`${providerName} vision request failed: ${detail}`)
  }

  const analysis = extractAssistantText(body)
  if (!analysis) throw new Error(`${providerName} vision request returned empty analysis`)
  return { analysis, userText }
}

async function callLMStudioVision(parts) {
  return callOpenAICompatibleVision({
    parts,
    endpoint: LMSTUDIO_CHAT_COMPLETIONS_ENDPOINT,
    modelID: LMSTUDIO_VISION_MODEL,
    apiKey: process.env.LMSTUDIO_API_KEY,
    providerName: "LM Studio",
  })
}

async function partToGeminiInlineData(part) {
  const url = await partToImageUrl(part)
  const dataUrlMatch = /^data:([^;,]+)?(?:;[^,]*)?;base64,(.*)$/i.exec(url)
  if (dataUrlMatch) {
    return {
      inline_data: {
        mime_type: dataUrlMatch[1] || getPartMime(part) || "image/png",
        data: dataUrlMatch[2],
      },
    }
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(120000) })
  if (!response.ok) {
    throw new Error(`Gemini vision image fetch failed: ${response.status} ${response.statusText}`)
  }
  const mime = response.headers.get("content-type") || getPartMime(part) || "image/png"
  const buffer = Buffer.from(await response.arrayBuffer())
  return {
    inline_data: {
      mime_type: mime,
      data: buffer.toString("base64"),
    },
  }
}

async function callGeminiVision(parts) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY is not set")

  const userText = getText(parts)
  const requestParts = [
    { text: userText || DEFAULT_IMAGE_PROMPT },
  ]

  for (const image of parts.filter(isImagePart)) {
    requestParts.push(await partToGeminiInlineData(image))
  }

  const response = await fetch(GEMINI_GENERATE_CONTENT_ENDPOINT, {
    method: "POST",
    signal: AbortSignal.timeout(120000),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: requestParts }],
      generationConfig: {
        maxOutputTokens: 1200,
      },
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.error?.message || body?.message || response.statusText
    throw new Error(`Gemini vision request failed: ${detail}`)
  }

  const analysis = extractAssistantText(body)
  if (!analysis) throw new Error("Gemini vision request returned empty analysis")
  return { analysis, userText }
}

function shouldRouteFromModel(model, visualKind) {
  const providerID = String(model?.providerID || "").toLowerCase()
  const modelID = String(model?.modelID || "").toLowerCase()

  if (modelMatches(model, IMAGE_MODEL) || modelMatches(model, GATEWAY_IMAGE_MODEL)) return false
  if (visualKind === "pdf" && modelMatches(model, PDF_MODEL)) return false
  if (providerID === "deepseek" || modelID.includes("deepseek")) return true
  return visualKind === "image" && providerID === "google" && modelID === "gemini-2.5-flash"
}

function isVisionSelector(model) {
  return String(model?.providerID || "").toLowerCase() === "vision"
}

function getSelectedVisionModel(model, agent, visualKind) {
  if (isVisionSelector(model)) {
    const modelID = String(model?.modelID || "").toLowerCase()
    if (modelID === "gemini") return GEMINI_MODEL
    if (modelID === "claude-haiku" || modelID === "haiku") return CLAUDE_HAIKU_MODEL
    if (modelID === "openai-mini") return OPENAI_MINI_MODEL
    if (modelID === "openai-nano") return OPENAI_NANO_MODEL
    if (modelID === "openrouter-free" || modelID === "openrouter") return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_FREE_MODEL
    if (modelID === "nemotron" || modelID === "openrouter-nemotron") return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_NEMOTRON_MODEL
    if (modelID === "nemotron-omni" || modelID === "openrouter-nemotron-omni") return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_NEMOTRON_OMNI_MODEL
    if (modelID === "gpt-4o" || modelID === "gateway") return visualKind === "pdf" ? PDF_MODEL : GATEWAY_IMAGE_MODEL
  }

  return getAgentVisionModel(agent, visualKind)
}

function getAgentVisionModel(agent, visualKind) {
  const agentID = String(agent || "").toLowerCase()

  if (!agentID.includes("vision-")) return null
  if (agentID.includes("vision-gemini")) return GEMINI_MODEL
  if (agentID.includes("vision-claude-haiku") || agentID.includes("vision-haiku")) return CLAUDE_HAIKU_MODEL
  if (agentID.includes("vision-openai-mini")) return OPENAI_MINI_MODEL
  if (agentID.includes("vision-openai-nano")) return OPENAI_NANO_MODEL
  if (agentID.includes("vision-openrouter-free") || agentID.includes("vision-openrouter")) {
    return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_FREE_MODEL
  }
  if (agentID.includes("vision-nemotron-omni") || agentID.includes("vision-openrouter-nemotron-omni")) {
    return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_NEMOTRON_OMNI_MODEL
  }
  if (agentID.includes("vision-nemotron") || agentID.includes("vision-openrouter-nemotron")) {
    return visualKind === "pdf" ? PDF_MODEL : OPENROUTER_NEMOTRON_MODEL
  }
  if (agentID.includes("vision-gpt-4o") || agentID.includes("vision-gateway")) {
    return visualKind === "pdf" ? PDF_MODEL : GATEWAY_IMAGE_MODEL
  }

  return null
}

function setMessageModel(input, output, model) {
  input.model = { ...model }
  output.message.model = { ...model }
}

function modelWithImageInput(model) {
  const capabilities = model?.capabilities || {}
  const input = capabilities.input || {}
  return {
    ...model,
    capabilities: {
      ...capabilities,
      attachment: true,
      input: {
        ...input,
        text: true,
        image: true,
        audio: Boolean(input.audio),
        video: Boolean(input.video),
        pdf: Boolean(input.pdf),
      },
    },
  }
}

function setAllMessageParts(input, output, parts) {
  input.parts = parts
  output.parts = parts
  input.message = input.message || {}
  output.message = output.message || {}
  input.message.parts = parts
  output.message.parts = parts
}

function ensureTextPart(input, output, visualKind, messageParts = getMessageParts(input, output)) {
  if (getText(messageParts)) {
    setAllMessageParts(input, output, messageParts)
    return
  }

  const text = getMessageText(input, output) || (visualKind === "pdf"
    ? "The user sent a PDF attachment without text. Analyze the attachment and answer the user's request."
    : "The user sent an image without text. Analyze the image and answer the user's request.")

  setAllMessageParts(input, output, [
    {
      type: "text",
      text,
    },
    ...messageParts,
  ])
}

async function analyzeImagePartsToTextPart(parts) {
  try {
    const { analysis, userText } = await callGeminiVision(parts)
    return {
      type: "text",
      text: makeInternalVisionContext(analysis, userText),
    }
  } catch (geminiError) {
    try {
      const { analysis, userText } = await callLMStudioVision(parts)
      return {
        type: "text",
        text: makeInternalVisionContext(analysis, userText),
      }
    } catch (lmStudioError) {
      try {
        const { analysis, userText } = await callOpenRouterVision(parts, OPENROUTER_NEMOTRON_MODEL)
        return {
          type: "text",
          text: makeInternalVisionContext(analysis, userText),
        }
      } catch (openRouterError) {
        const error = new Error([
          `Gemini primary failed: ${sanitizeFailure(geminiError)}`,
          `LM Studio fallback failed: ${sanitizeFailure(lmStudioError)}`,
          `OpenRouter fallback failed: ${sanitizeFailure(openRouterError)}`,
        ].join(" | "))
        return {
          type: "text",
          text: makeVisionFailureContext(error, getText(parts)),
        }
      }
    }
  }
}

function shouldAnalyzeImageToText(model) {
  return (
    modelMatches(model, IMAGE_MODEL) ||
    modelMatches(model, GEMINI_MODEL) ||
    modelMatches(model, OPENROUTER_NEMOTRON_MODEL)
  )
}

export const VisionRouter = async () => {
  return {
    provider: {
      id: "deepseek",
      async models(provider) {
        const models = {}
        for (const [id, model] of Object.entries(provider?.models || {})) {
          models[id] = id === PRIMARY_TEXT_MODEL.modelID || id.includes("deepseek")
            ? modelWithImageInput(model)
            : model
        }
        return models
      },
    },

    async "experimental.chat.messages.transform"(_input, output) {
      for (const message of output.messages || []) {
        const parts = Array.isArray(message?.parts) ? message.parts : []
        if (getVisualKind(parts) !== "image") continue
        message.parts = [await analyzeImagePartsToTextPart(parts)]
      }
    },

    async "chat.message"(input, output) {
      const messageParts = getMessageParts(input, output)
      const visualKind = getVisualKind(messageParts)
      const currentModel = input.model || output.message?.model
      if (!visualKind) {
        if (isVisionSelector(currentModel) || (isPrimaryAgent(input.agent) && modelMatches(currentModel, IMAGE_MODEL))) {
          setMessageModel(input, output, PRIMARY_TEXT_MODEL)
        }
        return
      }

      const selectedVisionModel = getSelectedVisionModel(currentModel, input.agent, visualKind)
      const imageTextAnalysisTarget = visualKind === "image" && (
        (selectedVisionModel && shouldAnalyzeImageToText(selectedVisionModel)) ||
        shouldAnalyzeImageToText(currentModel)
      )
      if (imageTextAnalysisTarget) {
        setAllMessageParts(input, output, [await analyzeImagePartsToTextPart(messageParts)])
        setMessageModel(input, output, PRIMARY_TEXT_MODEL)
        return
      }
      if (selectedVisionModel && modelMatches(currentModel, selectedVisionModel)) {
        ensureTextPart(input, output, visualKind, messageParts)
        return
      }
      if (!selectedVisionModel && ((modelMatches(currentModel, IMAGE_MODEL) || modelMatches(currentModel, GATEWAY_IMAGE_MODEL)) || (visualKind === "pdf" && modelMatches(currentModel, PDF_MODEL)))) {
        ensureTextPart(input, output, visualKind, messageParts)
        return
      }
      if (!selectedVisionModel && !shouldRouteFromModel(currentModel, visualKind)) return

      ensureTextPart(input, output, visualKind, messageParts)
      const targetModel = selectedVisionModel || (visualKind === "image" ? IMAGE_MODEL : PDF_MODEL)
      if (visualKind === "image" && shouldAnalyzeImageToText(targetModel)) {
        setAllMessageParts(input, output, [await analyzeImagePartsToTextPart(messageParts)])
        setMessageModel(input, output, PRIMARY_TEXT_MODEL)
        return
      }
      setMessageModel(input, output, targetModel)
    },
  }
}

export const server = VisionRouter
export default VisionRouter
