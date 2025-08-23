import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Network,
  Lock,
  Bug,
  BookOpen,
  FileCode2,
  ExternalLink,
  ChevronRight,
  ClipboardCopy,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Tailwind is available by default in canvas. No import required.
// All content is self-contained and interactive in a single file.

const SECTIONS = [
  { key: "intro", title: "Introduction", icon: <BookOpen className="h-5 w-5" /> },
  { key: "scenarios", title: "Real-World Scenarios", icon: <AlertTriangle className="h-5 w-5" /> },
  { key: "how", title: "How It Happens", icon: <Bug className="h-5 w-5" /> },
  { key: "impact", title: "Impact", icon: <Network className="h-5 w-5" /> },
  { key: "prevent", title: "How to Prevent", icon: <Lock className="h-5 w-5" /> },
];

const IMPACT_DATA = [
  { name: "Internal Access", score: 92 },
  { name: "Data Exfiltration", score: 88 },
  { name: "Cred Theft", score: 90 },
  { name: "RCE / Pivot", score: 85 },
  { name: "Reputation", score: 80 },
];

const payloadSnippets: Record<string, string> = {
  localhost: `GET /fetch?url=http://localhost/admin HTTP/1.1\nHost: victim.example` ,
  aws: `GET /fetch?url=http://169.254.169.254/latest/meta-data/ HTTP/1.1\nHost: victim.example` ,
  file: `GET /fetch?url=file:///etc/passwd HTTP/1.1\nHost: victim.example` ,
  dict: `GET /fetch?url=dict://127.0.0.1:11211/stat HTTP/1.1\nHost: victim.example` ,
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-medium text-black/80 dark:text-white/80 mr-2 mb-2">
      {children}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="rounded-2xl border border-white/20 bg-white/80 dark:bg-white/5 backdrop-blur p-6 shadow-sm hover:shadow-md hover:shadow-black/5 dark:hover:shadow-white/5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </motion.div>
  );
}

