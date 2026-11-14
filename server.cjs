var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_web_push = __toESM(require("web-push"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_mercadopago = require("mercadopago");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/firebase.ts
var import_app = require("firebase/app");
var import_auth = require("firebase/auth");
var import_firestore = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "stalwart-micron-388923",
  appId: "1:923834893652:web:32a13158885a276f04f4c1",
  apiKey: "AIzaSyB_KAGhy3rQojO0fyAUWehaLoWNQxxHLMY",
  authDomain: "stalwart-micron-388923.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-24388a85-48b3-4d7c-ada6-78d81ace2fe5",
  storageBucket: "stalwart-micron-388923.firebasestorage.app",
  messagingSenderId: "923834893652",
  measurementId: ""
};

// src/firebase.ts
var app = (0, import_app.initializeApp)(firebase_applet_config_default);
var db = (0, import_firestore.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId);
var auth = (0, import_auth.getAuth)();
async function testConnection() {
  try {
    await (0, import_firestore.getDocFromServer)((0, import_firestore.doc)(db, "settings", "exchangeRate"));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. The client is offline.");
    } else {
      console.error("Firestore connection test error:", error);
    }
  }
}
testConnection();

// server.ts
var import_firestore2 = require("firebase/firestore");
import_dotenv.default.config();
process.on("uncaughtException", (err) => {
  console.error("[SERVER] Uncaught Exception (prevented crash):", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[SERVER] Unhandled Rejection (prevented crash):", reason);
});
async function startServer() {
  const app2 = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app2.use(import_express.default.json({ limit: "50mb" }));
  app2.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app2.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  const getMpClient = async () => {
    let token = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
    if (!token || token === "123456" || token === "TEST_TOKEN") {
      try {
        const snap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "settings", "mercadopago"));
        if (snap.exists() && snap.data()?.accessToken) {
          token = snap.data().accessToken;
        }
      } catch (err) {
        console.warn("[MP] N\xE3o foi poss\xEDvel consultar token no Firestore:", err);
      }
    }
    if (!token || token === "123456" || token === "TEST_TOKEN") {
      return null;
    }
    return {
      client: new import_mercadopago.MercadoPagoConfig({ accessToken: token }),
      token
    };
  };
  const geminiKey = process.env.GEMINI_API_KEY || "";
  console.log("-----------------------------------------");
  console.log("\u{1F6F0}\uFE0F MONITORAMENTO DE CONFIGURA\xC7\xC3O:");
  console.log("Gemini IA:", geminiKey ? `\u2705 ATIVO (${geminiKey.substring(0, 10)}...)` : "\u274C AUSENTE");
  console.log("CWD:", process.cwd());
  console.log("-----------------------------------------");
  const UPLOADS_DIR = import_node_path.default.join(process.cwd(), "uploads");
  if (!import_node_fs.default.existsSync(UPLOADS_DIR)) {
    import_node_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app2.post("/api/upload", async (req, res) => {
    try {
      const { filename, data, type } = req.body;
      if (!data) {
        return res.status(400).json({ error: "Nenhum dado enviado" });
      }
      const fileExt = import_node_path.default.extname(filename || "documento.pdf") || ".pdf";
      const cleanBaseName = import_node_path.default.basename(filename || "arquivo", fileExt).replace(/[^a-zA-Z0-9_\-]/g, "_");
      const uniqueFileName = `${Date.now()}_${cleanBaseName}${fileExt}`;
      const filePath = import_node_path.default.join(UPLOADS_DIR, uniqueFileName);
      const base64Data = data.includes(";base64,") ? data.split(";base64,")[1] : data;
      const buffer = Buffer.from(base64Data, "base64");
      import_node_fs.default.writeFileSync(filePath, buffer);
      const CHUNK_SIZE = 6e5;
      if (base64Data.length <= CHUNK_SIZE) {
        try {
          await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "stored_files", uniqueFileName), {
            filename: uniqueFileName,
            originalName: filename || uniqueFileName,
            base64Data,
            chunkCount: 0,
            type: type || "application/pdf",
            size: buffer.length,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (fsErr) {
          console.warn("[UPLOAD] Erro ao salvar no Firestore (continuando com arquivo local):", fsErr);
        }
      } else if (base64Data.length <= CHUNK_SIZE * 12) {
        try {
          const chunks = [];
          for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
            chunks.push(base64Data.slice(i, i + CHUNK_SIZE));
          }
          await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "stored_files", uniqueFileName), {
            filename: uniqueFileName,
            originalName: filename || uniqueFileName,
            chunkCount: chunks.length,
            type: type || "application/pdf",
            size: buffer.length,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          await Promise.all(
            chunks.map(
              (chunk, idx) => (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "stored_files", uniqueFileName, "chunks", String(idx)), {
                index: idx,
                data: chunk
              })
            )
          );
        } catch (fsErr) {
          console.warn("[UPLOAD] Erro ao salvar arquivo em chunks no Firestore:", fsErr);
        }
      }
      const fileUrl = `/api/files/${uniqueFileName}`;
      console.log(`[UPLOAD] Arquivo salvo com sucesso: ${uniqueFileName} (${buffer.length} bytes)`);
      res.json({
        success: true,
        url: fileUrl,
        fileId: uniqueFileName,
        name: filename || uniqueFileName,
        size: buffer.length,
        type: type || "application/pdf"
      });
    } catch (err) {
      console.error("[UPLOAD] Erro ao salvar arquivo:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/files/:filename", async (req, res) => {
    try {
      const safeFilename = import_node_path.default.basename(req.params.filename);
      const filePath = import_node_path.default.join(UPLOADS_DIR, safeFilename);
      const ext = import_node_path.default.extname(safeFilename).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".pdf") contentType = "application/pdf";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".webp") contentType = "image/webp";
      const isInline = req.query.inline === "1" || req.query.view === "1";
      const disposition = isInline ? "inline" : "attachment";
      if (import_node_fs.default.existsSync(filePath)) {
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(safeFilename)}"`);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(filePath);
      }
      try {
        const fileDoc = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "stored_files", safeFilename));
        if (fileDoc.exists()) {
          const fileData = fileDoc.data();
          let fullBase64 = fileData?.base64Data || "";
          if (!fullBase64 && fileData?.chunkCount && Number(fileData.chunkCount) > 0) {
            const chunksSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "stored_files", safeFilename, "chunks"));
            if (!chunksSnap.empty) {
              const sortedChunks = chunksSnap.docs.map((d) => d.data()).sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
              fullBase64 = sortedChunks.map((c) => c.data || "").join("");
            }
          }
          if (fullBase64) {
            const buffer = Buffer.from(fullBase64, "base64");
            try {
              import_node_fs.default.writeFileSync(filePath, buffer);
            } catch (_) {
            }
            res.setHeader("Content-Type", fileData.type || contentType);
            res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(safeFilename)}"`);
            res.setHeader("Content-Length", buffer.length);
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.send(buffer);
          }
        }
      } catch (fsErr) {
        console.warn("[FILES] Erro ao consultar Firestore:", fsErr);
      }
      return res.status(404).json({ error: "Arquivo n\xE3o encontrado." });
    } catch (err) {
      console.error("[FILES] Erro:", err);
      res.status(500).json({ error: "Erro ao carregar arquivo." });
    }
  });
  const vapidPublic = (process.env.VAPID_PUBLIC_KEY || "BNhGkh4NPQdL5-v97cIGWleXsEuVlZiW6YGu3866y33lZuMB_INQ-nJh0Ff-DECy-uIO-E2X4KdDvEw2oo0--Aw").trim();
  const vapidPrivate = (process.env.VAPID_PRIVATE_KEY || "qQnw0dxc2m0c1fFN444rwuE0mWbZrrYeiQcbTKeXy8M").trim();
  try {
    import_web_push.default.setVapidDetails("mailto:lucasdanieltrader@gmail.com", vapidPublic, vapidPrivate);
  } catch (vapidErr) {
    console.warn("[PUSH] Aviso ao configurar chaves VAPID:", vapidErr);
  }
  app2.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });
  app2.get("/api/vapid-public-key", (req, res) => {
    res.send(vapidPublic);
  });
  app2.post("/api/send-push", async (req, res) => {
    const { userId, title, body, url } = req.body;
    console.log("[PUSH] Request received for userId:", userId, "Title:", title);
    if (!userId) {
      console.warn("[PUSH] No userId provided");
      return res.status(400).json({ error: "No userId" });
    }
    try {
      const userDoc = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "users", userId));
      if (!userDoc.exists()) {
        console.warn("[PUSH] User not found in DB:", userId);
        return res.status(404).json({ error: "User not found" });
      }
      const userData = userDoc.data();
      const subscription = userData.pushSubscription;
      if (!subscription) {
        console.warn("[PUSH] User has no push subscription:", userId);
        return res.status(400).json({ error: "User has no push subscription" });
      }
      await import_web_push.default.sendNotification(subscription, JSON.stringify({ title, body, url }), { urgency: "high", TTL: 86400 });
      console.log("[PUSH] Successfully sent Web Push to:", userId);
      res.json({ success: true });
    } catch (error) {
      console.error("[PUSH] Error sending Web Push:", error);
      res.status(500).json({ error: "Failed" });
    }
  });
  const QUEUE_CACHE_FILE = import_node_path.default.join(process.cwd(), "server_queue_cache.json");
  const loadServerQueue = () => {
    try {
      if (import_node_fs.default.existsSync(QUEUE_CACHE_FILE)) {
        const raw = import_node_fs.default.readFileSync(QUEUE_CACHE_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[QUEUE CACHE] Error loading:", e);
    }
    return [];
  };
  const saveServerQueue = (items) => {
    try {
      import_node_fs.default.writeFileSync(QUEUE_CACHE_FILE, JSON.stringify(items, null, 2), "utf-8");
    } catch (e) {
      console.warn("[QUEUE CACHE] Error saving:", e);
    }
  };
  try {
    const currentQueue = loadServerQueue();
    const mariaExists = currentQueue.some((p) => p.id === "hrQazJzMxJRsmgK5sQdMk3lJY9B2" || p.email === "mariacarolb@hotmail.com.br");
    if (!mariaExists) {
      currentQueue.unshift({
        id: "hrQazJzMxJRsmgK5sQdMk3lJY9B2",
        patientName: "Maria Carolina dos Santos Benvenutti",
        email: "mariacarolb@hotmail.com.br",
        phone: "(54) 99989-9264",
        cpf: "009.185.260-94",
        birthDate: "07/06/1999",
        tier: "basic",
        isPremium: false,
        plan: "basic",
        status: "waiting",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
        hasUnread: true,
        lastMessageAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastMessageText: "Paciente aguardando consulta com o m\xE9dico.",
        answers: {
          objectives: ["Ansiedade e Estresse"],
          intensity: "5",
          duration: "anos",
          description: "tenho ansiedade e fico muito nervosa sempre com questoes do dia a dia, no trabalho, em casa, minha cabe\xE7a esta sempre pensando e me cobrando ",
          cannabis: true,
          cannabis_details: "fa\xE7o o uso onde me auxilia muito com a ansiedade e estresse ",
          sex: "F",
          weight: "65",
          height: "1.67",
          phone: "(54) 99989-9264",
          birthDate: "07/06/1999",
          cpf: "009.185.260-94",
          diseaseOrigin: "com o decorrer do tempo e as muitas cobran\xE7as de rotina como ser m\xE3e, responsabilidades de vida adulta, algumas press\xF5es familiares come\xE7aram a cada vez pesar mais em aspectos variados da minha vida "
        }
      });
      saveServerQueue(currentQueue);
    }
  } catch (err) {
    console.warn("[QUEUE SEED] Warning:", err);
  }
  const resolvePaymentPlan = (payment) => {
    const val = Number(payment.transaction_amount) || 0;
    const desc = (payment.description || "").toLowerCase();
    const metaPlan = payment.metadata?.plan || payment.plan || payment.selectedOffer;
    let plan = "basic";
    if (metaPlan === "complete" || metaPlan === "premium" || metaPlan === "psychologist" || metaPlan === "basic") {
      plan = metaPlan;
    } else if (desc.includes("completo") || desc.includes("360") || val >= 300) {
      plan = "complete";
    } else if (desc.includes("psic\xF3logo") || desc.includes("psicologo") || desc.includes("marco ant\xF4nio") || val >= 140 && val <= 180 && !desc.includes("vip") && !desc.includes("premium")) {
      plan = "psychologist";
    } else if (desc.includes("vip") || desc.includes("premium") || desc.includes("acompanhamento") || val >= 200 || payment.metadata?.is_premium === true) {
      plan = "premium";
    } else {
      plan = "basic";
    }
    const isPrem = plan === "premium" || plan === "complete";
    const queueType = plan === "psychologist" ? "psychologist" : "doctor";
    const allowDualChat = plan === "complete";
    const typeLabel = plan === "complete" ? "Plano Completo VIP (M\xE9dico + Psic\xF3logo)" : plan === "premium" ? "Acompanhamento VIP (M\xE9dico)" : plan === "psychologist" ? "Consulta com Psic\xF3logo + Laudo" : "Consulta Essencial (M\xE9dico)";
    return { plan, isPrem, queueType, allowDualChat, typeLabel, val };
  };
  const processApprovedPayment = async (payment) => {
    try {
      if (!payment || payment.status !== "approved" && payment.status !== "completed") return;
      const { plan: resolvedPlan, isPrem, queueType: resolvedQueueType, allowDualChat, typeLabel, val } = resolvePaymentPlan(payment);
      const payerEmail = payment.payer?.email;
      const payerName = payment.payer?.first_name ? `${payment.payer.first_name} ${payment.payer.last_name || ""}`.trim() : payment.metadata?.patient_name || "Paciente";
      const patientId = payment.external_reference || payment.metadata?.patient_id;
      const metaCouponCode = payment.metadata?.coupon_code || "";
      const metaCouponId = payment.metadata?.coupon_id || "";
      const metaAffiliateName = payment.metadata?.affiliate_name || "";
      const metaCommPct = Number(payment.metadata?.commission_percentage || 0);
      const metaViaLink = Boolean(payment.metadata?.via_link);
      const metaOrigPrice = Number(payment.metadata?.original_price || val);
      const metaCommVal = metaCommPct > 0 ? Number((val * metaCommPct / 100).toFixed(2)) : 0;
      const paymentDoc = {
        mpId: String(payment.id),
        type: typeLabel,
        value: val,
        originalValue: metaOrigPrice,
        plan: resolvedPlan,
        selectedOffer: resolvedPlan,
        queueType: resolvedQueueType,
        allowDualChat,
        isPremium: isPrem,
        status: payment.status || "approved",
        date: payment.date_approved || payment.date_created || (/* @__PURE__ */ new Date()).toISOString(),
        payerEmail: payerEmail || "",
        payerName: payerName || "Paciente",
        patientId: patientId || "",
        paymentMethod: payment.payment_method_id || "pix",
        ...metaCouponCode ? {
          couponCode: metaCouponCode,
          couponId: metaCouponId || metaCouponCode,
          affiliateName: metaAffiliateName,
          commissionPercentage: metaCommPct,
          commissionValue: metaCommVal,
          viaReferralLink: metaViaLink
        } : {}
      };
      await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "payments", String(payment.id)), paymentDoc, { merge: true });
      let targetPatientId = patientId;
      let resolvedPatientName = payerName;
      let existingAnswers = {};
      let existingPhone = "";
      let existingCpf = "";
      let existingBirthDate = "";
      const isRealPatientEmail = (em) => {
        const c = (em || "").trim().toLowerCase();
        return !!(c && c.includes("@") && !c.includes("sem-email") && c !== "paciente@mecura.com" && c !== "paciente@mercura.com" && c !== "paciente.consulta@mecura.com");
      };
      if (!targetPatientId && isRealPatientEmail(payerEmail)) {
        try {
          const cleanMail = payerEmail.toLowerCase().trim();
          const uSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.query)((0, import_firestore2.collection)(db, "users"), (0, import_firestore2.where)("email", "==", cleanMail)));
          if (!uSnap.empty) {
            targetPatientId = uSnap.docs[0].id;
            const uData = uSnap.docs[0].data();
            resolvedPatientName = uData.name || payerName;
            existingAnswers = uData.answers || {};
            existingPhone = uData.phone || "";
            existingCpf = uData.cpf || "";
            existingBirthDate = uData.birthDate || "";
          }
        } catch (qErr) {
        }
      }
      if (!targetPatientId) {
        targetPatientId = isRealPatientEmail(payerEmail) ? `user_${payerEmail.replace(/[^a-zA-Z0-9]/g, "_")}` : `mp_${payment.id}`;
      }
      if (existingPhone === "" && targetPatientId) {
        try {
          const userSnap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "users", targetPatientId));
          if (userSnap.exists()) {
            const uData = userSnap.data();
            if (uData.name) resolvedPatientName = uData.name;
            existingAnswers = uData.answers || {};
            existingPhone = uData.phone || "";
            existingCpf = uData.cpf || "";
            existingBirthDate = uData.birthDate || "";
          }
        } catch (err) {
          console.warn("[PAYMENT PROCESS] Erro ao buscar user:", err);
        }
      }
      const queueDocRef = (0, import_firestore2.doc)(db, "queue", targetPatientId);
      const queuePayload = {
        id: targetPatientId,
        patientName: resolvedPatientName,
        name: resolvedPatientName,
        email: payerEmail || "",
        phone: existingPhone,
        cpf: existingCpf,
        birthDate: existingBirthDate,
        answers: existingAnswers,
        tier: isPrem ? "Premium" : "basic",
        isPremium: isPrem,
        plan: resolvedPlan,
        selectedOffer: resolvedPlan,
        queueType: resolvedQueueType,
        allowDualChat,
        joinedAt: payment.date_approved || (/* @__PURE__ */ new Date()).toISOString(),
        status: "waiting",
        pagamento_consulta: true,
        pagamento_premium: isPrem,
        hasPaid: true,
        isPaid: true,
        hasUnread: true,
        lastMessageText: resolvedQueueType === "psychologist" ? "Aguardando atendimento psicol\xF3gico" : allowDualChat ? "Plano Completo 360\xB0 (M\xE9dico + Psic\xF3logo) \u2014 Aguardando atendimento" : "Paciente aguardando atendimento m\xE9dico",
        lastMessageAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await (0, import_firestore2.setDoc)(queueDocRef, queuePayload, { merge: true });
      console.log(`[PAYMENT APPROVED] Paciente ${resolvedPatientName} (${targetPatientId}) colocado na fila de espera com plano ${resolvedPlan}!`);
      await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", targetPatientId), {
        pagamento_consulta: true,
        pagamento_premium: isPrem,
        hasPaid: true,
        isPaid: true,
        isPremium: isPrem,
        plan: resolvedPlan,
        selectedOffer: resolvedPlan,
        queueType: resolvedQueueType,
        allowDualChat,
        tier: isPrem ? "Premium" : "basic",
        inQueue: true,
        isConsultationFinished: false,
        consultationActive: false,
        consultationStatus: "waiting",
        lastPaymentId: String(payment.id),
        lastPaymentDate: (/* @__PURE__ */ new Date()).toISOString(),
        ...metaCouponCode ? {
          usedCouponCode: metaCouponCode,
          affiliateName: metaAffiliateName,
          viaReferralLink: metaViaLink
        } : {}
      }, { merge: true });
      if (metaCouponCode || metaCouponId) {
        try {
          const couponsSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "coupons"));
          let couponDocId = metaCouponId;
          let couponData = null;
          couponsSnap.forEach((cDoc) => {
            const d = cDoc.data();
            if (cDoc.id === metaCouponId || d.code && String(d.code).trim().toUpperCase() === String(metaCouponCode).trim().toUpperCase()) {
              couponDocId = cDoc.id;
              couponData = d;
            }
          });
          if (couponDocId && couponData) {
            const existingLogs = Array.isArray(couponData.usageLogs) ? couponData.usageLogs : [];
            const alreadyLogged = existingLogs.some((l) => l.paymentId && String(l.paymentId) === String(payment.id));
            if (!alreadyLogged) {
              const cPct = Number(couponData.commissionPercentage ?? metaCommPct ?? 0);
              const cVal = cPct > 0 ? Number((val * cPct / 100).toFixed(2)) : 0;
              const newUsageEntry = {
                userId: targetPatientId,
                userEmail: payerEmail || "",
                userName: resolvedPatientName || "Paciente",
                userPhone: existingPhone || "",
                userCpf: existingCpf || "",
                planName: typeLabel,
                planKey: resolvedPlan,
                price: val,
                originalPrice: metaOrigPrice,
                discountApplied: Number(Math.max(0, metaOrigPrice - val).toFixed(2)),
                commissionPercentage: cPct,
                commissionValue: cVal,
                commissionPaid: false,
                viaLink: metaViaLink,
                paymentId: String(payment.id),
                usedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              const primaryIdent = payerEmail && payerEmail.includes("@") ? payerEmail.trim() : targetPatientId;
              const updatedUsedBy = Array.from(/* @__PURE__ */ new Set([...Array.isArray(couponData.usedBy) ? couponData.usedBy : [], primaryIdent]));
              await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "coupons", couponDocId), {
                usedCount: (Number(couponData.usedCount) || 0) + 1,
                usedBy: updatedUsedBy,
                usageLogs: [...existingLogs, newUsageEntry],
                lastUsedAt: (/* @__PURE__ */ new Date()).toISOString()
              }, { merge: true });
            }
          }
        } catch (couponErr) {
          console.warn("[PAYMENT PROCESS] Erro ao registrar cupom no servidor:", couponErr);
        }
      }
      try {
        let currentQueue = loadServerQueue();
        const existingIdx = currentQueue.findIndex((p) => p.id === targetPatientId || isRealPatientEmail(payerEmail) && p.email && p.email.toLowerCase() === payerEmail.toLowerCase());
        if (existingIdx >= 0) {
          currentQueue[existingIdx] = { ...currentQueue[existingIdx], ...queuePayload };
        } else {
          currentQueue.unshift(queuePayload);
        }
        saveServerQueue(currentQueue);
      } catch (cacheErr) {
        console.warn("[PAYMENT PROCESS] Erro ao atualizar server queue cache:", cacheErr);
      }
      try {
        const usersRef = (0, import_firestore2.collection)(db, "users");
        const qAdmin = (0, import_firestore2.query)(usersRef, (0, import_firestore2.where)("role", "==", "admin"));
        const adminSnapshot = await (0, import_firestore2.getDocs)(qAdmin);
        adminSnapshot.forEach((docSnap) => {
          const uData = docSnap.data();
          if (uData.pushSubscription) {
            import_web_push.default.sendNotification(
              uData.pushSubscription,
              JSON.stringify({
                title: isPrem ? "\u{1F451} Novo Paciente VIP na Fila" : "\u{1F514} Novo Paciente na Fila",
                body: `${resolvedPatientName} realizou o pagamento (${isPrem ? "R$ 249,90" : "R$ 49,90"}) e est\xE1 aguardando atendimento.`,
                url: "/doctor"
              }),
              { urgency: "high", TTL: 86400 }
            ).catch(() => {
            });
          }
        });
      } catch (pushErr) {
        console.warn("[PAYMENT PROCESS] Erro ao disparar push:", pushErr);
      }
    } catch (procErr) {
      console.error("[PAYMENT PROCESS] Erro:", procErr);
    }
  };
  app2.get("/api/queue", async (req, res) => {
    try {
      const serverQueue = loadServerQueue();
      try {
        let fsQueue = [];
        try {
          const snap = await Promise.race([
            (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "queue")),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
          ]);
          if (snap && snap.docs) {
            fsQueue = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          }
        } catch (snapErr) {
        }
        const map = /* @__PURE__ */ new Map();
        serverQueue.forEach((item) => map.set(item.id, item));
        fsQueue.forEach((item) => {
          const prev = map.get(item.id) || {};
          map.set(item.id, {
            ...prev,
            ...item,
            answers: { ...prev.answers || {}, ...item.answers || {} }
          });
        });
        const merged = Array.from(map.values());
        return res.json({ success: true, queue: merged });
      } catch (fsErr) {
        return res.json({ success: true, queue: serverQueue, fallback: true });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/queue/force-join", async (req, res) => {
    try {
      const patient = req.body;
      if (!patient || !patient.id) {
        return res.status(400).json({ error: "Missing patient id" });
      }
      let existingUserDocData = null;
      try {
        const userSnap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "users", patient.id));
        if (userSnap.exists()) {
          existingUserDocData = userSnap.data();
        }
      } catch (err) {
        console.warn("[QUEUE FORCE-JOIN] Erro ao ler usu\xE1rio:", err);
      }
      const rawCleanPlan = patient.plan || patient.selectedOffer || existingUserDocData?.plan || existingUserDocData?.selectedOffer;
      const finalCleanPlan = rawCleanPlan === "complete" || rawCleanPlan === "premium" || rawCleanPlan === "psychologist" || rawCleanPlan === "basic" ? rawCleanPlan : patient.isPremium === true || existingUserDocData?.isPremium === true ? "premium" : "basic";
      const finalIsPrem = finalCleanPlan === "premium" || finalCleanPlan === "complete";
      const finalQueueType = patient.queueType || existingUserDocData?.queueType || (finalCleanPlan === "psychologist" ? "psychologist" : "doctor");
      const resolvedNameFromPayload = (patient.patientName || patient.name || "").trim();
      const resolvedNameFromDoc = (existingUserDocData?.name || existingUserDocData?.patientName || "").trim();
      const finalPatientName = resolvedNameFromPayload && resolvedNameFromPayload.toLowerCase() !== "paciente" ? resolvedNameFromPayload : resolvedNameFromDoc && resolvedNameFromDoc.toLowerCase() !== "paciente" ? resolvedNameFromDoc : resolvedNameFromPayload || resolvedNameFromDoc || "Paciente";
      const mergedAnswers = {
        ...existingUserDocData?.answers || {},
        ...patient.answers || {}
      };
      const cleanPatient = {
        id: patient.id,
        patientName: finalPatientName,
        name: finalPatientName,
        email: patient.email || existingUserDocData?.email || "",
        phone: patient.phone || existingUserDocData?.phone || mergedAnswers?.phone || "",
        cpf: patient.cpf || existingUserDocData?.cpf || mergedAnswers?.cpf || "",
        birthDate: patient.birthDate || existingUserDocData?.birthDate || mergedAnswers?.birthDate || "",
        tier: finalIsPrem ? "Premium" : "basic",
        isPremium: finalIsPrem,
        plan: finalCleanPlan,
        queueType: finalQueueType,
        selectedOffer: finalCleanPlan,
        status: patient.status === "in-consultation" ? "in-consultation" : "waiting",
        joinedAt: patient.joinedAt || (/* @__PURE__ */ new Date()).toISOString(),
        hasUnread: patient.hasUnread !== void 0 ? patient.hasUnread : true,
        lastMessageAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastMessageText: patient.lastMessageText || (finalQueueType === "psychologist" ? "Aguardando atendimento psicol\xF3gico" : "Aguardando atendimento m\xE9dico"),
        answers: mergedAnswers,
        pagamento_consulta: true,
        hasPaid: true,
        isPaid: true,
        pagamento_premium: finalIsPrem
      };
      let currentQueue = loadServerQueue();
      const rawForceEmail = (cleanPatient.email || "").trim().toLowerCase();
      const cleanEmail = rawForceEmail && !rawForceEmail.includes("sem-email") && rawForceEmail !== "paciente@mecura.com" && rawForceEmail !== "paciente@mercura.com" && rawForceEmail !== "paciente.consulta@mecura.com" ? rawForceEmail : "";
      const existingIdx = currentQueue.findIndex(
        (p) => p.id === cleanPatient.id || cleanEmail && p.email && p.email.trim().toLowerCase() === cleanEmail
      );
      if (existingIdx >= 0) {
        const existing = currentQueue[existingIdx];
        const mergedName = cleanPatient.patientName && cleanPatient.patientName !== "Paciente" ? cleanPatient.patientName : existing.patientName && existing.patientName !== "Paciente" ? existing.patientName : cleanPatient.patientName || existing.patientName || "Paciente";
        currentQueue[existingIdx] = {
          ...existing,
          ...cleanPatient,
          id: cleanPatient.id,
          status: existing.status === "in-consultation" ? "in-consultation" : "waiting",
          patientName: mergedName,
          name: mergedName,
          cpf: cleanPatient.cpf || existing.cpf || "",
          phone: cleanPatient.phone || existing.phone || "",
          birthDate: cleanPatient.birthDate || existing.birthDate || "",
          email: cleanPatient.email || existing.email || "",
          answers: { ...existing.answers || {}, ...cleanPatient.answers || {} },
          pagamento_consulta: true,
          hasPaid: true,
          isPaid: true
        };
      } else {
        currentQueue.unshift(cleanPatient);
      }
      saveServerQueue(currentQueue);
      res.json({ success: true, patient: cleanPatient });
      Promise.race([
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "queue", cleanPatient.id), cleanPatient, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]).catch((fsErr) => console.warn("[QUEUE FORCE-JOIN] Firestore queue warning:", fsErr));
      const userSyncPayload = {
        inQueue: true,
        isConsultationFinished: false,
        consultationActive: false,
        consultationStatus: "waiting",
        pagamento_consulta: true,
        hasPaid: true,
        isPaid: true,
        pagamento_premium: cleanPatient.isPremium,
        isPremium: cleanPatient.isPremium,
        plan: cleanPatient.plan,
        tier: cleanPatient.tier,
        queueType: cleanPatient.queueType,
        selectedOffer: cleanPatient.selectedOffer,
        hasCompletedOnboarding: true,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (cleanPatient.patientName && cleanPatient.patientName !== "Paciente") {
        userSyncPayload.name = cleanPatient.patientName;
      }
      if (cleanPatient.email && !cleanPatient.email.includes("sem-email")) {
        userSyncPayload.email = cleanPatient.email;
      }
      if (cleanPatient.phone) userSyncPayload.phone = cleanPatient.phone;
      if (cleanPatient.cpf) userSyncPayload.cpf = cleanPatient.cpf;
      if (cleanPatient.birthDate) userSyncPayload.birthDate = cleanPatient.birthDate;
      if (cleanPatient.answers && Object.keys(cleanPatient.answers).length > 0) {
        userSyncPayload.answers = cleanPatient.answers;
      }
      Promise.race([
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", cleanPatient.id), userSyncPayload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]).catch(() => {
      });
    } catch (e) {
      console.error("[QUEUE FORCE-JOIN] Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/queue/update-status", async (req, res) => {
    try {
      const { patientId, status, hasUnread, queueType, plan, selectedOffer, isPremium, pagamento_premium, tier, answers } = req.body;
      if (!patientId) return res.status(400).json({ error: "Missing patientId" });
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const currentQueue = loadServerQueue();
      const idx = currentQueue.findIndex((p) => p.id === patientId);
      if (idx >= 0) {
        if (status) currentQueue[idx].status = status;
        if (status === "finished") {
          currentQueue[idx].pagamento_consulta = false;
          currentQueue[idx].finishedAt = nowIso;
        }
        if (hasUnread !== void 0) currentQueue[idx].hasUnread = hasUnread;
        if (queueType) currentQueue[idx].queueType = queueType;
        if (plan) currentQueue[idx].plan = plan;
        if (selectedOffer) currentQueue[idx].selectedOffer = selectedOffer;
        if (isPremium !== void 0) currentQueue[idx].isPremium = isPremium;
        if (pagamento_premium !== void 0) currentQueue[idx].pagamento_premium = pagamento_premium;
        if (tier) currentQueue[idx].tier = tier;
        if (answers && typeof answers === "object") {
          currentQueue[idx].answers = {
            ...currentQueue[idx].answers || {},
            ...answers
          };
        }
        saveServerQueue(currentQueue);
      }
      res.json({ success: true, patientId, status });
      const updateData = {};
      if (status) updateData.status = status;
      if (status === "finished") {
        updateData.pagamento_consulta = false;
        updateData.finishedAt = nowIso;
      }
      if (hasUnread !== void 0) updateData.hasUnread = hasUnread;
      if (queueType) updateData.queueType = queueType;
      if (plan) updateData.plan = plan;
      if (selectedOffer) updateData.selectedOffer = selectedOffer;
      if (isPremium !== void 0) updateData.isPremium = isPremium;
      if (pagamento_premium !== void 0) updateData.pagamento_premium = pagamento_premium;
      if (tier) updateData.tier = tier;
      if (answers && typeof answers === "object") updateData.answers = answers;
      Promise.race([
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "queue", patientId), updateData, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2e3))
      ]).catch(() => {
      });
      const userUpdateData = {
        lastUpdated: nowIso
      };
      if (status) {
        userUpdateData.inQueue = status === "waiting";
        userUpdateData.consultationStatus = status;
        userUpdateData.consultationActive = status === "in-consultation";
      }
      if (answers && typeof answers === "object") {
        userUpdateData.answers = answers;
      }
      if (status === "finished") {
        userUpdateData.isConsultationFinished = true;
        userUpdateData.pagamento_consulta = false;
        userUpdateData.hasPaid = false;
        userUpdateData.isPaid = false;
        userUpdateData.bypassedPayment = false;
        userUpdateData.hadPreviousConsultation = true;
        userUpdateData.finishedAt = nowIso;
      }
      Promise.race([
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", patientId), userUpdateData, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2e3))
      ]).catch(() => {
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/verify-patient-payment", async (req, res) => {
    try {
      const { patientId, email, cpf, name, pendingPaymentId } = req.body || {};
      const rawEmail = (email || "").trim().toLowerCase();
      const isPlaceholderEmail = !rawEmail || rawEmail.includes("sem-email") || rawEmail === "paciente@mecura.com" || rawEmail === "paciente@mercura.com" || rawEmail === "paciente.consulta@mecura.com";
      const cleanEmail = isPlaceholderEmail ? "" : rawEmail;
      const cleanCpf = (cpf || "").replace(/\D/g, "");
      let targetId = patientId || "";
      let userData = null;
      if (targetId && targetId !== "doctor") {
        try {
          const uSnap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "users", targetId));
          if (uSnap.exists()) userData = uSnap.data();
        } catch {
        }
      }
      if ((!userData || !userData.answers || Object.keys(userData.answers || {}).length === 0) && cleanEmail) {
        try {
          const uQuery = await (0, import_firestore2.getDocs)((0, import_firestore2.query)((0, import_firestore2.collection)(db, "users"), (0, import_firestore2.where)("email", "==", cleanEmail)));
          if (!uQuery.empty) {
            const matchedDoc = uQuery.docs.find((d) => d.data()?.answers && Object.keys(d.data().answers).length > 0) || uQuery.docs[0];
            if (!targetId) targetId = matchedDoc.id;
            userData = { ...matchedDoc.data() || {}, ...userData || {}, answers: { ...matchedDoc.data()?.answers || {}, ...userData?.answers || {} } };
          }
        } catch {
        }
      }
      if (pendingPaymentId) {
        try {
          const mpInfo = await getMpClient();
          if (mpInfo) {
            const paymentClient = new import_mercadopago.Payment(mpInfo.client);
            const mpPay = await paymentClient.get({ id: String(pendingPaymentId) });
            if (mpPay && mpPay.status === "approved") {
              await processApprovedPayment(mpPay);
            }
          }
        } catch {
        }
      }
      const serverQueue = loadServerQueue();
      let activeQueueEntry = serverQueue.find((p) => {
        if (p.status !== "waiting" && p.status !== "in-consultation") return false;
        if (targetId && p.id === targetId) return true;
        const pEmail = (p.email || "").trim().toLowerCase();
        const isEmailMatch = !!(cleanEmail && pEmail && pEmail === cleanEmail);
        if (isEmailMatch) return true;
        if (!targetId && cleanCpf.length === 11 && (p.cpf || p.answers?.cpf || "").replace(/\D/g, "") === cleanCpf) {
          return true;
        }
        return false;
      });
      if (!activeQueueEntry && targetId) {
        try {
          const qSnap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "queue", targetId));
          if (qSnap.exists()) {
            const qData = qSnap.data();
            if (qData.status === "waiting" || qData.status === "in-consultation") {
              activeQueueEntry = { id: targetId, ...qData };
            }
          }
        } catch {
        }
      }
      if (!activeQueueEntry) {
        const finishedAtMs = userData?.finishedAt ? new Date(userData.finishedAt).getTime() : 0;
        const lastConsumedId = userData?.lastConsumedPaymentId ? String(userData.lastConsumedPaymentId) : "";
        const userHasActivePaidFlag = !!(userData && userData.isConsultationFinished !== true && userData.consultationStatus !== "finished" && userData.consultationStatus !== "awaiting_payment" && userData.consultationStatus !== "not_started" && (userData.pagamento_consulta === true || userData.hasPaid === true || userData.isPaid === true || userData.inQueue === true || userData.consultationStatus === "waiting" || userData.consultationStatus === "in-consultation"));
        let recentUnconsumedPayment = null;
        try {
          const paymentsSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "payments"));
          for (const pDoc of paymentsSnap.docs) {
            const p = pDoc.data();
            const pIdMatch = !!(targetId && p.patientId && p.patientId === targetId);
            const pPayEmail = (p.payerEmail || p.patientEmail || "").trim().toLowerCase();
            const pEmailMatch = !!(cleanEmail && pPayEmail === cleanEmail && (!targetId || !p.patientId || p.patientId === targetId));
            if (pIdMatch || pEmailMatch) {
              const pDateMs = new Date(p.date || p.createdAt || 0).getTime();
              const isRecent = !isNaN(pDateMs) && Date.now() - pDateMs < 48 * 3600 * 1e3;
              const isNotConsumed = (!lastConsumedId || String(p.mpId || pDoc.id) !== lastConsumedId) && (!finishedAtMs || pDateMs > finishedAtMs + 5e3);
              if (isRecent && isNotConsumed) {
                if (!recentUnconsumedPayment || pDateMs > new Date(recentUnconsumedPayment.date || 0).getTime()) {
                  recentUnconsumedPayment = { ...p, mpId: p.mpId || pDoc.id };
                }
              }
            }
          }
        } catch {
        }
        if (userHasActivePaidFlag || recentUnconsumedPayment) {
          const resolvedId = targetId || recentUnconsumedPayment?.patientId || (cleanEmail ? `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}` : `paciente_${Date.now()}`);
          const resolvedPlan = recentUnconsumedPayment?.plan || userData?.plan || userData?.selectedOffer || "basic";
          const isPrem = resolvedPlan === "premium" || resolvedPlan === "complete" || !!recentUnconsumedPayment?.isPremium || !!userData?.isPremium;
          const resolvedQueueType = recentUnconsumedPayment?.queueType || userData?.queueType || (resolvedPlan === "psychologist" ? "psychologist" : "doctor");
          const resolvedName = userData?.name || name || recentUnconsumedPayment?.patientName || recentUnconsumedPayment?.payerName || "Paciente";
          const restoredEntry = {
            id: resolvedId,
            patientName: resolvedName,
            name: resolvedName,
            email: cleanEmail || userData?.email || recentUnconsumedPayment?.payerEmail || "",
            phone: userData?.phone || "",
            cpf: cleanCpf || userData?.cpf || "",
            birthDate: userData?.birthDate || "",
            answers: userData?.answers || {},
            tier: isPrem ? "Premium" : "basic",
            isPremium: isPrem,
            plan: resolvedPlan,
            selectedOffer: resolvedPlan,
            queueType: resolvedQueueType,
            status: userData?.consultationStatus === "in-consultation" ? "in-consultation" : "waiting",
            joinedAt: recentUnconsumedPayment?.date || userData?.lastPaymentDate || (/* @__PURE__ */ new Date()).toISOString(),
            pagamento_consulta: true,
            hasPaid: true,
            isPaid: true,
            pagamento_premium: isPrem,
            hasUnread: true,
            lastMessageAt: (/* @__PURE__ */ new Date()).toISOString(),
            lastMessageText: resolvedQueueType === "psychologist" ? "Aguardando atendimento psicol\xF3gico" : "Aguardando atendimento m\xE9dico"
          };
          activeQueueEntry = restoredEntry;
          const idx = serverQueue.findIndex((p) => p.id === resolvedId);
          if (idx >= 0) {
            serverQueue[idx] = { ...serverQueue[idx], ...restoredEntry };
          } else {
            serverQueue.unshift(restoredEntry);
          }
          saveServerQueue(serverQueue);
          await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "queue", resolvedId), restoredEntry, { merge: true }).catch(() => {
          });
          await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", resolvedId), {
            pagamento_consulta: true,
            pagamento_premium: isPrem,
            hasPaid: true,
            isPaid: true,
            isPremium: isPrem,
            plan: resolvedPlan,
            selectedOffer: resolvedPlan,
            queueType: resolvedQueueType,
            inQueue: restoredEntry.status === "waiting",
            consultationActive: restoredEntry.status === "in-consultation",
            isConsultationFinished: false,
            consultationStatus: restoredEntry.status
          }, { merge: true }).catch(() => {
          });
        }
      } else if (activeQueueEntry && targetId) {
        const idx = serverQueue.findIndex((p) => p.id === activeQueueEntry.id);
        if (idx < 0) {
          serverQueue.unshift(activeQueueEntry);
          saveServerQueue(serverQueue);
        }
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "queue", activeQueueEntry.id), activeQueueEntry, { merge: true }).catch(() => {
        });
        (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", activeQueueEntry.id), {
          pagamento_consulta: true,
          hasPaid: true,
          isPaid: true,
          inQueue: activeQueueEntry.status === "waiting",
          consultationActive: activeQueueEntry.status === "in-consultation",
          isConsultationFinished: false,
          consultationStatus: activeQueueEntry.status
        }, { merge: true }).catch(() => {
        });
      }
      if (activeQueueEntry) {
        return res.json({
          success: true,
          paid: true,
          hasActivePaidConsultation: true,
          status: activeQueueEntry.status || "waiting",
          patientId: activeQueueEntry.id,
          queueEntry: activeQueueEntry,
          userData: userData || null
        });
      }
      return res.json({
        success: true,
        paid: false,
        hasActivePaidConsultation: false,
        status: userData?.isConsultationFinished || userData?.consultationStatus === "finished" ? "finished" : userData?.consultationStatus || "none",
        patientId: targetId || null,
        userData: userData || null
      });
    } catch (e) {
      console.error("[VERIFY PAYMENT] Error:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.get("/api/mercadopago-status", async (req, res) => {
    try {
      const mpInfo = await getMpClient();
      res.json({
        configured: !!mpInfo,
        tokenPrefix: mpInfo ? mpInfo.token.substring(0, 10) + "..." : null
      });
    } catch (e) {
      res.status(500).json({ configured: false, error: e.message });
    }
  });
  app2.get("/api/mercadopago-payments", async (req, res) => {
    try {
      const mpInfo = await getMpClient();
      if (!mpInfo) {
        return res.json({ configured: false, count: 0, payments: [] });
      }
      const response = await fetch("https://api.mercadopago.com/v1/payments/search?status=approved&sort=date_created&criteria=desc&limit=100", {
        headers: {
          "Authorization": `Bearer ${mpInfo.token}`
        }
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn("[MP SYNC] Erro na API do Mercado Pago:", errText);
        return res.json({ configured: true, count: 0, payments: [] });
      }
      const data = await response.json();
      const results = (data.results || []).map((p) => {
        const { plan: resolvedPlan, isPrem, queueType: resolvedQueueType, typeLabel, val } = resolvePaymentPlan(p);
        const patientId = p.external_reference || p.metadata?.patient_id || "";
        return {
          mpId: String(p.id),
          type: typeLabel,
          value: val,
          plan: resolvedPlan,
          selectedOffer: resolvedPlan,
          queueType: resolvedQueueType,
          isPremium: isPrem,
          status: p.status || "approved",
          date: p.date_approved || p.date_created || (/* @__PURE__ */ new Date()).toISOString(),
          payerEmail: p.payer?.email || "",
          payerName: p.payer?.first_name ? `${p.payer.first_name} ${p.payer.last_name || ""}`.trim() : p.metadata?.patient_name || "Paciente",
          patientId,
          paymentMethod: p.payment_method_id || ""
        };
      });
      for (const p of results) {
        try {
          await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "payments", p.mpId), p, { merge: true });
          const paymentDate = new Date(p.date);
          const isRecent = !isNaN(paymentDate.getTime()) && Date.now() - paymentDate.getTime() < 48 * 3600 * 1e3;
          if (isRecent) {
            let targetId = p.patientId;
            let existingUserData = null;
            const rawSyncMail = (p.payerEmail || "").toLowerCase().trim();
            const isRealSyncMail = !!(rawSyncMail && !rawSyncMail.includes("sem-email") && rawSyncMail !== "paciente@mecura.com" && rawSyncMail !== "paciente@mercura.com" && rawSyncMail !== "paciente.consulta@mecura.com");
            if (!targetId && isRealSyncMail) {
              try {
                const uSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.query)((0, import_firestore2.collection)(db, "users"), (0, import_firestore2.where)("email", "==", rawSyncMail)));
                if (!uSnap.empty) {
                  targetId = uSnap.docs[0].id;
                  existingUserData = uSnap.docs[0].data();
                }
              } catch (qErr) {
              }
            }
            if (!targetId) {
              targetId = isRealSyncMail ? `user_${rawSyncMail.replace(/[^a-zA-Z0-9]/g, "_")}` : `mp_${p.mpId}`;
            }
            if (!existingUserData && targetId) {
              try {
                const uSnapById = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "users", targetId));
                if (uSnapById.exists()) existingUserData = uSnapById.data();
              } catch (_) {
              }
            }
            const queueDoc = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "queue", targetId));
            const queueData = queueDoc.exists() ? queueDoc.data() : null;
            const queueStatus = queueData?.status || null;
            const finishedAtIso = queueData?.finishedAt || existingUserData?.finishedAt || null;
            const finishedAtMs = finishedAtIso ? new Date(finishedAtIso).getTime() : 0;
            const isPaymentAlreadyConsumed = !!((queueStatus === "finished" || existingUserData?.isConsultationFinished === true || existingUserData?.consultationStatus === "finished") && (finishedAtMs > 0 && finishedAtMs > paymentDate.getTime() + 5e3 || !finishedAtMs && existingUserData?.lastPaymentId === String(p.mpId)));
            if (!isPaymentAlreadyConsumed && queueStatus !== "in-consultation") {
              const patientName = existingUserData?.name || p.payerName || "Paciente";
              const queuePayload = {
                id: targetId,
                patientName,
                name: patientName,
                email: p.payerEmail || existingUserData?.email || "",
                phone: existingUserData?.phone || "",
                cpf: existingUserData?.cpf || "",
                birthDate: existingUserData?.birthDate || "",
                answers: existingUserData?.answers || {},
                tier: p.isPremium ? "Premium" : "basic",
                isPremium: p.isPremium,
                plan: p.plan,
                selectedOffer: p.plan,
                queueType: p.queueType,
                joinedAt: p.date || (/* @__PURE__ */ new Date()).toISOString(),
                status: "waiting",
                pagamento_consulta: true,
                pagamento_premium: p.isPremium
              };
              await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "users", targetId), {
                pagamento_consulta: true,
                pagamento_premium: p.isPremium,
                hasPaid: true,
                isPaid: true,
                plan: p.plan,
                selectedOffer: p.plan,
                queueType: p.queueType,
                isPremium: p.isPremium,
                inQueue: true,
                isConsultationFinished: false,
                consultationActive: false,
                consultationStatus: "waiting",
                lastPaymentId: String(p.mpId),
                lastPaymentDate: p.date || (/* @__PURE__ */ new Date()).toISOString()
              }, { merge: true }).catch(() => {
              });
              await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "queue", targetId), queuePayload, { merge: true }).catch(() => {
              });
              try {
                const srvQ = loadServerQueue();
                const qIdx = srvQ.findIndex((item) => item.id === targetId);
                if (qIdx >= 0) {
                  if (srvQ[qIdx].status !== "in-consultation") {
                    srvQ[qIdx] = { ...srvQ[qIdx], ...queuePayload };
                  }
                } else {
                  srvQ.unshift(queuePayload);
                }
                saveServerQueue(srvQ);
              } catch {
              }
            }
          }
        } catch (fsErr) {
        }
      }
      console.log(`[MP SYNC] ${results.length} pagamentos aprovados sincronizados do Mercado Pago.`);
      res.json({
        configured: true,
        count: results.length,
        payments: results
      });
    } catch (e) {
      console.error("[MP SYNC] Erro ao sincronizar:", e);
      res.status(500).json({ configured: false, error: e.message });
    }
  });
  app2.post("/api/save-mercadopago-token", async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length < 10) {
        return res.status(400).json({ error: "Token inv\xE1lido fornecido." });
      }
      await (0, import_firestore2.setDoc)((0, import_firestore2.doc)(db, "settings", "mercadopago"), {
        accessToken: accessToken.trim(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
      res.json({ success: true, message: "Token do Mercado Pago salvo com sucesso!" });
    } catch (e) {
      console.error("Erro ao salvar token MP:", e);
      res.status(500).json({ error: "Falha ao salvar no banco", details: e.message });
    }
  });
  app2.post("/api/create-preference", async (req, res) => {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const origin = req.headers.origin || (host ? `${proto}://${host}` : "") || process.env.APP_URL || "http://localhost:3000";
    try {
      const { title, price, quantity = 1, payerEmail, payerName, patientId, isPremium, plan } = req.body;
      const resolvedPlan = plan === "complete" || plan === "premium" || plan === "psychologist" || plan === "basic" ? plan : isPremium ? "premium" : "basic";
      const resolvedIsPrem = isPremium || resolvedPlan === "premium" || resolvedPlan === "complete";
      const mpInfo = await getMpClient();
      if (!mpInfo) {
        console.warn("\u26A0\uFE0F Token do Mercado Pago n\xE3o configurado. Fornecendo fallback de teste.");
        return res.json({
          id: "test-pref-" + Date.now(),
          init_point: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(resolvedPlan)}`,
          sandbox_init_point: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(resolvedPlan)}`,
          isTestMode: true
        });
      }
      const numPrice = Math.round(Number(price) * 100) / 100;
      const maxInstallments = req.body.installments ? Number(req.body.installments) : numPrice > 100 ? 5 : 3;
      const preference = new import_mercadopago.Preference(mpInfo.client);
      const isSellerEmail = payerEmail && (payerEmail.toLowerCase().includes("lucasdanieltrader") || payerEmail.toLowerCase().includes("lucasneres"));
      const safePayerEmail = isSellerEmail ? "paciente.consulta@mecura.com" : payerEmail || void 0;
      const isHttps = origin.startsWith("https://");
      const result = await preference.create({
        body: {
          items: [{
            id: "consultation-" + Date.now(),
            title: title || "Consulta Mecura",
            quantity: Number(quantity) || 1,
            unit_price: numPrice,
            currency_id: "BRL"
          }],
          payer: safePayerEmail ? {
            email: safePayerEmail,
            name: payerName || "Paciente"
          } : void 0,
          external_reference: patientId || void 0,
          metadata: {
            patient_id: patientId || "",
            patient_name: payerName || "",
            is_premium: resolvedIsPrem,
            plan: resolvedPlan,
            coupon_code: req.body.couponCode || "",
            coupon_id: req.body.couponId || "",
            affiliate_name: req.body.affiliateName || "",
            commission_percentage: Number(req.body.commissionPercentage || 0),
            via_link: Boolean(req.body.viaLink),
            original_price: Number(req.body.originalPrice || numPrice)
          },
          ...isHttps ? {
            back_urls: {
              success: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(resolvedPlan)}`,
              failure: `${origin}/checkout?payment=failed&plan=${encodeURIComponent(resolvedPlan)}`,
              pending: `${origin}/dashboard?payment=pending&plan=${encodeURIComponent(resolvedPlan)}`
            },
            auto_return: "approved"
          } : {},
          notification_url: (process.env.APP_URL || origin).startsWith("https://") ? `${process.env.APP_URL || origin}/api/webhook` : void 0,
          statement_descriptor: "MECURA SAUDE"
        }
      });
      res.json({ id: result.id, init_point: result.init_point, sandbox_init_point: result.sandbox_init_point, plan: resolvedPlan });
    } catch (error) {
      console.error("Erro MP Preference:", error?.message || error);
      return res.status(500).json({
        error: "Falha ao criar prefer\xEAncia no Mercado Pago",
        message: error?.message || "Erro desconhecido"
      });
    }
  });
  app2.get("/api/check-payment/:id", async (req, res) => {
    try {
      const mpInfo = await getMpClient();
      if (!mpInfo) {
        return res.status(500).json({ error: "Configura\xE7\xE3o do Mercado Pago ausente." });
      }
      const payment = new import_mercadopago.Payment(mpInfo.client);
      const result = await payment.get({ id: req.params.id });
      res.json({ status: result.status });
    } catch (error) {
      console.error("Erro ao checar pagamento:", error);
      res.status(500).json({ error: "Failed to check payment" });
    }
  });
  app2.post("/api/create-pix-payment", async (req, res) => {
    try {
      const { title, price, email, firstName, lastName, patientId, isPremium, plan } = req.body;
      const resolvedPlan = plan === "complete" || plan === "premium" || plan === "psychologist" || plan === "basic" ? plan : isPremium ? "premium" : "basic";
      const resolvedIsPrem = isPremium || resolvedPlan === "premium" || resolvedPlan === "complete";
      const mpInfo = await getMpClient();
      if (!mpInfo) {
        return res.status(500).json({ error: "Configura\xE7\xE3o do Mercado Pago ausente no servidor." });
      }
      const cleanPrice = Math.round(Number(price) * 100) / 100;
      if (cleanPrice <= 0) {
        return res.status(400).json({ error: "O valor da transa\xE7\xE3o deve ser maior que R$ 0,00." });
      }
      console.log(`Tentando criar pagamento Pix: R$${cleanPrice} para ${email} (Plano: ${resolvedPlan})`);
      const payment = new import_mercadopago.Payment(mpInfo.client);
      const isSellerEmail = email && (email.toLowerCase().includes("lucasdanieltrader") || email.toLowerCase().includes("lucasneres"));
      const safeEmail = isSellerEmail ? "paciente.consulta@mecura.com" : email || "paciente@mercura.com";
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const origin = req.headers.origin || (host ? `${proto}://${host}` : "") || process.env.APP_URL || "";
      const result = await payment.create({
        body: {
          transaction_amount: cleanPrice,
          description: title,
          payment_method_id: "pix",
          payer: {
            email: safeEmail,
            first_name: firstName || "Paciente",
            last_name: lastName || "Mecura",
            identification: {
              type: "CPF",
              number: "00000000000"
            }
          },
          external_reference: patientId || void 0,
          metadata: {
            patient_id: patientId || "",
            patient_name: firstName || "",
            is_premium: resolvedIsPrem,
            plan: resolvedPlan,
            coupon_code: req.body.couponCode || "",
            coupon_id: req.body.couponId || "",
            affiliate_name: req.body.affiliateName || "",
            commission_percentage: Number(req.body.commissionPercentage || 0),
            via_link: Boolean(req.body.viaLink),
            original_price: Number(req.body.originalPrice || cleanPrice)
          },
          notification_url: (process.env.APP_URL || origin).startsWith("https://") ? `${process.env.APP_URL || origin}/api/webhook` : void 0
        }
      });
      console.log("Pagamento Pix criado com sucesso!", result.id);
      res.json({
        id: result.id,
        status: result.status,
        plan: resolvedPlan,
        isPremium: resolvedIsPrem,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64
      });
    } catch (error) {
      console.error("ERRO DETALHADO MERCADO PAGO:", error);
      const mpError = error.cause?.[0]?.description || error.message;
      res.status(500).json({
        error: "Erro ao gerar o Pix via Mercado Pago.",
        details: mpError
      });
    }
  });
  app2.get("/api/payment-status/:id", async (req, res) => {
    try {
      const paymentId = req.params.id;
      try {
        const paySnap = await (0, import_firestore2.getDoc)((0, import_firestore2.doc)(db, "payments", String(paymentId)));
        if (paySnap.exists()) {
          const pData = paySnap.data();
          if (pData.status === "approved" || pData.status === "completed" || pData.type) {
            return res.json({
              status: "approved",
              plan: pData.plan || pData.selectedOffer,
              isPremium: pData.isPremium,
              queueType: pData.queueType
            });
          }
        }
      } catch (fErr) {
        console.warn("[PAYMENT STATUS] Erro ao checar Firestore:", fErr);
      }
      const mpInfo = await getMpClient();
      if (!mpInfo) {
        return res.status(500).json({ error: "Mercado Pago n\xE3o configurado." });
      }
      const payment = new import_mercadopago.Payment(mpInfo.client);
      const result = await payment.get({ id: paymentId });
      const resolved = result ? resolvePaymentPlan(result) : null;
      if (result && (result.status === "approved" || result.status === "completed")) {
        processApprovedPayment(result).catch((e) => console.warn("Erro ao processar fila p\xF3s verifica\xE7\xE3o de status:", e));
      }
      res.json({
        status: result.status,
        plan: resolved?.plan,
        isPremium: resolved?.isPrem,
        queueType: resolved?.queueType
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao consultar status." });
    }
  });
  app2.get("/api/test-env", (req, res) => {
    res.json({
      mp: process.env.MERCADO_PAGO_ACCESS_TOKEN || "MISSING",
      gemini: process.env.GEMINI_API_KEY ? "CONFIGURED" : "MISSING"
    });
  });
  function generateClinicalAnalysisFallback(promptText) {
    const isPain = /dor|inflama|coluna|lombar|muscular|artrite|fibromialgia/i.test(promptText);
    const isInsomnia = /sono|insônia|dormir|acordar/i.test(promptText);
    let primaryCondition = "Ansiedade Generalizada, Estresse Cr\xF4nico e Modula\xE7\xE3o do Humor";
    let importedProducts = [
      {
        name: "GreenBudz Calm Vibe Oil 6000mg",
        indication: "Ansiedade Generalizada, Estresse e Modula\xE7\xE3o do Humor",
        usage: "**10 gotas (25mg de CBD)** por via sublingual, de **12 em 12 horas** (pela manh\xE3 e ao entardecer)",
        notes: "Reter sob a l\xEDngua por 60 a 90 segundos antes de engolir para r\xE1pida absor\xE7\xE3o e maior biodisponibilidade."
      },
      {
        name: "Drops By GreenBudz Goma Beethoven THC",
        indication: "Conforto F\xEDsico, Al\xEDvio da Tens\xE3o Emocional e Equil\xEDbrio Sist\xEAmico",
        usage: "Mastigar **01 goma** ao entardecer para transi\xE7\xE3o e relaxamento.",
        notes: "Goma comest\xEDvel com libera\xE7\xE3o prolongada de 4 a 6 horas para relaxamento sustentado."
      },
      {
        name: "Flor In Natura Zoap (THCA) 14g",
        indication: "Resgate Inalat\xF3rio para Descompress\xE3o e Equil\xEDbrio Mental Imediato",
        usage: "Vaporizar **0,1g** a 180\xB0C em vaporizador t\xE9rmico medicinal nos momentos de tens\xE3o aguda.",
        notes: "Infloresc\xEAncia com THCA para a\xE7\xE3o de al\xEDvio r\xE1pido em 1 a 3 minutos sem combust\xE3o."
      },
      {
        name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
        indication: "Extra\xE7\xE3o Concentrada para Resgate \xC1lgico Agudo e Picos de Estresse Severo",
        usage: "Microdosagem em vaporizador de concentrados (180\xB0C-210\xB0C) em crises severas.",
        notes: "Ultra-concentrado com 71,6% de THCA para quebra imediata de crises agudas."
      }
    ];
    let nationalProducts = [
      {
        name: "\xD3LEO INTEGRAL PREDOMINANTE CBD 100mg/ml - Associa\xE7\xE3o Nacional",
        indication: "Controle de Ansiedade, Estresse Cr\xF4nico e Modula\xE7\xE3o do Humor",
        usage: "Tomar **05 a 10 gotas** de manh\xE3 e **05 gotas** \xE0 tarde.",
        notes: "01 Frasco de 30ml - Associa\xE7\xE3o Brasileira. Uso sublingual cont\xEDnuo com titula\xE7\xE3o progressiva."
      },
      {
        name: "Pomada Can\xE1bica Terap\xEAutica 500mg (50g) - Associa\xE7\xE3o Nacional",
        indication: "Al\xEDvio T\xF3pico de Tens\xF5es Musculares e Estresse Somatizado",
        usage: "Aplicar na regi\xE3o cervical, ombros ou peito **2 a 3 vezes ao dia**, massageando suavemente.",
        notes: "01 Pote 50g - Associa\xE7\xE3o Brasileira. A\xE7\xE3o perif\xE9rica direta em receptores cut\xE2neos CB2."
      },
      {
        name: "Flor in natura PREDOMINANTE THC (Para Vaporiza\xE7\xE3o) 15g - Associa\xE7\xE3o Nacional",
        indication: "Resgate Imediato para Crises de Tens\xE3o Aguda e Descompress\xE3o Mental",
        usage: "Vaporizar **0,1g a 0,15g** via vaporizador t\xE9rmico medicinal a 175\xB0C-185\xB0C.",
        notes: "Flores secas padronizadas de Associa\xE7\xE3o Brasileira. Resposta terap\xEAutica inalat\xF3ria em 1 a 3 minutos sem combust\xE3o."
      }
    ];
    if (isPain) {
      primaryCondition = "Dor Cr\xF4nica, Processos Inflamat\xF3rios e Tens\xE3o Muscular";
      importedProducts = [
        {
          name: "Flowermed Full Spectrum 1:1 THC + CBD",
          indication: "Analgesia Sist\xEAmica Cont\xEDnua e A\xE7\xE3o Neurop\xE1tica (\xD3leo Sublingual)",
          usage: "**05 a 08 gotas** por via sublingual, de **12 em 12 horas**",
          notes: "Propor\xE7\xE3o balanceada 1:1 com sinergia analg\xE9sica para al\xEDvio basal da dor cr\xF4nica."
        },
        {
          name: "Gummies D9 10 mg 30 un",
          indication: "Crises \xC1lgicas Noturnas e Relaxamento Muscular Profundo (Gomas Comest\xEDveis)",
          usage: "Mastigar **1 goma** ao final da tarde ou 1h antes de deitar.",
          notes: "Forma farmac\xEAutica oral pr\xE1tica com libera\xE7\xE3o prolongada de 4 a 6 horas para controle da dor."
        },
        {
          name: "Flor In Natura Superglue (THCA) 14g",
          indication: "Resgate Inalat\xF3rio Imediato para Picos de Dor e Espasmos (Flores 14g)",
          usage: "Vaporizar **0,1g a 0,2g** a 185\xB0C no momento da crise de dor.",
          notes: "Infloresc\xEAncia rica em THCA para a\xE7\xE3o analg\xE9sica imediata em 2 a 5 minutos sem combust\xE3o."
        },
        {
          name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
          indication: "Extra\xE7\xE3o Concentrada de Alt\xEDssima Pot\xEAncia para Picos Agudos de Dor Refrat\xE1ria (Seringa)",
          usage: "Microdosagem em vaporizador medicinal de concentrados nos momentos de dor severa.",
          notes: "Extra\xE7\xE3o pura com 71,6% de THCA para evitar idas ao pronto-socorro."
        }
      ];
      nationalProducts = [
        {
          name: "\xD3LEO INTEGRAL THC/CBD 100mg/ml - Associa\xE7\xE3o Nacional",
          indication: "Analgesia Cont\xEDnua, Modula\xE7\xE3o de Dores Neurop\xE1ticas e Inflamat\xF3rias",
          usage: "Tomar **05 a 08 gotas** de **12 em 12 horas** (sublingual).",
          notes: "01 Frasco de 30ml - Associa\xE7\xE3o Brasileira. Efeito entourage balanceado (1:1) de uso cont\xEDnuo."
        },
        {
          name: "Pomada Can\xE1bica Terap\xEAutica 500mg (50g) - Associa\xE7\xE3o Nacional",
          indication: "Al\xEDvio T\xF3pico Localizado para Articula\xE7\xF5es e M\xFAsculos Doloridos",
          usage: "Aplicar fina camada sobre a regi\xE3o afetada **2 a 3 vezes ao dia**, massageando suavemente.",
          notes: "01 Pote 50g - Associa\xE7\xE3o Brasileira. A\xE7\xE3o anti-inflamat\xF3ria t\xF3pica localizada sem seda\xE7\xE3o."
        },
        {
          name: "Flor in natura PREDOMINANTE THC (Para Vaporiza\xE7\xE3o) 15g - Associa\xE7\xE3o Nacional",
          indication: "Controle de Crises Agudas e Picos de Dor Intrat\xE1vel (Resgate Inalat\xF3rio)",
          usage: "Vaporizar **0,1g a 0,2g** via vaporizador t\xE9rmico medicinal a 180\xB0C nas crises \xE1lgicas.",
          notes: "01 Frasco de 15g - Associa\xE7\xE3o Brasileira. In\xEDcio de a\xE7\xE3o ultrarr\xE1pido (1 a 3 minutos) para resgate agudo."
        }
      ];
    } else if (isInsomnia) {
      primaryCondition = "Dist\xFArbios do Sono, Ins\xF4nia Cr\xF4nica e Fragmenta\xE7\xE3o Noturna";
      importedProducts = [
        {
          name: "Flowermed CBN 300 mg + CBD 900 mg",
          indication: "Indu\xE7\xE3o e Manuten\xE7\xE3o do Sono Reparador (\xD3leo Sublingual com CBN)",
          usage: "**06 a 08 gotas** por via sublingual, **30 a 45 minutos antes de deitar**",
          notes: "O Canabinol (CBN) \xE9 o fitocanabinoide de escolha para arquitetura do sono profundo."
        },
        {
          name: "CBN Sleep Gummies 30 un",
          indication: "Sono Prolongado e Preven\xE7\xE3o de Despertares Noturnos (Gomas Mastig\xE1veis)",
          usage: "Mastigar **01 goma** 45 minutos antes do repouso.",
          notes: "Gomas mastig\xE1veis de a\xE7\xE3o prolongada com fitocanabinoides sin\xE9rgicos (CBN/CBD)."
        },
        {
          name: "Flor In Natura Glitter Bomb (THCA) 14g",
          indication: "Resgate Inalat\xF3rio Noturno para Desligamento Mental e Ins\xF4nia Refrat\xE1ria",
          usage: "Vaporizar **0,1g** a 180\xB0C imediatamente antes de deitar.",
          notes: "Gen\xE9tica 70% \xCDndica rica em THCA, Mirceno e Linalol para indu\xE7\xE3o imediata do sono profundo."
        },
        {
          name: "Hemp Oil Gold Budder 5g (Vers\xE3o THCA)",
          indication: "Extra\xE7\xE3o Concentrada para Relaxamento F\xEDsico Noturno e Indu\xE7\xE3o do Sono",
          usage: "Microdosagem vaporizada 30 minutos antes do repouso nos dias de ins\xF4nia persistente.",
          notes: "Extra\xE7\xE3o cremosa concentrada rica em terpenos sedativos e THCA."
        }
      ];
      nationalProducts = [
        {
          name: "\xD3LEO INTEGRAL PREDOMINANTE THC 100mg/ml - Associa\xE7\xE3o Nacional",
          indication: "Indu\xE7\xE3o Fisiol\xF3gica e Estabiliza\xE7\xE3o dos Ciclos do Sono",
          usage: "Tomar **04 a 06 gotas** \xE0 noite 30 minutos antes de dormir.",
          notes: "01 Frasco de 30ml - Associa\xE7\xE3o Brasileira. Facilita o adormecer e modula o t\xF4nus de relaxamento."
        },
        {
          name: "Pomada Can\xE1bica Terap\xEAutica 500mg (50g) - Associa\xE7\xE3o Nacional",
          indication: "Al\xEDvio T\xF3pico e Relaxamento Muscular Noturno",
          usage: "Aplicar fina camada sobre ombros, nuca e peito antes do repouso.",
          notes: "01 Pote 50g - Associa\xE7\xE3o Brasileira. Modula\xE7\xE3o perif\xE9rica CB2 relaxante."
        },
        {
          name: "Flor in natura PREDOMINANTE THC (Para Vaporiza\xE7\xE3o) 15g - Associa\xE7\xE3o Nacional",
          indication: "Resgate Inalat\xF3rio Noturno para Ins\xF4nia Refrat\xE1ria e Desacelera\xE7\xE3o Mental",
          usage: "Vaporizar **0,1g** em vaporizador medicinal a 180\xB0C imediatamente antes de deitar.",
          notes: "Flores secas padronizadas de Associa\xE7\xE3o Brasileira. Indu\xE7\xE3o imediata do sono sem combust\xE3o."
        }
      ];
    }
    return `# Avalia\xE7\xE3o do Quadro Cl\xEDnico
O paciente apresenta manifesta\xE7\xE3o cl\xEDnica compat\xEDvel com quadro de **${primaryCondition}**. A avalia\xE7\xE3o dos dados anamn\xE9sicos indica necessidade de regula\xE7\xE3o homeost\xE1tica do t\xF4nus endocanabinoide, com foco no al\xEDvio sintom\xE1tico, melhora da qualidade de vida e restaura\xE7\xE3o do equil\xEDbrio neurofisiol\xF3gico.

# Racional Terap\xEAutico (Sistema Endocanabinoide)
O tratamento visa a estimula\xE7\xE3o e modula\xE7\xE3o alost\xE9rica dos receptores **CB1** e **CB2**, al\xE9m de agonismo indireto sobre receptores serotonin\xE9rgicos **5-HT1A** e canais **TRPV1**. 
- O **Canabidiol (CBD)** atua inibindo a recapta\xE7\xE3o de anandamida e a enzima FAAH, reduzindo a hiperexcitabilidade neuronal e mediadores pr\xF3-inflamat\xF3rios (IL-6, TNF-alfa).
- O **Tetrahidrocanabinol (THC)** em dosagens microdosadas e controladas potencializa o t\xF4nus analg\xE9sico e sinergia de sono.
- O **Efeito Comitiva (Entourage Effect)** obtido por f\xF3rmulas Full Spectrum otimiza a biodisponibilidade atrav\xE9s de terpenos sin\xE9rgicos (Mirceno, Linalol, Beta-cariofileno).

# Sugest\xF5es de Fitocanabinoides e Vias de Administra\xE7\xE3o
- **Op\xE7\xE3o Importada**: Produtos padronizados de alta pureza e formula\xE7\xE3o farmac\xEAutica do cat\xE1logo oficial.
- **Op\xE7\xE3o Nacional (Associa\xE7\xF5es Brasileiras)**: Formula\xE7\xF5es manipuladas acess\xEDveis (\xD3leos integrais concentrados, Pomadas t\xF3picas, Gomas e Flores *in natura* para vaporiza\xE7\xE3o).
- **Estrat\xE9gia de Titula\xE7\xE3o**: Princ\xEDpio *"Start Low, Go Slow"* \u2014 iniciar com dosagens basais e titular a cada 3 a 5 dias conforme tolerabilidade e desfecho cl\xEDnico.

# Evid\xEAncias Cient\xEDficas e Estudos Base
- **Estudos Cl\xEDnicos Controlados**: Ensaios cl\xEDnicos randomizados demonstram que canabinoides orais e inalat\xF3rios reduzem significativamente escalas de severidade de sintomas (HAM-A, VAS de dor e PSQI para qualidade do sono).
- **Consenso Internacional de Dosagem Canabinoide (2021)**: Suporta o uso de extratos padronizados e formula\xE7\xF5es associativas com acompanhamento m\xE9dico continuado.

# Precau\xE7\xF5es e Intera\xE7\xF5es Medicamentosas
- **Metabolismo Hep\xE1tico**: Monitorar poss\xEDveis intera\xE7\xF5es via citocromo P450 (**CYP3A4** e **CYP2C19**), especialmente se o paciente fizer uso concomitante de outros f\xE1rmacos de metaboliza\xE7\xE3o hep\xE1tica.
- **Reavalia\xE7\xE3o Peri\xF3dica**: Agendar consulta de retorno em **15 a 30 dias** para ajuste de dosagem e avalia\xE7\xE3o de resposta terap\xEAutica.

# **RESUMO DE PRESCRI\xC7\xC3O SUGERIDA**

### **OP\xC7\xD5ES IMPORTADAS (CAT\xC1LOGO OFICIAL)**
${importedProducts.map((p) => `**Medicamento**: **${p.name}**
**Indica\xE7\xE3o/Doen\xE7a**: **${p.indication}**
**Modo de Uso**: ${p.usage}
**Observa\xE7\xF5es**: ${p.notes}`).join("\n\n")}

### **OP\xC7\xD5ES NACIONAIS (ASSOCIA\xC7\xD5ES BRASILEIRAS)**
${nationalProducts.map((p) => `**Medicamento**: **${p.name}**
**Indica\xE7\xE3o/Doen\xE7a**: **${p.indication}**
**Modo de Uso**: ${p.usage}
**Observa\xE7\xF5es**: ${p.notes}`).join("\n\n")}

### **PLANO DE ENTRADA ACESS\xCDVEL (CUSTO REDUZIDO / ASSOCIA\xC7\xC3O INICIAL)**
- **Estrat\xE9gia de Acessibilidade**: Para pacientes com restri\xE7\xE3o or\xE7ament\xE1ria que n\xE3o tenham condi\xE7\xF5es de adquirir todos os itens no in\xEDcio, adotar o **Protocolo de Entrada Escalonado com Frasco \xDAnico de Associa\xE7\xE3o Nacional** (Alto rendimento: 45 a 60 dias por frasco).
- **Fase 1 (In\xEDcio Acess\xEDvel / Frasco Essencial)**: Prescrever **${nationalProducts[0]?.name || "\xD3LEO INTEGRAL PREDOMINANTE CBD 100mg/ml"}** (Associa\xE7\xE3o Brasileira).
  - *Posologia Econ\xF4mica*: Iniciar com **03 gotas pela manh\xE3 e 03 gotas \xE0 noite**, aumentando 01 gota a cada 05 dias at\xE9 atingir a dose de manuten\xE7\xE3o (rendimento prolongado do frasco).
- **Fase 2 (Evolu\xE7\xE3o Conforme Necessidade e Condi\xE7\xF5es Financeiras)**: Reavalia\xE7\xE3o cl\xEDnica em 30 a 45 dias. Caso o paciente atinja estabilidade satisfat\xF3ria, mant\xE9m-se a monoterapia econ\xF4mica. Havendo queixas residuais e viabilidade or\xE7ament\xE1ria futura, introduzir formula\xE7\xE3o t\xF3pica ou complementar.
`;
  }
  app2.post("/api/admin-agronomic-ai", async (req, res) => {
    const { medicalReportText, prescriptionText, medicalReportFile, prescriptionFile, agronomistName, agronomistCrea, targetPlants } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key n\xE3o configurada. A funcionalidade de IA requer a chave no .env." });
    }
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const systemPrompt = `Voc\xEA \xE9 um assistente que gera laudos agron\xF4micos de autocultivo medicinal para instru\xE7\xE3o de processos de Habeas Corpus (HC).
O usu\xE1rio deseja que o laudo tenha o texto ID\xCANTICO ao modelo fornecido por ele, alterando APENAS as vari\xE1veis matem\xE1ticas e os dados do paciente com base na receita/laudo m\xE9dico enviados.

ATEN\xC7\xC3O AOS C\xC1LCULOS (Siga estritamente):
${targetPlants ? `O USU\xC1RIO DEFINIU UMA QUANTIDADE EXATA DE PLANTAS A SEREM RECOMENDADAS: ${targetPlants} plantas.
Voc\xEA DEVE ajustar TODOS os seus c\xE1lculos para que o resultado final "Plantas totais" seja EXATAMENTE ${targetPlants}. Refa\xE7a a matem\xE1tica de tr\xE1s para frente se necess\xE1rio (ajustando a mg/dia ou rendimento/teor para bater essa meta perfeitamente).` : ""}

1. Extraia o total de mg/dia de todos os \xF3leos/flores prescritos. (Se a receita enviada for a do exemplo, o valor \xE9 5000mg/dia). ${targetPlants ? "*(Ajuste isso ou o rendimento para bater o total de plantas desejado)*" : ""}
2. Mensal = mg/dia * 30.
3. Anual = mg/dia * 365 (Ex: se 5000mg/dia, anual \xE9 1.825.000mg ou 1.825g).
4. Peso de flor seca base: assuma rendimento de extra\xE7\xE3o (se aplic\xE1vel) e teor. (No modelo: 10% de teor, ou seja, 1.825g canabinoides = 18.250g de flores secas, que equivale a 18.250kg).
5. Margem de perda de 30% no cultivo. Multiplique o peso de flor seca por 1.30.
6. Plantas totais: Divida o peso final com margem por 150g (rendimento por planta). ${targetPlants ? `(OBRIGAT\xD3RIO RESULTAR EM ${targetPlants} PLANTAS)` : ""}
7. Sementes: Total de plantas * 1.30 (Margem de germina\xE7\xE3o de 30%). (Ex: 158 * 1.30 = 205.4 -> 206 sementes).
8. Ciclos: 3 colheitas por ano. Plantas por ciclo = Total de Plantas / 3.

Use a estrutura de HTML abaixo. N\xE3o mude as palavras, n\xE3o crie resumos pr\xF3prios. Copie e cole este HTML e apenas PREENCHA OS DADOS entre colchetes [ ]:

<div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; text-align: justify; padding: 20px;" id="agronomic-report-content">
    <div style="text-align: center; font-weight: bold; margin-bottom: 20px; line-height: 1.2;">
        <p style="margin: 0;">Auto cultivo para finalidade medicinal</p>
        <p style="margin: 0;">Parecer T\xE9cnico</p>
        <p style="margin: 0;">Indica\xE7\xF5es t\xE9cnicas para cultivo pessoal com finalidade medicinal</p>
        <p style="margin: 0;">Paciente: [NOME DO PACIENTE]</p>
        <p style="margin: 0;">CPF PACIENTE: [CPF DO PACIENTE]</p>
        <p style="margin: 0;">Consultor e Eng. Agr: ${agronomistName || "Wilian Dalenogare Pereira"}</p>
        <p style="margin: 0;">Indica\xE7\xF5es t\xE9cnicas para cultivo pessoal de Cannabis sativa L. com finalidade medicinal.</p>
    </div>

    <p style="font-weight: bold; margin-bottom: 10px;">Resumo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A ANVISA definiu, por meio da Resolu\xE7\xE3o da Diretoria Colegiada (RDC) n\xBA 335/2020, alterada pela RDC n\xB0 570/2021, os crit\xE9rios e os procedimentos para a importa\xE7\xE3o de Produto derivado de Cannabis, por pessoa f\xEDsica, para uso pr\xF3prio, mediante prescri\xE7\xE3o de profissional legalmente habilitado, para tratamento de sa\xFAde. Dessa forma, ainda que o produto n\xE3o tenha registro para comercializa\xE7\xE3o no Brasil, a importa\xE7\xE3o poder\xE1 ser autorizada se os crit\xE9rios e procedimentos definidos na mencionada RDC forem cumpridos. E, dessa forma, a ANVISA publicou, em 6/10/2021, a Nota T\xE9cnica n\xBA 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA com a lista de produtos derivados de Cannabis de que trata o \xA73\xBA do Art. 5\xB0 da RDC n\xB0 335/2020, alterada pela RDC n\xB0 570/2021 (dispon\xEDvel em https://www.gov.br/anvisa/pt-br/assuntos/noticiasanvisa/2021/anvisa-otimiza-processo-de-avaliacao-da-importacao-de-produtosderivados-de-cannabis-por-pessoa-fisica/NotaTcnicaCannabis.pdf - Acesso em 13/10/2023).</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A fim de proporcionar uma orienta\xE7\xE3o adequada para um cultivo em escala pequena, conhecido como \u201Ccultivo caseiro\u201D, para paciente que necessita utilizar as mol\xE9culas produzidas pela esp\xE9cie, nomeadamente o \u03949 \u2013 Tetrahidrocanabinol (THC) e o Cannabidiol (CBD) reconhecidas por suas propriedades terap\xEAuticas, foi elaborado este parecer com indica\xE7\xF5es t\xE9cnicas para o cultivo com boas pr\xE1ticas comercialmente conhecido por GACP (Good Agriculture and Collection Practices), em portugu\xEAs, boas pr\xE1ticas de agricultura e coleta, aplicadas para garantir o sucesso em termos de produtividade e a sanidade adequada dos cultivos (m\xE9todos estes aplicados as mais diversas esp\xE9cies de interesse medicinal e alimentar, n\xE3o restrito a Cannabis).</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Dimensionamento do Cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O cultivo caseiro \xE9 a maneira indicada de garantir o acesso aos medicamentos para pacientes que n\xE3o tem condi\xE7\xF5es de arcar com os altos custos dos medicamentos atualmente dispon\xEDveis, que normalmente ultrapassa a barreira dos R$ 2.000,00 a R$5.000,00 mensais, para produtos dispon\xEDveis nacionalmente, podendo atingir at\xE9 valores muito mais elevados quando \xE9 feita a importa\xE7\xE3o (principalmente em momento de alta do D\xF3lar). Por\xE9m n\xE3o somente pacientes que n\xE3o tem condi\xE7\xF5es de pagar os pre\xE7os de mercado dos produtos de sua medicina e ter a capacidade de se tornarem autossustent\xE1veis em produ\xE7\xE3o e manipula\xE7\xE3o da mesma buscam o cultivo da Cannabis e os benef\xEDcios que este pode trazer.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Estes medicamentos contem em m\xE9dia, entre 5-6G de CBD em sua composi\xE7\xE3o, por frasco de 30 ml (200 mg no CBD/ml), e teores mais reduzidos de THC, devido ao seu efeito psicoativo. No caso do paciente, conforme recomenda\xE7\xF5es m\xE9dicas que balizam este parecer t\xE9cnico, a condi\xE7\xE3o de [CIDs E DOEN\xC7AS EXTRA\xCDDAS DO LAUDO M\xC9DICO, ex: Transtorno de Dist\xFArbios no Sono (CID 10 G47) Lombalgia ( CID 10 R54.5)] visam ser tratado com o uso de extratos de [CANNABINOIDES DA RECEITA, ex: CBD/THC/CBG] em uma concentra\xE7\xE3o de [CONCENTRA\xC7\xC3O], sendo necess\xE1rios cerca de [FRASCOS MENSAIS/ANUAIS] frascos do produto para um per\xEDodo de 12 meses.</p>
    
    <p style="text-indent: 40px; margin-bottom: 15px;">No total o paciente ir\xE1 necessitar o equivalente a [TOTAL DE FRASCOS] frascos anuais dos produtos, que totalizam um consumo di\xE1rio de:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[TOTAL_MG_DIA]mg/dia de \xD3leo CBD/THC/CBG \xF3leo integral artesanal.</p>
    
    <p style="text-indent: 40px; margin-bottom: 15px;">Extrapolando o uso de CBD para intervalos mensais e anuais, temos que o paciente vai necessitar:</p>
    <p style="margin-left: 40px; margin-bottom: 15px;">
        Di\xE1rio: [TOTAL_MG_DIA]mg de CBD/THC/CBG.<br>
        (total obtido atrav\xE9s da quantidade de mg di\xE1rias de extratos e \xF3leo que o paciente \xE9 indicado a ingerir)<br>
        Mensal: [TOTAL_MG_DIA]mg x 31 dias = [TOTAL_MG_MENSAL] mg ou [TOTAL_G_MENSAL]g de CBD/THC/CBG.<br>
        Anual: [TOTAL_MG_DIA]mg x 365 dias = [TOTAL_MG_ANUAL]mg ou [TOTAL_G_ANUAL]g de CBD/THC/CBG.
    </p>

    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando que o conte\xFAdo m\xE9dio de CBD/THC nas variedades gen\xE9ticas de plantas de cannabis existentes hoje \xE9, em m\xE9dia, de 10% em peso seco de flores (podendo variar conforme gen\xE9tica escolhida de 1% at\xE9 30%). E que o teor final depende da experi\xEAncia de cultivo do usu\xE1rio, \xE9 seguro assumir que o teor m\xE9dio colhido pelo paciente seja em torno de 10%.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O processo de extra\xE7\xE3o da sust\xE2ncia, realizado de maneira improvisada na casa do paciente, sem equipamentos industriais, geram 10 g de peso de extrato bruto, considerando a efici\xEAncia de recupera\xE7\xE3o das mol\xE9culas (quando no CBD/THC presente na planta o paciente consegue transferir para o extrato) estima-se que seja na faixa de 80% (industrialmente pode chegar a 99%, por\xE9m de forma caseira deve ser de 80 ou menos).</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Temos a seguinte aritm\xE9tica:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A 100g de flores secas com teor de 10% de CBD/THC, geram 10G de extrato bruto concentrado com 10g de CBD/THC/CBG.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Para obter [TOTAL_G_ANUAL]g de CBD/THC/CBG para uso anualmente o paciente vai precisar produzir, no m\xEDnimo [FLOR_SECA_KG]kg de flores secas por ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">\xC9 necess\xE1rio levar em considera\xE7\xE3o perdas por ataques de pragas e doen\xE7as, erros na condu\xE7\xE3o do cultivo que acabam ocasionando a perda de plantas e situa\xE7\xF5es inesperadas. \xC9 natural considerar uma perda de 30% durante o per\xEDodo de cultivo. Essa considera\xE7\xE3o ocasiona que para garantir uma colheita de [FLOR_SECA_G]g o cultivo deve ser dimensionado para [FLOR_SECA_MARGEM_G]G secas por ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Em uma situa\xE7\xE3o de cultivo indoor, op\xE7\xE3o preferencial do paciente por motivos de espa\xE7o e seguran\xE7a, estima-se que cada planta produz entre 150-200g de flores secas, em um per\xEDodo de 120 dias em m\xE9dia (germina\xE7\xE3o \u2013 crescimento vegetativo \u2013 florescimento \u2013 colheita \u2013 secagem) em escala comercial. Um paciente que n\xE3o ter\xE1 como dedicar-se exclusivamente ao cultivo e que n\xE3o det\xE9m experi\xEAncia para operar esse cultivo, podemos dizer que deve cair pela metade o rendimento esperado, ou seja 100-150g de flores secas por planta.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Esse valor porem \xE9 o considerado em uma situa\xE7\xE3o ideal, devemos levar em conta que o paciente n\xE3o \xE9 um cultivador experiente e que n\xE3o possui equipamentos de alta qualidade dispon\xEDveis em escala comercial (nutrientes, ilumina\xE7\xE3o, meio de cultura). Lembrando que esse valor \xE9 de flores secas, ou seja, ap\xF3s a colheita e o processo de secagem para remo\xE7\xE3o da umidade, que prejudica a extra\xE7\xE3o quando presente nas flores. As flores ap\xF3s a colheita, perdem entre 70 \u2013 80% do peso total, ou seja, para atingir o valor 150g de flores secas cada planta deve produzir entre 700 a 750g de flores MOLHADAS.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando a quantidade total anual de [FLOR_SECA_MARGEM_KG]Kg de flores secas necess\xE1rias, o paciente deve produzir [FLOR_MOLHADA_KG] KILOGRAMAS de flores MOLHADAS, ap\xF3s processo de secagem alcan\xE7ando a quantidade correta de [FLOR_SECA_MARGEM_KG]Kg secas ANUALMENTE.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Estima-se ent\xE3o que para garantir seu consumo anual de CBD/THC, o paciente deve produzir o n\xFAmero de [TOTAL_PLANTAS] plantas em ciclo completo de flora\xE7\xE3o anualmente podendo ser em ciclos divididos durante o ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Com isso tamb\xE9m podemos estimar a importa\xE7\xE3o do n\xFAmero de [TOTAL_SEMENTES] sementes feminizadas CBD/THC/CBG, este n\xFAmero j\xE1 est\xE1 com a taxa de seguran\xE7a de 30% de perdas seja por falta de germina\xE7\xE3o pragas ou outros fatores.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Designer de cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A fim de garantir que essa quantidade de planta garantam o consumo anual do paciente, \xE9 necess\xE1rio estabelecer um plano de cultivo adequado.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A principal recomenda\xE7\xE3o \xE9 dividir o cultivo em 3 momentos de colheita ao longo do ano, fato facilitado pelo ciclo m\xE9dio de cultivo da esp\xE9cie ser de 120 dias ou 4 meses. Para tanto, o paciente dever\xE1 realizar o cultivo entre [PLANTAS_POR_CICLO_MIN] a [PLANTAS_POR_CICLO_MAX] plantas durante cada ciclo (Checagem matem\xE1tica: 3 ciclos de [PLANTAS_POR_CICLO_MAX] plantas totalizam [TOTAL_PLANTAS_CHECAGEM] plantas anuais, suprindo a demanda de [TOTAL_PLANTAS] plantas).</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando que somente plantas em est\xE1gio de flora\xE7\xE3o produzem as substancias de interesse, o paciente pode optar, a depender da estrutura que tem a sua disposi\xE7\xE3o para cultivo e manter plantas m\xE3e de diferentes variedades em estado vegetativo (facilmente realizado mantendo regime de luz acima de 12 horas di\xE1rias). Essas plantas seriam ent\xE3o utilizadas para retirada de mudas (comumente chamadas de clones) que seriam ent\xE3o enraizadas e desenvolvidas at\xE9 o momento de submeter as plantas ao florescimento. Essa pr\xE1tica \xE9 comumente utilizada em escala comercial e facilita a produ\xE7\xE3o de maneira continua para realizar as 3 ou mais colheitas anuais. Por\xE9m o paciente teria a dificuldade (e custo) adicionada de manter estas plantas de forma perene durante todo o ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A alternativa \xE9 realizar todo o processo de cultivo por 3 vezes no ano. Isso significa adquirir sementes, germinar, cultivar as plantas at\xE9 o tamanho desejado, estimular o florescimento e colher as flores ao final do ciclo. Em termos de custos, essa alternativa pode ser um pouco menos custosa, devido a n\xE3o ter a necessidade de manter as plantas m\xE3e separadamente, porem a compra continua de sementes aumente o custo total e tamb\xE9m o risco do processo, uma vez que caso se perca uma ou mais plantas, a \xFAnica alternativa \xE9 germinar outra semente causando problemas ao calend\xE1rio de cultivo e tamb\xE9m dificultando o processo como um todo, al\xE9m do que a germina\xE7\xE3o das sementes raramente \xE9 garantida, muitas vezes ficando na casa de 50% de todas as sementes compradas. Ao manter plantas m\xE3e continuamente prontas para produ\xE7\xE3o de mudas, o paciente vai ter muito mais seguran\xE7a, pois ao perder uma planta por algum motivo, pode come\xE7ar o ciclo de outra com muita facilidade al\xE9m de ganhar tempo no desenvolvimento de uma planta que j\xE1 vai estar em um est\xE1gio mais avan\xE7ado.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Cultivares indicados:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O mercado de cultivares para uso medicinal hoje \xE9 bastante conectado com o mercado recreativo, e existem diversas marcas dispon\xEDveis, com todo tipo de gen\xE9tica em termos de perfil fotoqu\xEDmico. Os perfis variam tanto em termos de terpenos, as substancias que definem o sabor e odor de vegetais variados, incluindo a Cannabis, e tamb\xE9m em termos de produ\xE7\xE3o de fitocannabin\xF3ides, com diferentes teores e propor\xE7\xF5es de CBD e THC.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando a recomenda\xE7\xE3o m\xE9dica, que sugere ao paciente o consumo de extratos com [ESPECIFICA\xC7\xD5ES DA RECEITA, ex: altos teores de CBD], a recomenda\xE7\xE3o agron\xF4mica vai na mesma linha, n\xE3o se comprometendo com nenhuma gen\xE9tica especifica, e deixando a escolha do paciente a experimenta\xE7\xE3o de diferentes variedades.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Recomenda-se que se utilize variedades que contenham teores de [CANABINOIDE, ex: CBD] na casa dos 10 a 12%, que normalmente s\xE3o mais seguras e confi\xE1veis, a possibilidade tamb\xE9m de escolha de cultivares que possuem apenas CBD ou apenas THC, torna-se mais simples o procedimento de extra\xE7\xE3o isolado e dosimetria do extrato com finalidade medicinal.</p>

    <p style="margin-bottom: 30px;"><span style="font-weight: bold;">OBSERVA\xC7\xC3O:</span> O Laudo t\xE9cnico \xE9 baseado nas informa\xE7\xF5es passadas pelo m\xE9dico ao paciente, estritamente para a quantifica\xE7\xE3o de cultivo de Cannabis medicinal. O profissional respons\xE1vel pelo laudo t\xE9cnico para quantifica\xE7\xE3o do cultivo medicinal n\xE3o se responsabiliza pelo uso indevido ou incorreto do laudo t\xE9cnico.</p>
    
    <!-- P\xC1GINA DE ASSINATURA -->
    <div style="page-break-inside: avoid; text-align: center; margin-top: 40px;">
        <p style="text-align: left; margin-bottom: 40px;">\xC9 o parecer;</p>
        
        <div style="margin: 0 auto; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Eng. Agr. ${agronomistName || "Wilian Dalenogare Pereira"}</p>
            <p style="font-weight: bold; margin: 0;">CREA: ${agronomistCrea || "052193520-2"}</p>
            <p style="font-weight: bold; margin: 0;">Luis Eduardo Magalh\xE3es \u2013 BA, [DATA ATUAL]</p>
        </div>
        
        <div style="margin: 40px auto 0; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Paciente: [NOME DO PACIENTE]</p>
            <p style="font-weight: bold; margin: 0;">CPF: [CPF DO PACIENTE]</p>
        </div>
    </div>
</div>

GERA\xC7\xC3O E REGRAS:
Gere APENAS o c\xF3digo HTML validado, SEM tags de markdown em volta.
Substitua todos os campos matem\xE1ticos baseados nos documentos processados.`;
      const contents = [systemPrompt];
      if (medicalReportText) contents.push(`LAUDO M\xC9DICO (Texto):
${medicalReportText}`);
      if (medicalReportFile) {
        contents.push({
          inlineData: { data: medicalReportFile.data.split(",")[1], mimeType: medicalReportFile.mimeType }
        });
      }
      if (prescriptionText) contents.push(`RECEITA M\xC9DICA (Texto):
${prescriptionText}`);
      if (prescriptionFile) {
        contents.push({
          inlineData: { data: prescriptionFile.data.split(",")[1], mimeType: prescriptionFile.mimeType }
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents
      });
      if (response.text) {
        return res.json({ markdown: response.text });
      }
    } catch (error) {
      console.error("Erro na API Gemini Agron\xF4mico:", error.message);
      let errMsg = error.message || "Falha desconhecida";
      if (errMsg.includes("leaked")) errMsg = "Sua chave de API do Gemini foi revogada pelo Google (leaked). Por favor, gere uma nova chave no Google AI Studio e atualize nas configura\xE7\xF5es.";
      else if (errMsg.includes("not found")) errMsg = "O modelo de IA configurado n\xE3o est\xE1 dispon\xEDvel. Tente atualizar a p\xE1gina.";
      return res.status(500).json({ error: errMsg });
    }
  });
  app2.post("/api/admin-catalog-ai", async (req, res) => {
    const { prompt, currentCatalog, file } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key n\xE3o configurada. A funcionalidade de IA requer a chave no .env." });
    }
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemPrompt = `Voc\xEA \xE9 um assistente de IA gerenciador de cat\xE1logo farmac\xEAutico e de medicamentos.
Voc\xEA vai receber:
1. O Cat\xE1logo Atual (lista de categorias e produtos)
2. O Pedido do usu\xE1rio, que pode incluir um arquivo (PDF, imagem, CSV) contendo os dados.

Seu objetivo \xE9 analisar as instru\xE7\xF5es e retornar estritamente um objeto JSON com as a\xE7\xF5es que devem ser executadas.
N\xE3o retorne Markdown ou texto explicativo, APENAS O JSON V\xC1LIDO.

O JSON deve ter esta estrutura:
{
  "message": "Uma mensagem curta de resumo para mostrar ao usu\xE1rio do que voc\xEA fez.",
  "actions": [
    {
      "type": "add",
      "categoryId": "ID_DA_CATEGORIA_PARA_ADICIONAR",
      "product": { "name": "Nome", "manufacturer": "Fabricante", "priceBRL": 150, "indications": "Ansiedade", "description": "...", "type": "\xD3leo" }
    },
    {
      "type": "update",
      "categoryId": "ID_DA_CATEGORIA_ATUAL",
      "originalName": "Nome Exato Do Produto Existente",
      "updates": { "priceBRL": 200, "indications": "Nova indica\xE7\xE3o" }
    },
    {
      "type": "delete",
      "categoryId": "ID_DA_CATEGORIA_ATUAL",
      "originalName": "Nome Exato Do Produto Existente"
    }
  ]
}

Regras:
- Use os IDs das categorias existentes, como '1' (ansiedade), '2' (dor), '3' (epilepsia), etc. Tente encaixar de forma inteligente.
- Para adicionar novos medicamentos, extraia do arquivo ou texto as informa\xE7\xF5es de nome, fabricante, tipo (\xD3leo, Goma, Flor), descri\xE7\xE3o, valor em R$ (priceBRL) e patologias (indications).
- Tente inferir a categoria (categoryId) mais apropriada com base nas indica\xE7\xF5es ou no tipo.`;
      const contents = [];
      contents.push(systemPrompt);
      contents.push(`Cat\xE1logo Atual:
${JSON.stringify(currentCatalog, null, 2)}`);
      if (prompt) {
        contents.push(`Pedido do Usu\xE1rio e Texto de Origem:
${prompt}`);
      }
      if (file) {
        contents.push({
          inlineData: {
            data: file.data.split(",")[1],
            mimeType: file.mimeType
          }
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          responseMimeType: "application/json"
        }
      });
      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Erro na API Gemini de Cat\xE1logo:", error.message);
      let errMsg = error.message || "Falha desconhecida";
      if (errMsg.includes("leaked")) errMsg = "Sua chave de API do Gemini foi revogada pelo Google (leaked). Por favor, gere uma nova chave no Google AI Studio e atualize nas configura\xE7\xF5es.";
      return res.status(500).json({ error: errMsg });
    }
  });
  app2.post("/api/analyze-clinical", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt
        });
        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (error) {
        console.warn("Aviso na chamada da API Gemini, aplicando motor cl\xEDnico local:", error?.message || error);
        return res.json({ text: null, fallback: true, error: error?.message });
      }
    }
    return res.json({ text: null, fallback: true });
  });
  app2.post("/api/send-admin-push", async (req, res) => {
    const { title, body, url } = req.body;
    try {
      const { collection: collection2, query: query2, where: where2, getDocs: getDocs2 } = await import("firebase/firestore");
      const usersRef = collection2(db, "users");
      const q = query2(usersRef, where2("role", "==", "admin"));
      let querySnapshot = await getDocs2(q);
      const promises = [];
      querySnapshot.forEach((doc3) => {
        const userData = doc3.data();
        if (userData.pushSubscription) {
          promises.push(import_web_push.default.sendNotification(userData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: "high", TTL: 86400 }).catch((e) => console.error("Admin push error", e)));
        }
      });
      if (promises.length === 0) {
        const allUsersSnapshot = await getDocs2(usersRef);
        allUsersSnapshot.forEach((doc3) => {
          const uData = doc3.data();
          if (uData.pushSubscription) {
            promises.push(import_web_push.default.sendNotification(uData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: "high", TTL: 86400 }).catch((e) => console.error("Admin push error", e)));
          }
        });
      }
      await Promise.all(promises);
      res.json({ success: true, count: promises.length });
    } catch (error) {
      console.error("Error sending admin push:", error);
      res.status(500).json({ error: "Failed" });
    }
  });
  app2.get("/api/debug-users", async (req, res) => {
    try {
      const { collection: collection2, getDocs: getDocs2 } = await import("firebase/firestore");
      const usersRef = collection2(db, "users");
      const snapshot = await getDocs2(usersRef);
      const users = [];
      snapshot.forEach((doc3) => users.push({ id: doc3.id, ...doc3.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/webhook", async (req, res) => {
    const { action, data, type } = req.body;
    console.log("Notifica\xE7\xE3o Mercado Pago recebida:", { action, type, data, query: req.query });
    try {
      const paymentId = data?.id || req.body?.id || req.query?.id || req.query?.["data.id"];
      if (paymentId) {
        console.log(`[WEBHOOK MP] Processando pagamento ID: ${paymentId}`);
        const mpInfo = await getMpClient();
        if (mpInfo) {
          const paymentSdk = new import_mercadopago.Payment(mpInfo.client);
          const payment = await paymentSdk.get({ id: String(paymentId) });
          if (payment && (payment.status === "approved" || payment.status === "completed")) {
            await processApprovedPayment(payment);
          }
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro no processamento do Webhook:", error);
      res.status(200).send("OK");
    }
  });
  const isDevTsx = process.env.NODE_ENV !== "production" && process.argv.some((arg) => arg.endsWith("server.ts"));
  if (isDevTsx) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_node_fs.default.existsSync(import_node_path.default.join(process.cwd(), "dist", "index.html")) ? import_node_path.default.join(process.cwd(), "dist") : process.cwd();
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_node_path.default.join(distPath, "index.html"));
    });
  }
  const numericPort = Number(PORT);
  if (!isNaN(numericPort) && numericPort > 0) {
    app2.listen(numericPort, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${numericPort}`);
    });
  } else {
    app2.listen(PORT, () => {
      console.log(`Server running on socket ${PORT}`);
    });
  }
}
startServer();
