import fs from "fs";
import path from "path";
import os from "os";
import { Context } from "grammy";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

export class VoiceService {
  private openai: OpenAI | null = null;
  private readonly MODEL = "openai/whisper-large-v3"; // OpenRouter üzerindeki kararlı Whisper modeli

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    
    if (apiKey) {
      logger.info(
        { keyStart: apiKey.substring(0, 8) + "..." }, 
        "🔑 OpenRouter API (Voice) yüklendi."
      );
      this.openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
    } else {
      logger.error("❌ OPENROUTER_API_KEY bulunamadı!");
    }
  }

  public async transcribeVoiceMessage(
    ctx: Context,
    fileId: string,
    lang: string = "auto",
  ): Promise<string | null> {
    if (!this.openai) {
      logger.error("❌ OpenRouter API eksik! Sesli mesaj işlenemez.");
      return null;
    }

    let tempFilePath: string | null = null;
    try {
      logger.info({ fileId }, "🎙️ Sesli mesaj indirme başladı...");
      
      const file = await ctx.api.getFile(fileId);
      if (!file.file_path) throw new Error("Telegram dosya yolu bulunamadı");

      // Geçici dosya yolu
      const tempFileName = `voice_${Date.now()}_${fileId}.ogg`;
      tempFilePath = path.join(os.tmpdir(), tempFileName);

      // Telegram'dan dosyayı indir
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      
      const downloadFile = (url: string, dest: string) => {
        return new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(dest);
          const https = require('https');
          https.get(url, (res: any) => {
            if (res.statusCode !== 200) {
              reject(new Error(`Download failed: ${res.statusCode}`));
              return;
            }
            res.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              resolve(true);
            });
          }).on('error', (err: any) => {
            fs.unlink(dest, () => {});
            reject(err);
          });
        });
      };

      await downloadFile(fileUrl, tempFilePath);
      
      const buffer = fs.readFileSync(tempFilePath);
      logger.info({ tempFilePath, size: buffer.length }, "📁 Ses dosyası hazır. OpenRouter Whisper'a gönderiliyor...");

      // OpenRouter üzerinden Whisper ile çeviri
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: this.MODEL,
        language: lang === "auto" ? undefined : lang,
        response_format: "json",
      });

      if (transcription.text) {
        logger.info({ text: transcription.text.substring(0, 50) + "..." }, "✅ Transcription başarılı (OpenRouter).");
        return transcription.text;
      }

      logger.warn("⚠️ Transcription metin döndürmedi.");
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      logger.error({ 
        error: errorMessage,
        status: error.status,
        fileId 
      }, "❌ Sesli mesaj çeviri hatası (OpenRouter)");
      return null;
    } finally {
      // Temizlik
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          logger.warn({ error: e }, "Geçici dosya silinemedi");
        }
      }
    }
  }
}
