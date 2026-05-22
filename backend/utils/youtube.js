const axios = require('axios');

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const fetchVideoMetadata = async (videoId) => {
  try {
    const { data } = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { timeout: 8000 }
    );
    return {
      title: data.title || 'Untitled Video',
      channelName: data.author_name || 'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '', viewCount: '', publishedAt: '',
    };
  } catch {
    return {
      title: `YouTube Video (${videoId})`,
      channelName: 'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: '', viewCount: '', publishedAt: '',
    };
  }
};

const cleanText = (text) => {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\[.*?\]/g, '').replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ').trim();
};

const parseXml = (xml) => {
  const matches = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!matches) return null;
  const text = matches.map(t => cleanText(t.replace(/<[^>]*>/g, ''))).filter(Boolean).join(' ');
  return text.length > 50 ? text : null;
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

// ── Method 1: youtube-transcript (ESM dynamic import) ────────
const tryESMLib = async (videoId) => {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const langs = [undefined, 'en', 'ta', 'hi', 'ko', 'zh-Hans', 'zh', 'ar', 'fr', 'de', 'es', 'ja', 'ru', 'pt', 'it', 'tr', 'vi', 'id', 'th', 'te', 'kn', 'ml'];
    for (const lang of langs) {
      try {
        const opts = lang ? { lang } : {};
        const items = await YoutubeTranscript.fetchTranscript(videoId, opts);
        if (items?.length > 0) {
          const text = items.map(i => cleanText(i.text)).filter(Boolean).join(' ');
          if (text.length > 50) {
            console.log(`[T] ESMLib OK lang=${lang || 'auto'} chars=${text.length}`);
            return { text, lang: lang || 'auto' };
          }
        }
      } catch {}
    }
  } catch (e) { console.log('[T] ESMLib failed:', e.message); }
  return null;
};

// ── Method 2: ytInitialPlayerResponse from page HTML ────────
const tryPlayerResponse = async (videoId) => {
  try {
    const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      timeout: 20000, headers: HEADERS,
    });
    const html = res.data;

    // Try multiple patterns for playerResponse
    let playerData = null;
    const patterns = [
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;<\/script>/,
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/,
    ];
    for (const p of patterns) {
      try {
        const m = html.match(p);
        if (m) { playerData = JSON.parse(m[1]); break; }
      } catch {}
    }

    if (!playerData) {
      // Try extracting from window.__ytInitialPlayerResponse
      const m2 = html.match(/window\["ytInitialPlayerResponse"\]\s*=\s*({.+?})\s*;/);
      if (m2) { try { playerData = JSON.parse(m2[1]); } catch {} }
    }

    if (!playerData) return null;

    const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captions?.length) { console.log('[T] PlayerResponse: no captions'); return null; }

    console.log(`[T] PlayerResponse: ${captions.length} tracks:`, captions.map(c => c.languageCode));

    // Sort: English first, then manual before auto-generated
    captions.sort((a, b) => {
      const aE = a.languageCode?.startsWith('en') ? 0 : 1;
      const bE = b.languageCode?.startsWith('en') ? 0 : 1;
      if (aE !== bE) return aE - bE;
      return (a.kind === 'asr' ? 1 : 0) - (b.kind === 'asr' ? 1 : 0);
    });

    for (const track of captions) {
      if (!track.baseUrl) continue;
      try {
        const xmlRes = await axios.get(track.baseUrl + '&fmt=srv1', { timeout: 15000, headers: HEADERS });
        const text = parseXml(xmlRes.data);
        if (text) {
          console.log(`[T] PlayerResponse OK lang=${track.languageCode} chars=${text.length}`);
          return { text, lang: track.languageCode };
        }
        // try without fmt param
        const xmlRes2 = await axios.get(track.baseUrl, { timeout: 15000, headers: HEADERS });
        const text2 = parseXml(xmlRes2.data);
        if (text2) {
          console.log(`[T] PlayerResponse OK (no fmt) lang=${track.languageCode} chars=${text2.length}`);
          return { text: text2, lang: track.languageCode };
        }
      } catch (e) { console.log(`[T] Track ${track.languageCode} err:`, e.message); }
    }
  } catch (e) { console.log('[T] PlayerResponse failed:', e.message); }
  return null;
};