function TopicTabs({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  return (
    <div className="w-full flex justify-center gap-4 overflow-x-auto">
      {SECTIONS.map((s) => (
        <button
          key={s.key}
          onClick={() => setActive(s.key)}
          className={`group inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all ${
            active === s.key
              ? "border-indigo-500 bg-indigo-500 text-white shadow"
              : "border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
          aria-pressed={active === s.key}
        >
          {s.icon}
          {s.title}
        </button>
      ))}
    </div>
  );
}

function CopyArea({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="text-xs md:text-sm overflow-x-auto rounded-xl bg-zinc-950 text-zinc-100 p-4 border border-white/10">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-xs"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ExamplePlayground() {
  const [target, setTarget] = useState("localhost");
  const [scheme, setScheme] = useState("http");
  const [host, setHost] = useState("localhost");
  const [path, setPath] = useState("/admin");
  const url = useMemo(() => `${scheme}://${host}${path}`, [scheme, host, path]);

  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-white/80">Quick targets</label>
            <select
              value={target}
              onChange={(e) => {
                const v = e.target.value;
                setTarget(v);
                if (v === "localhost") {
                  setScheme("http");
                  setHost("localhost");
                  setPath("/admin");
                } else if (v === "aws") {
                  setScheme("http");
                  setHost("169.254.169.254");
                  setPath("/latest/meta-data/");
                } else if (v === "file") {
                  setScheme("file");
                  setHost("");
                  setPath("/etc/passwd");
                } else if (v === "dict") {
                  setScheme("dict");
                  setHost("127.0.0.1:11211");
                  setPath("/stat");
                }
              }}
              className="w-full rounded-xl border border-white/20 bg-zinc-900/100 dark:bg-white/5 px-3 py-2"
            >
              <option value="localhost">Loopback admin (localhost)</option>
              <option value="aws">AWS metadata (169.254.169.254)</option>
              <option value="file">Local file (file:///)</option>
              <option value="dict">Memcached (dict://)</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/80">Scheme</label>
            <input
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-zinc-900/100 dark:bg-white/5 px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs uppercase tracking-wide text-white/80">Host</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-zinc-900/100 dark:bg-white/5 px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs uppercase tracking-wide text-white/80">Path</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-zinc-900/100 dark:bg-white/5 px-3 py-2"
            />
          </div>
        </div>
        <div className="rounded-2xl bg-indigo-500/10 p-4 text-sm">
          <div className="font-mono break-all">Request → /fetch?url={url}</div>
          <div className="mt-2 text-xs text-black/70 dark:text-white/70">
            This simulates an app that fetches a user-provided URL without validation — a classic SSRF anti-pattern.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaw((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 shadow hover:brightness-105"
          >
            <FileCode2 className="h-4 w-4" /> {showRaw ? "Hide" : "Show"} raw HTTP example
          </button>
        </div>
        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <CopyArea code={payloadSnippets[target] || payloadSnippets.localhost} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/20 p-4">
          <h4 className="font-semibold mb-2">What could happen?</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-indigo-500"/>Bypass perimeter controls by making the server call <span className="font-mono">{url}</span>.</li>
            <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-indigo-500"/>Reach internal-only services (admin panels, databases, metadata endpoints).</li>
            <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-indigo-500"/>Leak secrets or credentials; potentially pivot to RCE.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/20 p-4">
          <h4 className="font-semibold mb-2">Defense-in-Depth Cheatsheet</h4>
          <div className="flex flex-wrap">
            <Badge>Allowlist hosts/ports/schemes</Badge>
            <Badge>Block private IP ranges</Badge>
            <Badge>Disable redirects</Badge>
            <Badge>Disable non-HTTP schemes</Badge>
            <Badge>IMDSv2 (AWS)</Badge>
            <Badge>Network segmentation</Badge>
            <Badge>Auth for internal services</Badge>
            <Badge>Never return raw responses</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={IMPACT_DATA}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#55555c"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(SECTIONS[0].key);

  useEffect(() => {
	  document.documentElement.classList.add("dark");
	}, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-slate-800 dark:text-zinc-100">
      {/* NAV */}
      <div className="sticky top-0 z-50 backdrop-blur bg-zinc-900/100 border-b border-white/20">
        <div className="w-full px-6 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 grid place-items-center rounded-xl bg-indigo-600 text-white shadow">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold leading-tight">SSRF Security Guide</div>
              <div className="text-xs opacity-70">Server-Side Request Forgery</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TopicTabs active={active} setActive={setActive} />
          </div>
        </div>
      </div>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="w-full px-6 lg:px-12 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold tracking-tight"
              >
                Understand & Prevent <span className="text-indigo-600">SSRF</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mt-4 text-base md:text-lg text-black/70 dark:text-white/70"
              >
                A fully interactive, beginner-friendly yet technical primer on Server-Side Request Forgery: real incidents, how it works, its impact, and layered defenses.
              </motion.p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge>Beginner-friendly</Badge>
                <Badge>Real-world breaches</Badge>
                <Badge>Cloud-aware</Badge>
                <Badge>Defense-in-depth</Badge>
              </div>
              <div className="mt-6">
				  <button
					onClick={() => {
					  const content = document.getElementById("content");
					  if (content) content.scrollIntoView({ behavior: "smooth" });
					}}
					className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 shadow-md text-white font-bold text-center transition hover:bg-indigo-700 hover:shadow-lg"
				  >
					Explore the guide
					<ChevronRight className="h-5 w-5" />
				  </button>
				</div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl border border-white/20 bg-white/70 dark:bg-white/5 p-6 shadow-xl">
                <div className="text-sm text-white/80 mb-2">Quick Demo</div>
                <div className="font-mono text-xs md:text-sm bg-zinc-950 text-zinc-100 rounded-2xl p-4">
                  $ curl "https://victim.app/fetch?url=http://localhost/admin"<br/>
                  # server fetches internal admin page ➜ SSRF
                </div>
                <div className="mt-4 text-xs text-white/80">
                  The server, not the user, makes the outbound request. If unchecked, it can reach internal-only systems.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main id="content" className="w-full px-6 lg:px-12 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Introduction */}
            {active === "intro" && (
              <SectionCard title="Introduction" icon={<BookOpen className="h-5 w-5" />}>
                <p>
                  <strong>Server-Side Request Forgery (SSRF)</strong> occurs when an application fetches a URL or resource based on user input without robust validation. Attackers coerce the server to send crafted requests to
                  <em> unexpected destinations</em> — including internal networks, cloud metadata services, or the local machine — bypassing perimeter defenses.
                </p>
                <ul>
                  <li>Modern apps often fetch avatars, webhooks, or API callbacks ➜ rising exposure.</li>
                  <li>SSRF is protocol-agnostic: beyond HTTP, it can leverage <code>file://</code>, <code>dict://</code>, and others.</li>
                </ul>
                <div className="mt-4">
                  <ExamplePlayground />
                </div>
              </SectionCard>
            )}

            {/* Scenarios */}
            {active === "scenarios" && (
              <SectionCard title="Real-World Scenarios" icon={<AlertTriangle className="h-5 w-5" />}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/20 p-4">
                    <div className="text-sm font-semibold">Capital One (2019)</div>
                    <p className="text-sm mt-1">
                      SSRF to AWS EC2 metadata ➜ temporary credentials ➜ S3 data exfiltration (≈106M customers).
                    </p>
                    <a href="https://insidersecurity.co/capitalone-data-breach-how-ssrf-vulnerability-exposed-100-million-customer-records/" target="_blank" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 text-sm mt-2">
                      Learn more <ExternalLink className="h-3 w-3"/>
                    </a>
                  </div>
                  <div className="rounded-2xl border border-white/20 p-4">
                    <div className="text-sm font-semibold">Microsoft Exchange (2021)</div>
                    <p className="text-sm mt-1">
                      CVE-2021-26855 (SSRF) used to authenticate as Exchange server ➜ chained to file write & RCE, web shells at scale.
                    </p>
                    <a href="https://safe.security/resources/blog/microsoft-exchange-ssrf/" target="_blank" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 text-sm mt-2">
                      Read techniques <ExternalLink className="h-3 w-3"/>
                    </a>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* How */}
            {active === "how" && (
              <SectionCard title="How It Happens" icon={<Bug className="h-5 w-5" />}>
                <p>
                  SSRF arises when user-controlled input is used to build an outbound request. Without strict controls, the server becomes an unwilling proxy.
                </p>
                <ul>
                  <li><strong>Parameter abuse</strong>: <code>?url=http://localhost/admin</code></li>
                  <li><strong>Cloud metadata</strong>: <code>http://169.254.169.254/latest/meta-data/</code></li>
                  <li><strong>Alternate schemes</strong>: <code>file://</code>, <code>dict://</code>, <code>gopher://</code></li>
                  <li><strong>Redirect/encoding tricks</strong> to bypass naive filters</li>
                </ul>
                <div className="mt-4">
                  <CopyArea
                    code={`// ❌ Vulnerable (no validation)\nif (isset($_GET['url'])) {\n  $image = fopen($_GET['url'], 'rb');\n  fpassthru($image);\n}`} />
                </div>
              </SectionCard>
            )}

            {/* Impact */}
            {active === "impact" && (
              <SectionCard title="Impact" icon={<Network className="h-5 w-5" />}>
                <p>
                  Consequences range from internal data exposure to full system compromise. Many large-scale breaches started with SSRF as the initial foothold.
                </p>
                <div className="mt-4">
                  <ImpactChart />
                </div>
                <ul className="mt-4">
                  <li>Reach internal-only services and admin panels.</li>
                  <li>Exfiltrate secrets and credentials (e.g., cloud IAM tokens).</li>
                  <li>Escalate to remote code execution and lateral movement.</li>
                </ul>
              </SectionCard>
            )}

            {/* Prevent */}
            {active === "prevent" && (
              <SectionCard title="How to Prevent" icon={<Lock className="h-5 w-5" />}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Application Layer</h4>
                    <ul className="space-y-2">
                      <li>Strict <strong>allowlists</strong> for hosts, ports, and schemes.</li>
                      <li>Reject private IP ranges; validate DNS/IP consistently.</li>
                      <li>Disable <strong>redirects</strong> and non-HTTP schemes.</li>
                      <li>Never return raw upstream responses to clients.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Network & Cloud</h4>
                    <ul className="space-y-2">
                      <li><strong>Deny-by-default</strong> egress; segment networks.</li>
                      <li>Enforce auth on internal services (Redis, ES, etc.).</li>
                      <li>Use <strong>AWS IMDSv2</strong>; minimize IAM permissions.</li>
                      <li>Log and monitor outbound calls for anomalies.</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/20 p-4 mt-4">
                  <div className="text-sm font-semibold mb-1">Safe Fetch Pattern (concept)</div>
                  <pre className="text-xs md:text-sm overflow-x-auto rounded-xl bg-zinc-950 text-zinc-100 p-4 border border-white/10"><code>{`// Pseudocode: allowlist & scheme checks\nconst allowedHosts = [\n  'cdn.example.com',\n  'api.example.com'\n];\nfunction safeFetch(inputUrl) {\n  const u = new URL(inputUrl);\n  if (!['https:', 'http:'].includes(u.protocol)) throw new Error('Scheme not allowed');\n  if (!allowedHosts.includes(u.hostname)) throw new Error('Host not allowed');\n  if (['127.0.0.1','localhost'].includes(u.hostname)) throw new Error('Loopback blocked');\n  // Optional: resolve DNS → verify against private ranges\n  return fetch(u.toString(), { redirect: 'error' });\n}`}</code></pre>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-white/20 bg-white/80 dark:bg-white/5 backdrop-blur p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-indigo-600" />
                <div className="font-semibold">Quick Nav</div>
              </div>
              <div className="flex flex-col gap-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={`text-left rounded-xl px-3 py-2 transition ${
                      active === s.key
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">{s.icon}<span className="font-medium">{s.title}</span></div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 p-5"
            >
              <div className="font-semibold mb-1">Resources</div>
              <ul className="text-sm space-y-1">
                <li>
                  <a className="inline-flex items-center gap-1 hover:underline" href="https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_(SSRF)/" target="_blank" rel="noreferrer">
                    OWASP A10:2021 SSRF <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a className="inline-flex items-center gap-1 hover:underline" href="https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" target="_blank" rel="noreferrer">
                    OWASP SSRF Prevention Cheat Sheet <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a className="inline-flex items-center gap-1 hover:underline" href="https://portswigger.net/web-security/ssrf" target="_blank" rel="noreferrer">
                    PortSwigger: SSRF Guide <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/20 p-5"
            >
              <div className="font-semibold mb-2">At a Glance</div>
              <ul className="text-sm space-y-2">
                <li>✅ Beginner-friendly explanations</li>
                <li>✅ Live payload builder</li>
                <li>✅ Impact visualization</li>
                <li>✅ Copyable code snippets</li>
                <li>✅ Dark/Light theme</li>
              </ul>
            </motion.div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
            {/* FOOTER */}
      <footer className="w-full border-t border-white/20 py-10">
        <div className="w-full px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4 text-sm text-white/80">
          
          {/* Left side - Created By */}
          <div className="flex items-center gap-2">
            <span>Created By:</span>
            <a
              href="https://www.linkedin.com/in/praveen-fernando-6023a5283 " 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline"
            >
              Praveen Fernando
            </a>
            <span>&amp;</span>
            <a
              href="https://www.linkedin.com/in/minoli-perera-14769527a" 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline"
            >
              Minoli Perera
            </a>
          </div>

          {/* Center - Copyright */}
          <div className="text-center">
            © {new Date().getFullYear()} SSRF Security Guide
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-3">
            <a className="hover:underline" href="#content">Back to top</a>
            <span>•</span>
            <a className="hover:underline" href="https://owasp.org/" target="_blank" rel="noreferrer">OWASP</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
