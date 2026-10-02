// _worker.js
const RESEND_API_KEY = "re_9y8yV7NN_4cdW8PddY7rp3Qb8nBuQczM2";       // env var recommended
const SUPABASE_URL   = "https://girizcgcxciyayssbmgl.supabase.co";
const SUPABASE_KEY   = "sb_publishable_7V6_ob3cVDRr0uyYCdlSKA_8kNiKKCl";         // service role key
const FROM_EMAIL     = "HR <hr@bettergrowthsolutions.com>";

const sb = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // ---------- LOGIN ----------
  if (path === "/api/login" && request.method === "POST") {
    const { email, password } = await request.json();
    const r = await sb(`users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`);
    const rows = await r.json();
    if (!rows.length) return json({ error: "Invalid credentials" }, 401);
    return json({ ok: true, email });
  }

  // ---------- SEND EMAIL ----------
  if (path === "/api/send" && request.method === "POST") {
    const form = await request.formData();
    const to = form.get("to");
    const cc = form.get("cc") || "";
    const bcc = form.get("bcc") || "";
    const subject = form.get("subject");
    const body = form.get("body");
    const sentBy = form.get("sent_by") || "";
    const file = form.get("attachment");

    let attachments = [];
    let attachmentName = "";
    if (file && file.size > 0) {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      attachments.push({ filename: file.name, content: b64 });
      attachmentName = file.name;
    }

    const payload = {
      from: FROM_EMAIL,
      to: to.split(",").map(s => s.trim()).filter(Boolean),
      subject,
      html: body,
      attachments,
    };
    if (cc)  payload.cc  = cc.split(",").map(s => s.trim()).filter(Boolean);
    if (bcc) payload.bcc = bcc.split(",").map(s => s.trim()).filter(Boolean);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    // Save to Supabase
    await sb("sent_emails", {
      method: "POST",
      body: JSON.stringify({
        to_email: to,
        cc_email: cc,
        bcc_email: bcc,
        subject,
        body,
        attachment_name: attachmentName,
        resend_id: data.id || null,
        status: res.ok ? "sent" : "failed",
        sent_by: sentBy,
      }),
    });

    return json({ ok: res.ok, resend: data });
  }

  // ---------- LIST SENT ----------
  if (path === "/api/sent" && request.method === "GET") {
    const r = await sb("sent_emails?select=*&order=created_at.desc&limit=200");
    return json(await r.json());
  }

  // ---------- LAST SENT (summary) ----------
  if (path === "/api/last" && request.method === "GET") {
    const r = await sb("sent_emails?select=*&order=created_at.desc&limit=1");
    const rows = await r.json();
    return json(rows[0] || null);
  }

  // ---------- SERVE STATIC FILES ----------
  return context.env.ASSETS.fetch(request);
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
