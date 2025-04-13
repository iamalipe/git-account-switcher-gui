# Git Account Switcher GUI

**Effortlessly manage multiple GitHub accounts from your desktop.**

Git Account Switcher GUI is a desktop application designed to simplify managing multiple GitHub accounts. Built using Tauri, React, and Rust, it provides a seamless experience for developers needing to switch between different GitHub profiles quickly and securely.

## Key Features

- **Effortless Account Switching:** Add, switch, and remove GitHub accounts with just a few clicks.
- **Clear Account Overview:** View all your configured accounts in a clean, organized list.
- **Automatic SSH Key Management:**
  - Generates unique SSH keys for each account upon addition.
  - Easily view and copy SSH keys to your clipboard for adding to GitHub.
- **Secure:** Stores account information locally. Does _not_ store GitHub passwords or personal access tokens.
- **Cross-Platform:** Available for Windows, macOS, and Linux.

## Installation

Download the latest version for your operating system from the [**Releases Page**](https://github.com/iamalipe/git-account-switcher-gui/releases).

### Platform Instructions:

1.  **Windows:**

    - Download the `.msi` installer file.
    - Run the installer and follow the setup prompts.

2.  **macOS:**

    - Download the `.dmg` disk image file.
    - Open the `.dmg` file.
    - Drag the `Git Account Switcher GUI` application icon into your `Applications` folder.

3.  **Linux:**
    - Download the `.AppImage` file.
    - Make the file executable:
      ```bash
      chmod +x Git\ Account\ Switcher\ GUI*.AppImage
      ```
    - Run the application:
      ```bash
      ./Git\ Account\ Switcher\ GUI*.AppImage
      ```
      _`(Note: You might need to install libwebkit2gtk-4.0-37 or similar dependencies depending on your distribution if you encounter issues. Use quotes or backslashes for the filename if it contains spaces.)`_

## How to Use

1.  **Launch Git Account Switcher GUI.**
2.  **Add Account:**
    - Go to the "Add Account" section.
    - Enter the Name and Email associated with your GitHub account.
    - Click "Add Account".
    - The application will generate an SSH key pair. Click "Show SSH Key" and copy the public key.
    - Add the copied public SSH key to your GitHub account settings under "SSH and GPG keys".
3.  **Switch Active Account:**
    - Go to the "Switch Account" section.
    - Click the "Switch" button next to the desired account.
    - The currently active account will be highlighted. Git operations in your terminal will now use this account's credentials.
4.  **View/Copy SSH Key:**
    - Click "Show SSH Key" next to any account to view its public SSH key.
    - Use the "Copy" button for easy pasting into GitHub.

## Building from Source

If you prefer to build the application yourself:

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (v14+) and [Rust](https://www.rust-lang.org/tools/install) installed.
2.  **Clone:** (The repository name remains `git-account-switcher-gui`)
    ```bash
    git clone https://github.com/iamalipe/git-account-switcher-gui.git
    cd /git-account-switcher-gui
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Run in Development Mode:**
    ```bash
    npm run tauri dev
    ```
5.  **Build for Production:**
    ```bash
    npm run tauri build
    ```
    _`(The build artifacts will be located in src-tauri/target/release/bundle/)`_

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/iamalipe/git-account-switcher-gui/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

[_Enjoying Git Account Switcher GUI? Consider supporting the developer!_](https://buymeacoffee.com/21abhiseckc)
