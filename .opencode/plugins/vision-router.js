function hasVisualAttachment(parts = []) {
  return parts.some((part) => {
    if (part?.type !== "file") return false
    const mime = String(part.mime || "").toLowerCase()
    return mime.startsWith("image/") || mime === "application/pdf"
  })
}

function isDeepSeekModel(model) {
  return model?.providerID === "deepseek" || String(model?.modelID || "").toLowerCase().includes("deepseek")
}

export const VisionRouter = async () => {
  return {
    async "chat.message"(input, output) {
      if (!hasVisualAttachment(output.parts)) return
      const currentModel = input.model || output.message?.model
      if (!isDeepSeekModel(currentModel)) return

      output.message.model = {
        providerID: "google",
        modelID: "gemini-2.5-flash",
      }
    },
  }
}

export default VisionRouter
