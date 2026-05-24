import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { tool } from "@opencode-ai/plugin"

const DEFAULT_MODEL = "gpt-image-2"
const DEFAULT_SIZE = "1536x1024"
const DEFAULT_QUALITY = "medium"
const DEFAULT_FORMAT = "png"

function slugify(value) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
  return cleaned || "image"
}

function ensureInside(baseDir, targetPath) {
  const relative = path.relative(baseDir, targetPath)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Output path must stay inside the project directory")
  }
}

async function callOpenAIImages(args, abort) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your environment or connect OpenAI before generating images.")
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    signal: abort,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: args.model || DEFAULT_MODEL,
      prompt: args.prompt,
      size: args.size || DEFAULT_SIZE,
      quality: args.quality || DEFAULT_QUALITY,
      output_format: args.format || DEFAULT_FORMAT,
      background: args.background || "auto",
      n: 1,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body?.error?.message || response.statusText
    throw new Error(`OpenAI image generation failed: ${detail}`)
  }

  const item = body?.data?.[0]
  if (item?.b64_json) {
    return Buffer.from(item.b64_json, "base64")
  }

  if (item?.url) {
    const imageResponse = await fetch(item.url, { signal: abort })
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.statusText}`)
    }
    return Buffer.from(await imageResponse.arrayBuffer())
  }

  throw new Error("OpenAI did not return an image payload")
}

export const OpenAIImageTools = async () => {
  return {
    tool: {
      generate_image: tool({
        description:
          "Generate an image, screenshot-like mockup, UI visual, diagram, or illustration with OpenAI GPT Image and save it as a local file.",
        args: {
          prompt: tool.schema.string().min(1).describe("Detailed image prompt. Include UI text, layout, style, and target use."),
          filename: tool.schema
            .string()
            .optional()
            .describe("Optional filename without a directory. The file is saved under .opencode/generated-images/."),
          model: tool.schema.string().optional().default(DEFAULT_MODEL).describe("OpenAI image model, default gpt-image-2."),
          size: tool.schema
            .enum(["1024x1024", "1024x1536", "1536x1024", "auto"])
            .optional()
            .default(DEFAULT_SIZE)
            .describe("Generated image size."),
          quality: tool.schema.enum(["low", "medium", "high", "auto"]).optional().default(DEFAULT_QUALITY),
          format: tool.schema.enum(["png", "webp", "jpeg"]).optional().default(DEFAULT_FORMAT),
          background: tool.schema.enum(["auto", "transparent", "opaque"]).optional().default("auto"),
        },
        async execute(args, context) {
          const directory = context.directory || context.worktree || process.cwd()
          const outputDir = path.join(directory, ".opencode", "generated-images")
          await mkdir(outputDir, { recursive: true })

          const ext = args.format || DEFAULT_FORMAT
          const basename = args.filename
            ? path.basename(args.filename).replace(/\.[^.]+$/, "")
            : `${new Date().toISOString().replace(/[:.]/g, "-")}-${slugify(args.prompt)}`
          const outputPath = path.join(outputDir, `${basename}.${ext}`)
          ensureInside(outputDir, outputPath)

          context.metadata({
            title: "Generating image",
            metadata: {
              model: args.model || DEFAULT_MODEL,
              size: args.size || DEFAULT_SIZE,
              quality: args.quality || DEFAULT_QUALITY,
              output: outputPath,
            },
          })

          const image = await callOpenAIImages(args, context.abort)
          await writeFile(outputPath, image)

          return {
            title: "Generated image",
            output: `Generated image saved to ${outputPath}`,
            metadata: {
              path: outputPath,
              model: args.model || DEFAULT_MODEL,
              size: args.size || DEFAULT_SIZE,
              quality: args.quality || DEFAULT_QUALITY,
              format: ext,
            },
            attachments: [
              {
                type: "file",
                mime: ext === "jpeg" ? "image/jpeg" : `image/${ext}`,
                url: pathToFileURL(outputPath).href,
                filename: path.basename(outputPath),
              },
            ],
          }
        },
      }),
    },
  }
}
