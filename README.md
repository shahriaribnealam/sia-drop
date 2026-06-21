# SIA-Drop
SIA Drop - A P2P file transfer over local network. No server, no upload, no account. Open the same URL on any device on your WiFi and share files directly via WebRTC.

## 📖 How to Use SIA Drop (Step-by-Step Guide)

SIA Drop works directly browser-to-browser (P2P). No accounts, no logins, and no file size limits! To share files between two devices (e.g., Phone to Laptop or PC to PC), follow these simple steps:

### 1️⃣ Open SIA Drop on Both Devices
* On **Device A** (Sender), open the live link: [https://siadrop.pages.dev](https://siadrop.pages.dev)
* On **Device B** (Receiver), open the same link: [https://siadrop.pages.dev](https://siadrop.pages.dev)

### 2️⃣ Connect the Devices
* Look at the unique short ID (e.g., `SIA-XXXXX`) displayed on **Device B** (Receiver).
* On **Device A** (Sender), type or paste Device B's ID into the input field and click **Connect** (or click on their node icon if they appear on your screen).
* Once connected, the status will change to **"Connected"**.

### 3️⃣ Select and Send Files
* On **Device A**, click the **Upload file(s)** or **Send File** button.
* Select one or multiple files/folders that you want to transfer.
* Click **Send**.

### 4️⃣ Accept and Download (Auto-Zip)
* **Device B** will instantly receive a pop-up prompt asking to accept the incoming transfer.
* Click **Accept**.
* If multiple files were sent, SiaDrop will automatically bundle them into a single, clean `.zip` file and save it directly to your device!

---

## ✨ What's New? (Improvements over Original)

I have rewritten and added several major features to make the file-sharing experience seamless:

* **📦 Multi-File Support & Auto-Zip:** The original version didn't support transferring multiple files at once. SiaDrop fully supports multi-file selection, and it automatically bundles multiple files into a single `.zip` file before downloading!
* **🆔 Clean User IDs:** Replaced the long, confusing default PeerJS IDs with clean, short, and recognizable formats like `SIA-XXXXX`.
* **⚡ Production Ready (Static Build):** No need to run complex `npm dev` or `npm run build` commands anymore. The repository now includes the fully compiled, direct production-ready HTML/JS/CSS code (`dist` version) for instant deployment.
* **👣 UI Enhancements:** Added a professional Footer and fixed various typo/spelling bugs present in the original UI.

---

## Credits / Acknowledgments
This project is a heavily improved and customized version, built upon the core concept of the original [FileDrop](https://github.com/osama2kabdullah/FileDrop) by [osama2kabdullah](https://github.com/osama2kabdullah) repository. Thanks for the original implementation!

> 📢 **Note:** This is a brand new & improved customized version built by **[Shahriar Ibne Alam](https://github.com/shahriaribnealam)**, significantly upgrading the core concept of the original repository.
