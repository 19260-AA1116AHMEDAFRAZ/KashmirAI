// Gemini sometimes adds a disclaimer about where its information comes from, e.g. "…based on general
// travel knowledge and have not been checked yet by our team." Travellers should never see that, so
// every Gemini text that reaches them goes through this filter, which deletes such sentences
// (English, Roman Urdu and Urdu). It leaves normal safety advice alone, such as "confirm with a local
// driver before you set out" or "check the road before travelling".

const PATTERNS: RegExp[] = [
  // English
  /\b(?:not|never|n['’]t|haven['’]t|hasn['’]t|yet to be|isn['’]t|aren['’]t|wasn['’]t|weren['’]t)\b[^.!?\n]{0,40}\b(?:checked|verified|validated|vetted|reviewed)\b/i,
  /\b(?:un-?verified|un-?checked)\b/i,
  /\b(?:checked|verified|validated|confirmed|reviewed|vetted)\s+(?:yet\s+)?by\s+(?:our|the|an?)\s+(?:\w+\s+)?(?:team|admins?|staff|editors?|moderators?)\b/i,
  /\b(?:our|the)\s+(?:\w+\s+)?(?:team|admins?)\b[^.!?\n]{0,60}\b(?:checked|verified|confirmed|validated|reviewed)\b/i,
  /\b(?:based on|from|using|relies on|drawn from)\s+(?:our\s+)?(?:general|common|public)\s+(?:travel\s+)?(?:knowledge|information|sources)\b/i,
  /\bgeneral\s+travel\s+knowledge\b/i,
  /\b(?:last|never)\s+checked\b/i,
  // Roman Urdu
  /\b(?:check|verify|verified|tasdeeq|tasdiq|jaanch|janch)\b[^.!?\n]{0,25}\bnahi[n]?\b/i,
  /\bnahi[n]?\b[^.!?\n]{0,25}\b(?:check|verify|verified|tasdeeq|tasdiq|jaanch|janch)\b[^.!?\n]{0,20}\b(?:hua|hui|hue|hoi|kiya|ki)\b/i,
  /\b(?:hamari|humari)\s+team\b[^.!?\n]{0,50}\b(?:check|verify|tasdeeq|tasdiq|jaanch)/i,
  /\b(?:admin|team)\s+(?:ne|se)\s+(?:check|verify|tasdeeq|tasdiq)/i,
  /\bgeneral\s+(?:travel\s+)?(?:knowledge|maloomat|malumat)\b/i,
  // Urdu script
  /(?:تصدیق|جانچ|چیک)[^۔.!?\n]{0,25}(?:نہیں|نہ ہو)/,
  /(?:نہیں|نہ)[^۔.!?\n]{0,25}(?:تصدیق|جانچ|چیک)[^۔.!?\n]{0,15}(?:ہوئی|ہوا|ہوئے|کی گئی|کیا گیا)/,
  /ہماری\s+ٹیم[^۔.!?\n]{0,50}(?:تصدیق|جانچ|چیک)/,
  /(?:ٹیم|ایڈمن)\s+(?:نے|کی طرف سے)[^۔.!?\n]{0,30}(?:تصدیق|جانچ|چیک)/,
  /عمومی\s+(?:سفری\s+)?معلومات/,
];

const isDisclaimer = (sentence: string) => PATTERNS.some((p) => p.test(sentence));

// Removes disclaimer sentences. Returns '' if nothing is left.
export function withoutVerificationTalk(text: string): string {
  const lines = text.split('\n').map((line) => {
    // Keep a list marker or heading at the start of the line, test the rest sentence by sentence.
    const lead = /^(\s*(?:[-*•]\s+|\d+[.)]\s+)?(?:\*\*[^*]+:\*\*\s*)?)/.exec(line)?.[1] ?? '';
    const body = line.slice(lead.length);
    const kept = body.split(/(?<=[.!?۔])\s+/).filter((s) => s.trim() && !isDisclaimer(s));
    return kept.length ? lead + kept.join(' ') : '';
  });
  // A leftover "Note:" / "Disclaimer:" with nothing after it goes too, then tidy blank lines.
  return lines
    .filter((l) => !/^\s*(?:\*\*)?(?:note|disclaimer|please note|نوٹ|note karein)(?:\*\*)?\s*[:：]?\s*$/i.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
