import { Bot, Keyboard } from "grammy";
import http from "http";
import * as dotenv from "dotenv";
import { MessageHandler } from "./handlers/message.handler";
import { CommandHandler } from "./handlers/command.handler";
import { OrderService } from "./utils/order.service";
import { StaffService } from "./utils/staff.service";
import { DraftOrderService } from "./utils/draft-order.service";
import { t } from "./utils/i18n";
import { DoctorService } from "./utils/doctor.service";
import { memoryService } from "./utils/memory.service";
import { logger } from "./utils/logger";
import { CronService } from "./utils/cron.service";
import { DistributionService } from "./services/distribution.service";
import { GmailPollingService } from "./services/gmail-polling.service";
import { CallbackHandler } from "./handlers/callback.handler";

// Çevresel değişkenleri yükle
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error(
    "❌ TELEGRAM_BOT_TOKEN bulunamadı! Lütfen .env dosyasını kontrol edin.",
  );
  process.exit(1);
}

// Bot ve Handler'ları başlatalım
const bot = new Bot(token);

// --- Hata Yönetimi (Global) ---
bot.catch((err) => {
  const ctx = err.ctx;
  const errorMsg = (err.error as any)?.message || String(err.error);
  const isCriticalError =
    /connection|token|database|auth|invalid|encontrado/i.test(errorMsg);

  logger.error(
    {
      error: err.error,
      update: ctx.update,
      userId: ctx.from?.id,
      isCritical: isCriticalError,
    },
    isCriticalError
      ? "🚨 KRİTİK Bot Hatası Yakalandı!"
      : "❌ Bot Hatası Yakalandı!",
  );

  // Kritik sistem hatalarında yöneticiye acil bildirim
  if (isCriticalError && bossId) {
    const criticalMsg = `🚨 <b>KRİTİK SİSTEM HATASI</b>\n\n<code>${errorMsg}</code>\n\n<i>Update ID: ${ctx.update?.update_id || "bilinmiyor"}</i>\n<i>User: ${ctx.from?.id || "bilinmiyor"}</i>`;
    bot.api
      .sendMessage(bossId, criticalMsg, { parse_mode: "HTML" })
      .catch(() => {});
  }

  // Kullanıcıya bilgi ver
  if (ctx.from) {
    bot.api
      .sendMessage(
        ctx.from.id,
        "⚠️ Üzgünüm, bir bağlantı hatası oluştu. Lütfen tekrar deneyin.",
      )
      .catch(() => {});
  }
});

const staffService = StaffService.getInstance();
const draftOrderService = DraftOrderService.getInstance();
const orderService = OrderService.getInstance();
const messageHandler = new MessageHandler();
const commandHandler = new CommandHandler();
const doctorService = new DoctorService();

// DistributionService — bossId ve marinaId tanımlandıktan sonra başlatılacak (aşağıda)

