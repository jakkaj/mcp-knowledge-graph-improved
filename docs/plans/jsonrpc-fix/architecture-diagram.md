# JSON-RPC Architecture Diagrams

## Current Architecture

Below is a diagram of the current architecture, highlighting the issues in the JSON-RPC handling flow:

```mermaid
flowchart TD
    subgraph Input
        A[JSON-RPC Request via Stdin]
    end

    subgraph EntryPoint["Entry Point (index.ts)"]
        B[Export Components]
        C["No CLI Execution"]
    end

    subgraph CLIModule["CLI Module (main.ts)"]
        D[Parse Arguments]
        E{Check for --server flag}
        F[Start Server]
        G[Show Help & Exit]
    end

    subgraph ServerModule["Server Module (mcp-server.ts)"]
        H[Create Server]
        I[Register Tools]
        J[Custom Stdin Handler]
        K[Process.stdin.resume]
    end

    subgraph TestScript["test-jsonrpc.js"]
        L[Separate JSON-RPC Implementation]
    end

    subgraph Output
        M[JSON-RPC Response via Stdout]
        N[Debug Via Stderr]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E -- Yes --> F
    E -- No --> G
    F --> H
    H --> I
    I --> J
    J --> K
    J -.Debug-> N
    J -.Response-> M

    A -.Alternative Path-> L
    L -.Debug-> N
    L -.Response-> M

    style C fill:#f99,stroke:#f66,stroke-width:2px
    style E fill:#f99,stroke:#f66,stroke-width:2px
    style J fill:#f99,stroke:#f66,stroke-width:2px
    style L fill:#f99,stroke:#f66,stroke-width:2px
```

## Proposed Architecture

The proposed architecture fixes the issues and streamlines the JSON-RPC handling:

```mermaid
flowchart TD
    subgraph Input
        A[JSON-RPC Request via Stdin]
    end

    subgraph EntryPoint["Entry Point (index.ts)"]
        B[Export Components]
        C["Execute CLI When Run Directly"]
    end

    subgraph CLIModule["CLI Module (main.ts)"]
        D[Parse Arguments]
        E{Check for --server flag or Piped Input}
        F[Start Server]
        G[Show Help & Exit]
    end

    subgraph ServerModule["Server Module (mcp-server.ts)"]
        H[Create Server]
        I[Register Tools]
        J[Standardized JSON-RPC Handler]
        K[Process.stdin.resume]
    end

    subgraph Output
        M[JSON-RPC Response via Stdout]
        N[Debug Via Stderr]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E -- Yes --> F
    E -- No --> G
    F --> H
    H --> I
    I --> J
    J --> K
    J -.Debug-> N
    J --Response--> M

    style C fill:#9f9,stroke:#6f6,stroke-width:2px
    style E fill:#9f9,stroke:#6f6,stroke-width:2px
    style J fill:#9f9,stroke:#6f6,stroke-width:2px
```

## Key Improvements

1. **Entry Point Execution**: The entry point now properly executes the CLI code when run directly
2. **Automatic Server Mode**: The CLI automatically detects piped input and enters server mode
3. **Standardized JSON-RPC Handling**: A single, consistent JSON-RPC implementation
4. **Clear I/O Separation**: Response data goes to stdout, debugging information to stderr
5. **Robust Error Handling**: Improved error handling for all JSON-RPC requests

These changes ensure that the command `echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | node dist/index.js` will work correctly without requiring additional flags.