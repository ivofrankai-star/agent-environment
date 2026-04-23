# Deep Context (Level 2)

## 🏢 Business Basics
- **Name:** Personal Learning Guide / Life Hub (working title)
- **Role / Mission:** Help Ivek build automations, AI agents, be a copilot through life, explore full‑stack capabilities, and aim for geographical, financial, and time freedom via modern AI ideas.
- **Industry / Niche:** AI vibecoding, personal agent creation, multi‑agent systems capable of replacing teams.
- **Experience / Background:** Early learner, self‑taught, currently attending school; limited time for deep dives; exploring what exists, what is monetizable, and what can generate passive income.

## 🛍️ Products & Services (Exploration Phase)
| Item | Description | Price | Status |
|------|-------------|-------|--------|
| AI vibecoding experiments | Using OpenClaw / OpenCode / Antigravity to build small automations and agents | Free (self‑hosted) | Learning / prototype |
| Personal AI agent (copilot) | Agent that helps with daily tasks, weather, plans, reminders, and gives direct, non‑fluffy feedback | Free (self‑hosted) | In development |
| Multi‑agent system prototypes | Trials with Orchestrator‑Executor pattern, sub‑agent spawning, context isolation | Free (self‑hosted) | Experimental |
| Knowledge & task hub | Notion‑based task database with progress formulas, serving as a second brain | Free (personal Notion) | Active |
| Exploration logs | Daily logs in `memory/YYYY‑MM‑DD.md` and curated `MEMORY.md` | Free | Ongoing |

## 💰 Pricing Model (Future / Aspirational)
- **Tier 0 (Explorer):** Free – self‑hosted OpenClaw + basic automations (current stage).
- **Tier 1 (Builder):** Low‑cost hosted instance + basic support – ~$5‑10/mo (when ready to share or scale).
- **Tier 2 (Creator):** Advanced features (multi‑agent orchestration, ContextEngine, skills) + priority support – ~$20‑30/mo.
- **Tier 3 (Operator):** Full‑suite with dedicated GPU, custom SLAs, on‑prem options – $50+/mo.
*(These are placeholders; actual monetization will follow once a viable offering is identified.)*

## 👥 Customer / User Profile
- **Primary User:** Ivek  
  - **Background:** Early learner, self‑taught, some experience with Antigravity and OpenCode vibecoding, currently attending school.  
  - **Goals:** Achieve geographical, financial, and time freedom; tap into modern AI ideas; explore the market for passive‑income opportunities.  
  - **Frustrations / Pain Points:** School consumes time and discipline; lacks deep‑dig time; wants to improve prompting skills so agents understand intent and make fewer mistakes; desires helpful, direct feedback without fluff or “yes‑man” tendencies.  
  - **Preferred Interaction Style:** Direct, concise, honest (no fake praise), supportive but not commanding; appreciates the agent sending useful, lightweight messages (e.g., weather forecast, daily plan) without being overbearing.  
  - **What to Avoid:** Army‑sergeant relationship, over‑automation that feels invasive, generic or bland responses.

## 🎯 Target Use Cases (Exploration / Future)
- Autonomous daily briefings (weather, tasks, quick checks).  
- Personal copilot for prompting help and feedback on AI interactions.  
- Experiments with multi‑agent Orchestrator‑Executor patterns (Builder → Orchestrator → Executor).  
- Context‑aware agents that retain personal preferences and learning over time (via MEMORY.md and ContextEngine).  
- Skill‑based experiments (e.g., Notion integration, YouTube research, web search).  
- Simple automations: cron‑driven reminders, task‑board updates, memory‑backup routines.  
- Agent‑to‑agent experiments (Clawey Alley style) once a valuable service‑to‑service exchange is identified.

## 🔍 Competitive Positioning
- **Vs. vanilla chatbots:** OpenClaw + custom agents can run tools, spawn sub‑agents, access files, and persist memory—far beyond a stateless LLM.  
- **Vs. other agent frameworks:** OpenClaw offers a built‑in memory system, ContextEngine pluggable architecture, skills marketplace, and native cron + heartbeat → sub‑agent pattern that avoids timeouts.  
- **Differentiators:**  
  - Three‑role architecture (Builder/Orchestrator/Executor) lets you separate construction from permanent orchestration.  
  - Persistent memory + ContextEngine eliminate context decay across sessions.  
  - Skills ecosystem enables plug‑and‑play capabilities (e.g., Notion, YouTube‑Research, 1Password).  
  - Native secure defaults (API keys in `.env`, tool scoping, optional NemoClaw sandbox).  
  - Designed for self‑hosted, personal‑agent use—not just multi‑tenant SaaS.

## 🧩 Key Resources & Links
- **Workspace:** `~/.openclaw/workspace/`  
- **Notion Task & Knowledge Base:** (Insert your Notion URL here when ready)  
- **OpenClaw Documentation:** https://docs.openclaw.ai  
- **Skills Library:** https://playbooks.com/skills/openclaw/  
- **Example Files in Workspace:** `SOUL.md`, `IDENTITY.md`, `USER.md`, `AGENTS.md`, `TOOLS.md`, `MEMORY.md`, `memory/`, `scripts/`
- **Local Model / Token‑Optimization:** Configured via 8‑layer stack (see `openclaw.json` and masterclass prompts).

---
*This deep‑context file is intended to be pasted into `AGENTS.md` (under a “Deep Context” section) or fed into the ContextEngine `assemble` hook so both the main agent and any sub‑agents have access to this business‑specific knowledge.*