import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to keep the app resilient if key is not configured
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Interactive semantic fallback data generator in Turkish
function generateFallbackSurvey(prompt: string) {
  const cleanPrompt = prompt.toLowerCase();
  
  if (cleanPrompt.includes("kahve") || cleanPrompt.includes("yemek") || cleanPrompt.includes("gıda") || cleanPrompt.includes("atıştırmalık") || cleanPrompt.includes("içecek") || cleanPrompt.includes("restoran") || cleanPrompt.includes("kafe")) {
    return {
      title: "Yeni Nesil Gurme ve Kahve Deneyimi Araştırması",
      category: "gida",
      rewardCash: 18.50,
      rewardXp: 50,
      questions: [
        {
          text: "Haftalık dışarıda yemek yeme veya kahve içme sıklığınız nedir?",
          options: ["Neredeyse her gün", "Haftada 2-3 kez", "Haftada 1 kez", "Nadir veya hiç"]
        },
        {
          text: "Bir restoran veya kafeyi tercih ederken sizin için en önemli kriter hangisidir?",
          options: ["Menü lezzeti ve kalitesi", "Mekan atmosferi ve tasarımı", "Fiyat / performans oranı", "Hızlı servis ve hijyen"]
        },
        {
          text: "Mobil yemek siparişi uygulamalarında en çok hangi mutfağı sipariş edersiniz?",
          options: ["Türk Mutfağı / Ev Yemekleri", "Burger / Fast Food", "Pizzalar / İtalyan", "Uzak Doğu veya Dünya Mutfağı"]
        }
      ]
    };
  }

  if (cleanPrompt.includes("teknoloji") || cleanPrompt.includes("yazılım") || cleanPrompt.includes("yapay") || cleanPrompt.includes("ai") || cleanPrompt.includes("telefon") || cleanPrompt.includes("bilgisayar") || cleanPrompt.includes("uygulama") || cleanPrompt.includes("oyun")) {
    return {
      title: "Yapay Zeka ve Günlük Teknoloji Kullanımı Araştırması",
      category: "teknoloji",
      rewardCash: 25.00,
      rewardXp: 65,
      questions: [
        {
          text: "Yapay zeka araçlarını (ChatGPT, Gemini vb.) iş veya eğitim hayatınızda ne sıklıkla kullanıyorsunuz?",
          options: ["Her gün aktif olarak", "Haftada birkaç kez", "Sadece merak ettiğimde", "Hiç kullanmadım"]
        },
        {
          text: "Yeni bir akıllı telefon alırken hangi özelliğe en yüksek önceliği verirsiniz?",
          options: ["Kamera ve video çözünürlüğü", "Pil ömrü ve şarj hızı", "İşlemci gücü ve akıcılık", "Marka prestiji ve tasarım"]
        },
        {
          text: "Günde ortalama ne kadar süreyi mobil oyunlarda geçiriyorsunuz?",
          options: ["1 saatten fazla", "30 dakika - 1 saat arası", "15 - 30 dakika arası", "Hiç oynamıyorum"]
        }
      ]
    };
  }

  if (cleanPrompt.includes("moda") || cleanPrompt.includes("giyim") || cleanPrompt.includes("stil") || cleanPrompt.includes("alışveriş") || cleanPrompt.includes("elbise") || cleanPrompt.includes("ayakkabı") || cleanPrompt.includes("aksesuar")) {
    return {
      title: "Sürdürülebilir Moda ve Alışveriş Tercihleri",
      category: "moda",
      rewardCash: 22.00,
      rewardXp: 55,
      questions: [
        {
          text: "Kıyafet alışverişlerinizi ağırlıklı olarak nereden yapıyorsunuz?",
          options: ["Büyük AVM mağazalarından", "Online alışveriş sitelerinden", "Butik ve yerel dükkanlardan", "İkinci el platformlarından"]
        },
        {
          text: "Bir giyim ürünü satın alırken çevre dostu/sürdürülebilir kumaş olması kararınızı etkiler mi?",
          options: ["Evet, benim için çok önemlidir", "Fiyatı uygunsa dikkat ederim", "Seçimimde pek etkili olmaz", "Daha önce hiç dikkat etmedim"]
        },
        {
          text: "Yıllık ortalama ayakkabı alma sıklığınız nedir?",
          options: ["Yılda 5 çiftten fazla", "Yılda 3-4 çift", "Yılda 1-2 çift", "Sadece eskidikçe alırım"]
        }
      ]
    };
  }

  if (cleanPrompt.includes("finans") || cleanPrompt.includes("para") || cleanPrompt.includes("yatırım") || cleanPrompt.includes("kripto") || cleanPrompt.includes("borsa") || cleanPrompt.includes("banka") || cleanPrompt.includes("birikim") || cleanPrompt.includes("kart")) {
    return {
      title: "Bireysel Finans ve Yeni Nesil Ödeme Tercihleri",
      category: "finans",
      rewardCash: 30.00,
      rewardXp: 75,
      questions: [
        {
          text: "Günlük ödemelerinizde en çok hangi ödeme yöntemini tercih ediyorsunuz?",
          options: ["Kredi Kartı / Temassız", "Banka Kartı", "Nakit Para", "Mobil Ödeme (QR / NFC)"]
        },
        {
          text: "Mobil bankacılık dışındaki fintech (Papara, Tosla vb.) uygulamalarını kullanıyor musunuz?",
          options: ["Evet, günlük olarak", "Evet, sadece kampanya dönemlerinde", "Sadece nadiren transfer için", "Hayır, hiç kullanmıyorum"]
        },
        {
          text: "Enflasyondan korunmak için ilk tercih ettiğiniz birikim aracı hangisidir?",
          options: ["Altın ve Kıymetli Madenler", "Yabancı Döviz", "Borsa / Yatırım Fonları", "Gayrimenkul / Vadeli Mevduat"]
        }
      ]
    };
  }

  if (cleanPrompt.includes("spor") || cleanPrompt.includes("futbol") || cleanPrompt.includes("egzersiz") || cleanPrompt.includes("sağlık") || cleanPrompt.includes("koşu") || cleanPrompt.includes("fitness")) {
    return {
      title: "Aktif Yaşam ve Spor Alışkanlıkları Araştırması",
      category: "spor",
      rewardCash: 20.00,
      rewardXp: 50,
      questions: [
        {
          text: "Haftada ortalama kaç gün düzenli fiziksel egzersiz yapıyorsunuz?",
          options: ["4 gün ve üzeri", "2-3 gün", "Haftada 1 gün", "Düzensiz veya hiç yapmıyorum"]
        },
        {
          text: "Egzersiz yaparken sizi en çok ne motive eder?",
          options: ["Fiziksel görünüm ve kilo kontrolü", "Zihinsel rahatlama ve stres yönetimi", "Sağlık ve zindelik arayışı", "Sosyal çevre / Arkadaşlar"]
        },
        {
          text: "Giyilebilir sağlık teknolojilerini (akıllı saat, bileklik vb.) kullanıyor musunuz?",
          options: ["Evet, adımlarım ve nabzımı her gün izlerim", "Evet ama sadece saat olarak kullanıyorum", "Hayır ama satın almayı planlıyorum", "Hayır, ihtiyaç duymuyorum"]
        }
      ]
    };
  }

  // General Fallback
  return {
    title: `Tüketici Eğilimleri ve Alışkanlıkları (${prompt.length > 25 ? prompt.substring(0, 22) + '...' : prompt})`,
    category: "genel",
    rewardCash: 16.00,
    rewardXp: 40,
    questions: [
      {
        text: "Yeni bir markayı veya ürünü ilk kez denerken en çok hangisinden etkilenirsiniz?",
        options: ["Sosyal medyadaki kullanıcı yorumları", "Arkadaş veya aile önerisi", "Televizyon / internet reklamları", "Mağazadaki anlık indirimler"]
      },
      {
        text: "Günlük ortalama sosyal medya (Instagram, TikTok, YouTube vb.) kullanım süreniz nedir?",
        options: ["4 saatten fazla", "2-4 saat arası", "1-2 saat arası", "1 saatten az"]
      },
      {
        text: "Boş zamanlarınızı değerlendirirken en çok keyif aldığınız aktivite hangisidir?",
        options: ["Dizi / film izlemek", "Kitap okumak / Araştırmak", "Dışarıda arkadaşlarla buluşmak", "Evde dinlenmek / Hobiler"]
      }
    ]
  };
}