// ── Method 3: Direct timedtext API loop ─────────────────────
const tryTimedTextLoop = async (videoId) => {
  const langs = ['en', 'ta', 'hi', 'ko', 'zh-Hans', 'zh-Hant', 'zh', 'ar', 'fr', 'de', 'es', 'pt', 'ru', 'ja', 'it', 'tr', 'vi', 'id', 'th', 'te', 'kn', 'ml', 'bn'];
  for (const lang of langs) {
    try {
      const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv1`;
      const res = await axios.get(url, { timeout: 8000, headers: HEADERS });
      if (typeof res.data === 'string' && res.data.includes('<text')) {
        const text = parseXml(res.data);
        if (text) {
          console.log(`[T] TimedTextLoop OK lang=${lang} chars=${text.length}`);
          return { text, lang };
        }
      }
    } catch {}
  }
  // try auto-generated English
  try {
    const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=srv1`;
    const res = await axios.get(url, { timeout: 8000, headers: HEADERS });
    if (typeof res.data === 'string' && res.data.includes('<text')) {
      const text = parseXml(res.data);
      if (text) { console.log(`[T] TimedTextLoop ASR OK chars=${text.length}`); return { text, lang: 'en-asr' }; }
    }
  } catch {}
  return null;
};

// ── Method 4: Supadata.ai free transcript API ────────────────
// Free public API that fetches YouTube transcripts, no key needed
const trySupadata = async (videoId) => {
  try {
    const res = await axios.get(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=en`,
      { timeout: 20000, headers: { 'Accept': 'application/json' } }
    );
    const content = res.data?.content;
    if (Array.isArray(content) && content.length > 0) {
      const text = content.map(c => cleanText(c.text || '')).filter(Boolean).join(' ');
      if (text.length > 50) {
        console.log(`[T] Supadata OK chars=${text.length}`);
        return { text, lang: res.data?.lang || 'en' };
      }
    }
    // Some responses return text directly
    if (typeof content === 'string' && content.length > 50) {
      console.log(`[T] Supadata (string) OK chars=${content.length}`);
      return { text: content, lang: 'en' };
    }
  } catch (e) { console.log('[T] Supadata failed:', e.message); }
  return null;
};

// ── Method 5: kome.ai / tactiq free transcript APIs ─────────
const tryKome = async (videoId) => {
  try {
    const url = `https://kome.ai/api/transcript`;
    const res = await axios.post(url,
      { video_id: videoId },
      { timeout: 20000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    const transcript = res.data?.transcript || res.data?.text || res.data?.data;
    if (typeof transcript === 'string' && transcript.length > 50) {
      console.log(`[T] Kome OK chars=${transcript.length}`);
      return { text: cleanText(transcript), lang: 'en' };
    }
  } catch (e) { console.log('[T] Kome failed:', e.message); }
  return null;
};

// ── Method 6: youtubetranscript.com scraper ──────────────────
const tryTranscriptSite = async (videoId) => {
  try {
    const res = await axios.get(
      `https://youtubetranscript.com/?server_vid2=${videoId}`,
      { timeout: 20000, headers: HEADERS }
    );
    const html = res.data;
    const matches = html.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (matches?.length > 0) {
      const text = matches.map(t => cleanText(t.replace(/<[^>]*>/g, ''))).filter(Boolean).join(' ');
      if (text.length > 50) {
        console.log(`[T] TranscriptSite OK chars=${text.length}`);
        return { text, lang: 'en' };
      }
    }
    // Try JSON endpoint
    const jsonRes = await axios.get(
      `https://youtubetranscript.com/?server_vid=${videoId}`,
      { timeout: 15000, headers: HEADERS }
    );
    const items = jsonRes.data;
    if (Array.isArray(items)) {
      const text = items.map(i => cleanText(i.text || i.t || '')).filter(Boolean).join(' ');
      if (text.length > 50) {
        console.log(`[T] TranscriptSite JSON OK chars=${text.length}`);
        return { text, lang: 'en' };
      }
    }
  } catch (e) { console.log('[T] TranscriptSite failed:', e.message); }
  return null;
};

// ── Main orchestrator ────────────────────────────────────────
const fetchTranscript = async (videoId) => {
  console.log(`\n[Transcript] ===== Starting ${videoId} =====`);

  // Run in parallel groups for speed — fastest method wins
  // Group A: Most reliable methods
  const groupA = await Promise.any([
    tryPlayerResponse(videoId),
  ]).catch(() => null);

  if (groupA) {
    return { success: true, transcript: groupA.text, wordCount: groupA.text.split(/\s+/).length, lang: groupA.lang, source: 'groupA' };
  }

  console.log('[Transcript] GroupA failed, trying GroupB...');

  // Group B: Alternative methods
  const groupB = await Promise.any([
    tryTimedTextLoop(videoId),
  ]).catch(() => null);

  if (groupB) {
    return { success: true, transcript: groupB.text, wordCount: groupB.text.split(/\s+/).length, lang: groupB.lang, source: 'groupB' };
  }

  console.log('[Transcript] GroupB failed, trying GroupC...');

  // Group C: Last resort scrapers (SEQUENTIAL FALLBACK)

  // Try Kome first
  const komeResult = await tryKome(videoId);

  if (komeResult && komeResult.text) {
    console.log(`[Transcript] SUCCESS via Kome chars=${komeResult.text.length}`);

    return {
      success: true,
      transcript: komeResult.text,
      wordCount: komeResult.text.split(/\s+/).length,
      lang: komeResult.lang,
      source: 'kome'
    };
  }

  // Try TranscriptSite only if Kome fails
  const transcriptSiteResult = await tryTranscriptSite(videoId);

  if (transcriptSiteResult && transcriptSiteResult.text) {
    console.log(`[Transcript] SUCCESS via TranscriptSite chars=${transcriptSiteResult.text.length}`);

    return {
      success: true,
      transcript: transcriptSiteResult.text,
      wordCount: transcriptSiteResult.text.split(/\s+/).length,
      lang: transcriptSiteResult.lang,
      source: 'transcriptsite'
    };
  }

  console.log(`[Transcript] ===== ALL FAILED for ${videoId} =====`);
  return {
    success: false,
    transcript: null,
    wordCount: 0,
    source: 'none',
    error: 'Could not extract transcript. This video has captions completely disabled by the uploader.',
  };
};

module.exports = { extractVideoId, fetchVideoMetadata, fetchTranscript };
