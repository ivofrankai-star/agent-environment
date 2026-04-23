# Tidy Up Plan: Remove OpenClaw Branding & Mentions from Dashboard

## Goal
Remove all references to "OpenClaw", "bbymama", and related branding from the Vercel dashboard (command-center-ai) to make it a generic AI agent command center.

## Steps

### 1. Backup
- Create a backup of the current dashboard code:
  ```bash
  cp -r /home/ivo/.openclaw/workspace/command-center-ai /home/ivo/.openclaw/workspace/command-center-ai-backup-$(date +%Y%m%d_%H%M%S)
  ```

### 2. Identify Files to Modify
Search for occurrences of:
- "OpenClaw"
- "bbymama"
- "📈" (agent emoji)
- Any hardcoded agent names or URLs

### 3. Replace in Key Files
#### a) Public Assets
- `public/favicon.ico` – replace with generic icon
- `public/logo.svg` or similar – replace with generic logo
- `index.html` – update title, meta tags

#### b) Source Code (src/)
- Replace all strings in `.tsx`, `.ts`, `.js`, `.css` files
- Update component names if they contain "ClawBuddy" or "bbymama"
- Update API calls if they reference agent-specific endpoints (though these should be generic)

#### c) Environment Variables
- Check `.env`, `.env.example`, `.env.local` for any OpenClaw-specific keys (like AGENT_COMMAND_API_URL, AGENT_COMMAND_WEBHOOK_SECRET) – these are integration points, not branding, so may keep but rename for clarity.

#### d) Documentation
- Update `README.md` to reflect generic AI command center
- Remove or update any internal docs referencing OpenClaw setup

### 4. Update Supabase Integration (if needed)
- The integration guide (INTEGRATION.md) is for internal use; if the dashboard is to be public, consider removing or generalizing it.
- However, the dashboard likely still needs to connect to the backend (Supabase) for tasks, logs, etc. Keep the API endpoints but remove any OpenClaw-specific branding from the UI.

### 5. Test Locally
- Run `bun dev` (or `npm run dev`) to ensure the dashboard works after changes.
- Verify that all functionality remains intact (task listing, moving, logging, etc.).

### 6. Deploy to Vercel
- Push changes to GitHub (if connected) or redeploy via Vercel CLI.
- Confirm the live site reflects the changes.

### 7. Clean Up Workspace
- Remove any temporary files or backups after verification.
- Update HEARTBEAT.md if needed (though it's internal).

## Notes
- Keep the integration functional: the dashboard should still communicate with the Supabase backend via the API defined in INTEGRATION.md.
- Only change user-facing strings and visuals, not the underlying API calls unless they contain branding.

## Estimated Time
- 1-2 hours depending on number of files.

## Next Steps
After tidying, we can proceed with Step 10 integrations (browser control, AgentMail, skills) on a clean slate.