// API endpoint for AI Survey Generation
app.post("/api/generate-survey", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Geçerli bir anket konusu girmelisiniz." });
  }

  const ai = getAiClient();
  if (!ai) {
    // If Gemini key is missing or not configured, return the high-quality semantic fallback
    console.log("Gemini API anahtarı yapılandırılmamış, akıllı şablon oluşturucu kullanılıyor.");
    const fallback = generateFallbackSurvey(prompt);
    return res.json(fallback);
  }

  try {
    const systemPrompt = `You are an expert market research survey designer.
Generate an engaging micro-survey based on the brand's objective: "${prompt}".
The survey MUST have exactly 3 questions. Each question MUST have exactly 4 choices.
You must return your output strictly in the following JSON format:
{
  "title": "A highly catchy, professional, and short Turkish title representing the research",
  "category": "One of: 'teknoloji' | 'moda' | 'gida' | 'finans' | 'spor' | 'genel'",
  "rewardCash": a number between 15.00 and 45.00, representing the TL reward for completing,
  "rewardXp": a number between 40 and 100, representing the XP reward,
  "questions": [
    {
      "text": "The question in clear, premium Turkish",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "text": "Second question in clear, premium Turkish",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "text": "Third question in clear, premium Turkish",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}
Make sure all text, titles, questions and options are in natural, perfect Turkish.
Return ONLY raw JSON, with no markdown code blocks or backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    const responseText = response.text || "";
    // Clean potential markdown blocks
    const cleanJson = responseText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsedSurvey = JSON.parse(cleanJson);
    return res.json(parsedSurvey);
  } catch (error: any) {
    console.error("Gemini Survey Generation Error:", error);
    // In case of any API error or parsing issue, gracefully return the fallback survey
    const fallback = generateFallbackSurvey(prompt);
    return res.json(fallback);
  }
});

// Setup Vite development server or production build static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PAG Server running on port ${PORT}`);
  });
}

startServer();
