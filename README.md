# YOUSM - Expo Go Mobile App

This is an Expo Go mobile application project.

## Getting Started

### Prerequisites

- Node.js installed on your computer
- Expo Go app installed on your mobile device (available on [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) and [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Running the App

1. Start the development server:

   ```bash
   npm start
   ```

2. Once the server starts, you'll see a QR code in the terminal

3. Open the Expo Go app on your mobile device and:
   - **iOS**: Open the Camera app and scan the QR code
   - **Android**: Open the Expo Go app and tap "Scan QR code"

4. Your app will load on your device!

### Additional Commands

- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator (macOS only)
- `npm run web` - Open in web browser

## Project Structure

- `App.js` - Main application component
- `app.json` - Expo configuration file
- `assets/` - Images, fonts, and other static files
- `server/` - Express + SQLite backend for direct messaging
- `package.json` - Project dependencies and scripts

## Development

Start editing `App.js` to build your app. The app will automatically reload when you save changes.

### Messaging Backend

Run the backend separately from Expo:

```bash
npm run server
```

By default the server listens on `0.0.0.0:3001`, which allows a phone on the same Wi-Fi network to reach it using your computer's LAN IP address.

Available endpoints:

- `GET /health`
- `POST /threads/direct`
- `POST /threads/:threadId/messages`
- `GET /threads/:threadId/messages?after=...`

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Go Documentation](https://docs.expo.dev/get-started/expo-go/)