// Çevresel değişkenlerden ID'leri temizleyerek alalım
const bossIdsRaw = (process.env.TELEGRAM_BOSS_ID || "")
  .split(",")
  .map((id) => id.trim().replace(/['"]/g, ""))
  .filter((id) => id !== "");
const marinaIdsRaw = (process.env.TELEGRAM_MARINA_ID || "")
  .split(",")
  .map((id) => id.trim().replace(/['"]/g, ""))
  .filter((id) => id !== "");

// CRITICAL: Eğer Marina ID'si belirtilmemişse, yedek olarak BOSS_ID kullanıyoruz.
// Bu sayede butonlar 'undefined' bir ID'ye gitmeye çalışıp kaybolmaz.
const marinaId = Number(marinaIdsRaw[0]) || Number(bossIdsRaw[0]) || 0;
const bossId = Number(bossIdsRaw[0]) || 0;

console.log(`👤 Sistem Yöneticileri (Patronlar): ${bossIdsRaw.join(", ")}`);
console.log(`👤 Yönetici Asistanı (Marina): ${marinaId} (Yedek: ${bossId})`);

// Dağıtım Servisi Başlatma
const distributionService = new DistributionService(
  bot,
  orderService,
  staffService,
  bossId,
  marinaId,
);

// Güvenlik & Rol Yönetimi Katmanı
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const isBoss = staffService.isBoss(userId);
  const isCoordinator = staffService.isCoordinator(userId);
  let staffMember = staffService.getStaffByTelegramId(userId);

  // KRİTİK: Eğer kişi PATRON ise ama henüz veritabanında (staff.json) yoksa, OTOMATİK KAYDET.
  // Bu sayede Barış Bey asla 'Seni tanımıyorum' mesajı almaz.
  if (isBoss && !staffMember) {
    try {
      console.log(
        `🚀 [Patron Tanıma] Barış Bey (${userId}) sisteme otomatik kaydediliyor...`,
      );
      await staffService.registerStaff(
        userId,
        "Barış",
        "Yönetim",
        undefined,
        "SuperAdmin",
        "tr",
      );
      staffMember = staffService.getStaffByTelegramId(userId); // Tekrar çekelim
    } catch (regErr) {
      console.error(
        "⚠️ Patron otomatik kaydedilemedi, yerel veriyle devam ediliyor:",
        regErr,
      );
    }
  }

  const isRegisteredStaff = !!staffMember;
  const username = ctx.from?.username || "Bilinmiyor";

  // Context'e rol bilgisini ekleyelim
  (ctx as any).role = isBoss
    ? "boss"
    : isCoordinator
      ? "coordinator"
      : isRegisteredStaff
        ? "staff"
        : "guest";
  (ctx as any).staffInfo = staffMember;

  const text = ctx.message?.text || "";
  const isRegisterCommand = text.startsWith("/kayit");
  const isRemoveCommand = text.startsWith("/sil");
  const isStartCommand = text.startsWith("/start");

  // KRİTİK GÜVENLİK: Kayıt ve Silme sadece patrona açık
  if ((isRegisterCommand || isRemoveCommand) && !isBoss) {
    console.log(
      `🚫 ENGELLENDİ: Yetkisiz kayıt/silme denemesi. UserID=${userId}, Username=@${username}`,
    );
    return ctx.reply(
      "❌ Bu işlem sadece Barış Bey (Patron) tarafından gerçekleştirilebilir.",
    );
  }

  // Özel patron tanıma cümlesi (Fuzzy Match / Esnek Eşleşme - "ben barş", "ben baris" vb.)
  const normalizedText = text.toLowerCase().trim();
  const bossRegex = /ben\s*(bar[ıisş])|id\s*(kontro[l]*)/i;
  const isSpecialPhrase = bossRegex.test(normalizedText);

  if (isSpecialPhrase && isBoss) {
    if (!(await staffService.isBossRecognizedInMemory())) {
      await staffService.setBossRecognizedInMemory();
      return ctx.reply(
        `✅ **Sistem Sizi Tanıdı Barış Bey.**\n\n📌 **ID:** \`${userId}\`\n🛡️ **Rol:** \`SuperAdmin\`\n🌐 **Dil:** \`Türkçe (tr)\`\n\nBu tanışmayı hafızama kaydettim (memory.md). Sandaluci personeli artık otomatik selamlanmayacak, sadece size özel bir sistem kuruldu.`,
        { parse_mode: "Markdown" },
      );
    } else {
      return ctx.reply("Buyurun Barış Bey, sizi dinliyorum. 👋");
    }
  }

  if (isBoss || isRegisteredStaff || isRegisterCommand || isStartCommand) {
    return next();
  }

  // Yetkisiz erişim logu - Botun neden cevap vermediğini anlamak için kritik
  console.log(
    `⚠️  YETKİSİZ ERİŞİM: UserID=${userId}, Username=@${username}, Role=${(ctx as any).role}, Text=${ctx.message?.text || "Mesaj metni yok"}`,
  );

  // Yetkisiz erişim denemesi
  if (ctx.chat?.type === "private") {
    // Sadece /start komutuna cevap verelim, rastgele mesajlara "hoş geldiniz" demesin (Gizlilik kuralı)
    if (!isStartCommand) {
      console.log(
        `🔇 SESSİZ REDDEDİLDİ: GUEST user ${userId} mesajına cevap verilmedi.`,
      );
      return;
    }

    const userLangCode = ctx.from?.language_code === "ru" ? "ru" : "tr";
    const welcomeMsg = t("welcome_guest", userLangCode, {
      id: userId.toString(),
    });
    const btnLabel = t("btn_share_phone", userLangCode);

    const keyboard = new Keyboard()
      .requestContact(btnLabel)
      .oneTime()
      .resized();

    await ctx.reply(welcomeMsg, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }
});

// Komutlar
bot.command("start", (ctx) => commandHandler.handleStart(ctx));
bot.command("durum", (ctx) => commandHandler.handleDurum(ctx));
bot.command("ajanda", (ctx) => commandHandler.handleAjanda(ctx));
bot.command("personel", (ctx) => commandHandler.handleStaff(ctx));
bot.command("kayit", (ctx) => commandHandler.handleRegister(ctx));
bot.command("sil", (ctx) => commandHandler.handleRemoveStaff(ctx));
bot.command("dev", (ctx) => commandHandler.handleDev(ctx));
bot.command("test_briefing", (ctx) => commandHandler.handleTestBriefing(ctx));
bot.command("takip", (ctx) => commandHandler.handleTakip(ctx));
bot.command("temizlik", (ctx) => commandHandler.handleTemizlik(ctx));
bot.command("doctor", async (ctx) => {
  if ((ctx as any).role !== "boss") {
    return ctx.reply(
      "❌ Bu komut sadece Barış Bey (SuperAdmin) için yetkilendirilmiştir.",
    );
  }
  const statusMsg = await ctx.reply(
    "🩺 <b>Sistem damarları kontrol ediliyor...</b> Lütfen bekleyin.",
    { parse_mode: "HTML" },
  );
  const report = await doctorService.checkSystem();
  await bot.api.editMessageText(
    ctx.chat.id,
    statusMsg.message_id,
    `🩺 <b>Sistem Kontrol Raporu</b>\n\n${report}`,
    { parse_mode: "HTML" },
  );
});

// Mesaj Handlerı (Metin, Ses, Döküman ve Kişi desteği)
bot.on(
  ["message:text", "message:voice", "message:document", "message:contact"],
  (ctx) => messageHandler.handle(ctx),
);

// Callback Query Handlerı (Merkezi Mantık)
const callbackHandler = new CallbackHandler(
  bot,
  orderService,
  staffService,
  draftOrderService,
  distributionService,
  messageHandler,
);
callbackHandler.register();

/**
 * GMAIL VE SIPARIS FLOW KATMANI
 */
if (process.env.GMAIL_ENABLED !== "false") {
  const gmailPollingService = new GmailPollingService(
    bot,
    orderService,
    staffService,
    draftOrderService,
    distributionService,
    chatId || "",
    bossId,
    marinaId,
  );
  gmailPollingService.start();
}

// Sunucu Başlatma
const botEnabled = process.env.BOT_ENABLED !== "false";
if (botEnabled) {
  const httpPort = Number(process.env.PORT) || 3000;
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200);
      res.end("OK");
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(httpPort, "0.0.0.0", () => {
    console.log(`📡 Health check server on port ${httpPort}`);

    // Cron servisini başlat (Sabah brifingi, hatırlatıcılar vb.)
    try {
      const activeSupervisorId = marinaId || bossId;
      if (activeSupervisorId && activeSupervisorId !== 0) {
        const cronService = CronService.getInstance(bot, activeSupervisorId);
        cronService.init();
        console.log("⏰ Cron Service initialized and started.");
      } else {
        console.warn(
          "⚠️ Cron Service skipped: TELEGRAM_MARINA_ID and TELEGRAM_BOSS_ID missing.",
        );
      }
    } catch (cronErr) {
      console.error("❌ Cron Service start error:", cronErr);
    }

    // Bellek servisinin dizinlerini oluştur
    memoryService.initialize().catch((err) => {
      console.error("❌ Memory Service initialization error:", err);
    });

    // Botu başlat
    console.log("🚀 AYÇA BOT BAŞLATILIYOR... (Terminal Kontrol)");
    bot.start().catch((e) => console.error("Bot start error:", e));
  });
}
