# Discord Presence Integration

This document explains the Discord presence integration (Phase 5A) in the portfolio.

## Architecture

The portfolio uses the [`use-lanyard`](https://github.com/phineas/use-lanyard) package to retrieve real-time Discord presence data directly in the browser via WebSocket. This eliminates the need for server-side polling, API routes, or exposing a Discord Bot Token.

### Why Lanyard?
Lanyard acts as a public bridge for Discord's Rich Presence API. It allows us to access a user's Discord status (Online, Idle, DND, Offline), current activity (Games, Custom Statuses), and Spotify listening metadata using only their public Discord User ID (snowflake).

## Setup & Configuration

To enable Discord presence on your local or deployed instance:

1. **Join the Lanyard Discord Server:**
   Lanyard requires you to join their Discord server so their bot can monitor your presence. Join it [here](https://discord.gg/lanyard).
2. **Obtain your Discord User ID:**
   - In Discord, go to User Settings > Advanced and enable **Developer Mode**.
   - Right-click your own profile (in any server or chat) and click **Copy User ID**. This is a long string of numbers (e.g., `123456789012345678`).
3. **Configure the Portfolio:**
   - Open `src/lib/site.ts`.
   - Update the `discordId` property in the `siteConfig` object with your copied User ID:
     ```typescript
     export const siteConfig = {
       // ...
       discordId: "YOUR_USER_ID_HERE",
       // ...
     };
     ```

*Note: The Discord User ID is a public identifier and does not need to be hidden in an `.env` file.*

## Behavior

- **Presence Unavailable:** If `discordId` is empty or Lanyard is unreachable, a subtle "Presence Unavailable" state will be shown. The UI will not crash.
- **Offline:** If you are offline or invisible on Discord, the widget will gracefully show "Offline" and will not display your activity.
- **Active / Online:** Shows your avatar, a status indicator (Green/Amber/Red), and your current activities.
- **Activities & Spotify:** It prioritizes showing custom statuses or games you are playing. If you are listening to Spotify (and your Discord is connected to Spotify), the song and artist will be shown.

## Troubleshooting

- **Widget says "Connecting...":** The websocket is taking a moment to connect.
- **Widget says "Presence Unavailable":** Ensure your `discordId` is set correctly in `src/lib/site.ts`.
- **I'm playing a game but it's not showing:** Make sure Discord is detecting the game and that you have "Display current activity as a status message" enabled in Discord settings.
- **Spotify isn't showing:** Ensure your Spotify account is connected to Discord and "Display on profile" is checked in your Connections settings.
