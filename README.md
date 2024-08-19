# Audio Recorder App

## Project Description

Audio Recorder App is a React Native application built using Expo. This app allows users to record audio, pause the recording, and play back the recorded audio. The app utilizes Expo’s audio recording capabilities and provides a simple and intuitive interface for managing audio recordings.

<div align=center>
    <img src="https://github.com/leeyyl/AudioRecorder/blob/main/demo.gif" />
</div>


## Features

• Record audio with a start/pause/resume functionality
• Playback recorded audio
• Intuitive user interface

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

• Node.js
• npm or yarn

### Installation

1. Clone the repository:
git clone https://github.com/leeyyl/AudioRecorder.git
cd AudioRecorder

2. Install dependencies:
npm install
or
yarn install


How to Run the App

1. Start the Expo development server:
    npm start
    or
    yarn start
2. Install the Expo Go app on your iOS or Android device, if you haven’t already, from the App Store (iOS) or Google Play Store (Android).
3. Scan the QR code displayed in your terminal or browser using the Expo Go app to open the app on your device.

## Additional Notes

### Permissions

The app requires permissions to access the device’s microphone. When you run the app, it will prompt you to grant the necessary permissions.

In development, this is handled automatically by Expo. However, for production, make sure you configure app permissions in app.json:

```{
  "expo": {
    "name": "Audio Recorder App",
    "slug": "audio-recorder-app",
    "version": "1.0.0",
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app needs access to the microphone to record audio."
      }
    },
    "android": {
      "permissions": ["RECORD_AUDIO"]
    }
  }
}
```

### Main Components

Here’s a brief overview of the main components used in the app:

* Record Component - ***Memo.tsx***
* Playback Component - ***MemoItem.tsx***

## Note

* The app was developed and tested using the Expo SDK. If you plan to eject from Expo, additional configuration may be required.
* Ensure your device has sufficient storage and proper microphone functioning capability to avoid any interruptions.

## Contribution

Feel free to fork this repository and submit pull requests. Any improvements, bug fixes, or suggestions are more than welcome!

## License

This project is licensed under the MIT License.

Please see LICENSE file in project.
