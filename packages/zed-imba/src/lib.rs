use zed_extension_api::{self as zed, LanguageServerId, Result};

// Launches imba-language-server (a standard LSP server) over stdio. The
// server is resolved from the workspace's node_modules; during monorepo
// development, override via Zed settings instead:
//
//   "lsp": {
//     "imba-language-server": {
//       "binary": {
//         "path": "node",
//         "arguments": ["/path/to/imba/packages/imba-language-server/dist/index.js", "--stdio"]
//       }
//     }
//   }

const SERVER_CANDIDATES: &[&str] = &[
    "node_modules/imba-language-server/dist/index.js",
    // monorepo layout: opening a project inside the imba repo itself
    "packages/imba-language-server/dist/index.js",
];

struct ImbaExtension;

impl zed::Extension for ImbaExtension {
    fn new() -> Self {
        ImbaExtension
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let root = worktree.root_path();
        for candidate in SERVER_CANDIDATES {
            // read_text_file doubles as an existence check inside the worktree
            if worktree.read_text_file(candidate).is_ok() {
                return Ok(zed::Command {
                    command: zed::node_binary_path()?,
                    args: vec![format!("{root}/{candidate}"), "--stdio".to_string()],
                    env: Default::default(),
                });
            }
        }
        Err(concat!(
            "imba-language-server not found in the workspace. ",
            "Install it (npm i -D imba-language-server) or point Zed at a local build via ",
            "settings: lsp.imba-language-server.binary.{path:\"node\",arguments:[\"<repo>/packages/imba-language-server/dist/index.js\",\"--stdio\"]}",
        )
        .to_string())
    }
}

zed::register_extension!(ImbaExtension);
