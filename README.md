# SIA-Drop
SIA Drop - A P2P file transfer over local network. No server, no upload, no account. Open the same URL on any device on your WiFi and share files directly via WebRTC.

## Credits / Acknowledgments
This project is a heavily improved and customized version, built upon the core concept of the original [FileDrop](https://github.com/osama2kabdullah/FileDrop) by [osama2kabdullah](https://github.com/osama2kabdullah) repository. Thanks for the original implementation!

---

## ✨ What's New? (Improvements over Original)

I have rewritten and added several major features to make the file-sharing experience seamless:

* **📦 Multi-File Support & Auto-Zip:** The original version didn't support transferring multiple files at once. SiaDrop fully supports multi-file selection, and it automatically bundles multiple files into a single `.zip` file before downloading!
* **🆔 Clean User IDs:** Replaced the long, confusing default PeerJS IDs with clean, short, and recognizable formats like `SIA-XXXXX`.
* **⚡ Production Ready (Static Build):** No need to run complex `npm dev` or `npm run build` commands anymore. The repository now includes the fully compiled, direct production-ready HTML/JS/CSS code (`dist` version) for instant deployment.
* **👣 UI Enhancements:** Added a professional Footer and fixed various typo/spelling bugs present in the original UI.

---

## 🛠️ How to Run Locally

Since the project is already built into static assets, running it is incredibly simple:

1. Clone this repository:
   ```bash
   git clone https://github.com/shahriaribnealam/sia-drop.git
