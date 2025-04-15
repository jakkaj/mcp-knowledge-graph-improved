Got it. I’ll gather the full TypeScript API reference for version 1.9.0 of the `@modelcontextprotocol/sdk` package, including all classes, methods, and descriptions. This will be tailored to help an LLM-based coding agent understand how to implement an MCP server using the SDK. I’ll let you know when it’s ready.

# Model Context Protocol TypeScript SDK (v1.9.0) – API Reference

## Overview

The **Model Context Protocol (MCP)** TypeScript SDK (version 1.9.0) provides a complete toolkit for building MCP servers and clients in TypeScript. It handles protocol compliance, message routing, and transport details, allowing you to expose data (resources), actions (tools), and prompt templates to Large Language Models in a standardized way ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=The%20McpServer%20is%20your%20core,protocol%20compliance%2C%20and%20message%20routing)). Using this SDK, you can easily implement an MCP server by registering **resources** (read-only data endpoints), **tools** (operations with side effects), and **prompts** (reusable prompt templates), then connecting the server to a transport (stdio or HTTP/SSE) for communication with an MCP client ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=stdio)).

**Key components of the SDK include:**

- **`McpServer`** – High-level class to create an MCP server, register resources/tools/prompts, and manage connections ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=The%20McpServer%20is%20your%20core,protocol%20compliance%2C%20and%20message%20routing)).
- **`Server`** – Low-level MCP server class for advanced control (manages requests, capabilities, and notifications).
- **`McpClient`** (or `Client`) – High-level class to create an MCP client for connecting to an MCP server, with methods to call tools, read resources, etc.
- **Transports** – Implementations of MCP transport channels (stdio and Server-Sent Events) for both server and client.
- **`ResourceTemplate`** – Utility class for defining parameterized resource URI patterns (used to register dynamic resources).
- **Auth Helpers** – Classes/functions for integrating OAuth flows (e.g. `ProxyOAuthServerProvider` and `mcpAuthRouter` for proxying OAuth to external providers).

Throughout the SDK, **Zod** schemas (`zod` library) are used to define and validate input parameters for tools and prompts, and to generate JSON schema for clients ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Simple%20tool%20with%20parameters,)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.prompt%28%20%22review,code)). The SDK also automatically handles protocol messages like listing available resources/tools/prompts and broadcasting “list changed” notifications to clients when new items are added or removed ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=If%20you%20want%20to%20offer,notificaions)).

Below is a detailed reference of the main classes, methods, and their usage, with examples.

## McpServer (High-Level Server API)

The `McpServer` class is the primary interface for implementing an MCP server ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=The%20McpServer%20is%20your%20core,protocol%20compliance%2C%20and%20message%20routing)). It wraps a low-level `Server` instance and provides convenient methods to register resources, tools, and prompts. It also manages connection lifecycle and protocol compliance for you. For advanced use cases (custom message handlers or manual notifications), you can access the underlying low-level server via the `McpServer.server` property ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=RequestHandlerExtra%20%7D%20from%20,)).

### Creating a Server

To create a server, instantiate `McpServer` with identifying information:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "My App",
  version: "1.0.0",
  // optionally: description: "..." and other metadata
});
``` 

The `name` should be a unique identifier for your server (not necessarily globally unique, but distinct among the MCP servers a client might use), and `version` is your server version ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20server%20%3D%20new%20McpServer%28,)). You can also include optional fields like description or other metadata if needed. Internally, this information is sent to clients when they connect.

### Connecting and Lifecycle

- **`connect(transport: Transport): Promise<void>`** – Attaches the server to a given transport and begins listening for client messages ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=new%20Server%28serverInfo%2C%20options%29%3B%20%7D%20%2F,private%20_toolHandlersInitialized)). This method initiates the MCP handshake and message loop. For example, to run over STDIO (when your server is a subprocess), you could do: 

  ```ts
  const transport = new StdioServerTransport();
  await server.connect(transport);
  ``` 

   ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=import%20,modelcontextprotocol%2Fsdk%2Fserver%2Fstdio.js)). Over HTTP/SSE, you would accept an incoming SSE connection and call `server.connect(new SSEServerTransport(...))` for each client session ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.get%28,await%20server.connect%28transport%29%3B)) (see **Transports** below for details).

- **`close(): Promise<void>`** – Gracefully shuts down the server connection. This will disconnect the transport and stop processing messages. Once closed, the server can no longer communicate with clients until `connect` is called again (typically you create a new server instance for a fresh connection).

- **`isConnected(): boolean`** – Returns `true` if the server is currently connected to a transport (i.e., an active client session exists) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=server%20is%20connected%20to%20a,if%20%28this.isConnected)).

- **`server: Server`** – (Property) The underlying low-level `Server` instance. In advanced scenarios you can use this to send custom notifications or register low-level handlers. For normal usage, you typically do not need to interact with `server` directly, as `McpServer` sets up all required handlers for standard MCP operations ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=RequestHandlerExtra%20%7D%20from%20,)).

#### Automatic Capability Management

When you register resources, tools, or prompts via `McpServer` methods (documented below), the SDK automatically updates the server’s advertised capabilities and request handlers. For example, after you add your first tool, the server will advertise the `"tools"` capability and handle incoming `"listTools"` and `"callTool"` requests from clients. Similarly, adding prompts or resources enables the `"prompts"` and `"resources"` capabilities respectively under the hood. You do not need to manually manage protocol messages for these features – the SDK does it for you.

#### Change Notifications

The SDK will automatically send *list changed* notifications to connected clients whenever you add, remove, or update a resource/tool/prompt at runtime ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=If%20you%20want%20to%20offer,notificaions)). This means if your server’s offerings change (e.g., a tool becomes available or is disabled), clients will be informed via a `listChanged` event for that category. If needed, you can also manually trigger notifications:

- **`sendResourceListChanged(): void`**, **`sendToolListChanged(): void`**, **`sendPromptListChanged(): void`** – Notify the client that the list of resources/tools/prompts has changed. In most cases you don’t need to call these yourself, because methods like `server.tool()` or `registeredTool.update()` will call them automatically when appropriate ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=If%20you%20want%20to%20offer,notificaions)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=resource%20list%20changed%20event%20to,if%20%28this.isConnected)).

### Registering Resources

**Resources** represent read-only data endpoints, analogous to GET requests in a REST API ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=Resources)). They expose data (often documents, files, or records) that an LLM can retrieve via the MCP protocol. Use `McpServer.resource()` to register resources.

`McpServer.resource` has multiple overloads for static vs. dynamic resources:

- **`resource(name: string, uri: string, readCallback): RegisteredResource`** – Register a *static resource* with a fixed URI. The `readCallback` will be invoked whenever a client requests that exact URI. In static resources, `readCallback` is called as `async (uri) => ...` where `uri` is a `URL` object for the requested URI.

- **`resource(name: string, uri: string, metadata: ResourceMetadata, readCallback): RegisteredResource`** – Same as above, but allows providing additional metadata (such as description, content type, etc.) for the resource. The `metadata` object’s fields will be included in listings (e.g., `listResources` results) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=this,)). This is optional; pass an empty object or omit it if not needed.

- **`resource(name: string, template: ResourceTemplate, readCallback): RegisteredResourceTemplate`** – Register a *dynamic resource* defined by a URI template pattern. A `ResourceTemplate` allows parameterized URIs with placeholders (e.g. `"users://{userId}/profile"`). The `readCallback` will be called for any URI that matches the template pattern. In this case, the callback signature is `async (uri, variables) => ...`, where `uri` is the full `URL` requested and `variables` is an object containing the extracted values for the placeholders in the template. For example, if the template is `"users://{userId}/profile"`, and a client requests `users://alice/profile`, then `variables = { userId: "alice" }` ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Dynamic%20resource%20with%20parameters,userId%7D%60)).

- **`resource(name: string, template: ResourceTemplate, metadata: ResourceMetadata, readCallback): RegisteredResourceTemplate`** – Dynamic resource with additional metadata (similar to the static case).

When a resource is registered, the server will begin advertising the `"resources"` capability and will handle `listResources` and `readResource` requests. A resource **name** is an identifier you choose (like `"user-profile"` or `"config"`) that groups related URIs – primarily used for organization and perhaps for logging; clients don’t directly request by this name, they request by URI.

**ResourceTemplate:** To create a dynamic resource, use `new ResourceTemplate(pattern, options)`. The pattern is a URI string with placeholders in `{}` (wildcards). For example, in the code below, `"users://{userId}/profile"` is a pattern with a `{userId}` variable ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Dynamic%20resource%20with%20parameters,userId%7D%60)). The `options` can include: 

- `list: ListResourcesCallback | undefined` – A function to list available resources for this template. If provided, this allows the server to return all existing resource URIs matching the template when a client calls `listResources`. If `list` is set to `undefined` (or omitted), the resource template will not produce any entries in `listResources` (i.e., the client cannot enumerate all instances) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Dynamic%20resource%20with%20parameters,userId%7D%60)). In the example below, `list: undefined` means the server can handle specific `users://...` URIs if requested, but won't list all users proactively.
- `complete: CompleteCallback | undefined` – (Optional) A function to provide autocompletion suggestions for the template’s placeholders. If specified, the server can assist the client/LLM in completing partial URIs by suggesting possible values for the variables. (Autocompletion is an advanced feature; it leverages the MCP `"complete"` method. You can generally omit this unless you want to support hinting possible resource IDs to the client.)

**Example – Static and Dynamic Resources:**

```ts
// Static resource example: a config URI with fixed content
server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "App configuration here"
    }]
  })
);

// Dynamic resource example: user profiles with a templated URI
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      text: `Profile data for user ${userId}`
    }]
  })
);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Static%20resource%20server.resource%28%20,%7D%5D)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Dynamic%20resource%20with%20parameters,userId%7D%60))

In each case, the `readCallback` returns an object with a `contents` array. Each element of `contents` represents part of the resource data. Typically you will return a single item with a `text` field (for text content). For example, in the dynamic resource above, the content is a text string `"Profile data for user X"`. The content object can include `uri` (usually echoing the request URI) and other fields like `text`. The MCP spec supports richer content types (e.g., `type: "text"` vs `type: "image"` or `type: "audio"`), but for most servers a textual response suffices ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=async%20%28uri%29%20%3D,%7D%5D)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=async%20%28uri%2C%20,userId%7D%60%20%7D%5D)).

**Resource callbacks:** should not have side effects or heavy computation. They are intended for data retrieval. If a resource is unavailable or an error occurs, you can throw an error or return an error indication. Throwing an exception inside the `readCallback` will result in an error being propagated to the client (for example, the SDK might catch it and return an error message content). You can also throw an `McpError` with a specific `ErrorCode` if you want fine-grained control, but this is rarely needed for simple scenarios (the SDK uses `McpError` internally to handle not-found or validation errors).

**RegisteredResource / RegisteredResourceTemplate:** The return value of `server.resource()` is an object that allows you to manage the resource at runtime. It has the following properties and methods:

- `name` (string) – The name identifier you gave.
- `enabled` (boolean) – Whether this resource is active. If `enabled` is false, the resource will not appear in `listResources` and clients cannot read it (attempts will get an error).
- `disable()` / `enable()` – Convenience methods to set `enabled` to false or true, respectively. Toggling this will automatically notify clients of the change (via `listChanged` events) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Until%20we%20upgrade%20auth%2C,disable)).
- `update(updates: object)` – Update properties of the resource. For a static resource, you can update fields like `uri` (to change its identifier), `name`, `metadata`, or even replace the `readCallback`. For a templated resource, you can update `name`, the `template` (URI pattern), `metadata`, or `readCallback` similarly ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=ReadResourceCallback%2C%20enabled%3A%20true%2C%20disable%3A%20,registeredResource.readCallback)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=throw%20new%20Error%28%60Resource%20template%20%24,updates.name%5D%20%3D%20registeredResourceTemplate)). Changing the URI or name will update internal registrations accordingly. After an update, a `listChanged` notification is sent.
- `remove()` – Unregisters the resource. Internally, this is implemented by `update({ uri: null })` for static resources or `update({ name: null })` for templated resources ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=RegisteredResource%20%3D%20,registeredResource.readCallback)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=ReadResourceTemplateCallback%2C%20enabled%3A%20true%2C%20disable%3A%20,template%20if%20%28typeof)). Removing a resource will make it no longer available to clients (and will emit a list-changed event to inform them).

With these methods, you can dynamically manage your server’s resources even after the server is running. For example, you might enable or disable certain data based on user authentication, or add/remove resources in response to external events. The SDK ensures that any such changes are communicated to the client automatically ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=If%20you%20want%20to%20offer,notificaions)).

### Registering Tools

**Tools** represent operations or actions that the LLM can request the server to perform ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=Tools%20let%20LLMs%20take%20actions,computation%20and%20have%20side%20effects)). They are akin to “POST” or function calls – they can have side effects or perform computations, and they return a result (which could be data or a confirmation). Use `McpServer.tool()` to register tools.

`McpServer.tool` supports several overloads for flexibility:

- **`tool(name: string, callback): RegisteredTool`** – Register a tool with no input parameters. The `callback` is a function that will execute when the tool is called. Since there are no parameters, the callback signature is `async () => ToolOutput` (it can also accept an optional second argument for context, described below).

- **`tool(name: string, description: string, callback): RegisteredTool`** – Same as above, but with a human-readable description of what the tool does. The description will be included in the tool’s metadata sent to clients (so the LLM or developer knows what the tool is for). Including a description is recommended for clarity, though not required.

- **`tool(name: string, paramsSchema: ZodRawShape, callback): RegisteredTool`** – Register a tool that accepts input arguments. Here `paramsSchema` is an object defining named parameters and their types using Zod schemas. For example: 

  ```ts
  server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  }));
  ``` 

  This defines a tool `"add"` taking two numeric inputs. The callback in this case will receive an object argument, e.g. `{ a: 2, b: 3 }`. The SDK will automatically validate and parse the input against the Zod schema before calling your callback ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=ErrorCode.InvalidParams%2C%20%60Tool%20%24,return%20await)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=%28tool.inputSchema%29%20,type)).

- **`tool(name: string, description: string, paramsSchema: ZodRawShape, callback): RegisteredTool`** – Tool with both description and parameters.

All overloads return a `RegisteredTool` object (described below).

In all cases, the **callback** can be synchronous or asynchronous (returning a Promise). The callback may optionally accept a second parameter, often called `extra` or `context`, of type `RequestHandlerExtra`. The SDK will pass an object here with additional context such as an abort signal or authentication info if applicable. This parameter is not commonly needed for basic usage, but it’s available for advanced scenarios. Most often, you’ll define your callback to only use the inputs you specified (or no inputs for a zero-arg tool).

**Tool output:** The callback should return an object representing the result. At minimum, this should include a `content` field, which is an array of content items similar to resource contents. For example, a simple text result might be:

```js
return { content: [ { type: "text", text: "result text" } ] };
``` 

Each content item can have a type (`"text"`, `"code"`, `"image"`, etc.) and corresponding fields (`text`, `url`, etc.). Typically for text, use `{ type: "text", text: "your message" }` ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=async%20%28,heightM%29%29)). You can return multiple content parts if needed (e.g., text and an image preview). You may also include an `isError: true` flag in the result if you want to indicate the result is an error message; however, if your tool logic throws an exception or returns a rejected Promise, the SDK will catch it and automatically generate an error content for you ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=%24,private)). In other words, you don’t usually need to set `isError` manually; simply throw an error with a message and the client will receive it as a text content marked as an error.

**Example – Tools:**

```ts
// Tool with parameters (calculate BMI)
server.tool(
  "calculate-bmi",
  { weightKg: z.number(), heightM: z.number() },
  async ({ weightKg, heightM }) => ({
    content: [{
      type: "text",
      text: String(weightKg / (heightM * heightM))
    }]
  })
);

// Tool that calls an external API (fetch weather)
server.tool(
  "fetch-weather",
  { city: z.string() },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.text();
    return {
      content: [{ type: "text", text: data }]
    };
  }
);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Simple%20tool%20with%20parameters,%28%7B%20content%3A)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.tool%28%20%22fetch,text%3A%20data%20%7D%5D))

In the above examples, the `"calculate-bmi"` tool performs a computation on the provided inputs, and `"fetch-weather"` makes an external HTTP request to get data. Both return their results as text content.

**RegisteredTool:** Similar to resources, when you register a tool, you get back a `RegisteredTool` object that lets you manage it at runtime. It has:

- `description` (string | undefined) – The description (if provided).
- `inputSchema` (ZodObject | undefined) – The Zod schema for inputs (if provided).
- `enabled` (boolean) – Whether the tool is currently enabled.
- `disable()` / `enable()` – Disable or enable the tool. A disabled tool will not be listed or callable by clients (attempts to call it will result in an error indicating it’s disabled). Enabling it makes it available again. These actions trigger an automatic tools list update notification to clients ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Until%20we%20upgrade%20auth%2C,disable)).
- `update(updates: object)` – Modify the tool’s properties. You can change the `name` (which re-registers it under a new name and removes the old), update the `description`, replace the `paramsSchema` (the schema) or `callback` function, and toggle `enabled`. For example, you might update a tool’s schema to accept different parameters after some condition. After updating, the clients are notified of the changes ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=enabled%3A%20true%20,this._registeredTools%5Bname%5D)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=,sendToolListChanged%28%29%20return)).
- `remove()` – Unregister the tool (alias for `update({ name: null })`). After removal, the tool won’t appear in `listTools` and cannot be called. This also triggers a list-changed notification.

Using these, you can add or modify tools dynamically. For instance, you might initially register a tool as disabled and only enable it when certain conditions are met (as shown below), or remove/replace tools based on user actions. The MCP SDK supports dynamic changes fluidly.

**Example – Dynamic Tool Management:**

```ts
const putMessageTool = server.tool(
  "putMessage",
  { channel: z.string(), message: z.string() },
  async ({ channel, message }) => ({
    content: [{ type: "text", text: await putMessage(channel, message) }]
  })
);
// Start with this tool disabled (so it won't show up in listTools yet)
putMessageTool.disable();

// Later on, enable the tool based on an event (e.g. user permission upgrade):
putMessageTool.enable();

// You can also update a tool's schema or behavior:
const upgradeAuthTool = server.tool(
  "upgradeAuth",
  { permission: z.enum(["write", "admin"]) },
  async ({ permission }) => {
    const { ok, previous } = await upgradeUserPermission(permission);
    if (!ok) {
      return { content: [{ type: "text", text: "Error upgrading permissions." }], isError: true };
    }
    if (previous === "read" && permission === "write") {
      // Now that user has write permission, enable the previously hidden tool
      putMessageTool.enable();
    }
    if (permission === "admin") {
      // If user became admin, maybe remove this tool as it's no longer needed
      upgradeAuthTool.remove();
    }
    return { content: [{ type: "text", text: "Permissions updated." }] };
  }
);
``` 

*(In this hypothetical example, `"putMessage"` is initially registered but not available until some auth is upgraded. The `"upgradeAuth"` tool, when called, enables `"putMessage"` and eventually removes itself when no longer applicable. The SDK takes care of informing the client about these changes.)* 

As shown, calling `disable()`, `enable()`, `update()`, or `remove()` on a `RegisteredTool` (or similarly on resources/prompts) will automatically emit the appropriate `listChanged` notifications to update connected clients ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Until%20we%20upgrade%20auth%2C,disable)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20If%20we%20previously%20had,%7B%20putMessageTool.enable%28%29)).

### Registering Prompts

**Prompts** are reusable prompt templates that your server provides to guide the LLM in interacting with your data or tools ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=Prompts%20are%20reusable%20templates%20that,interact%20with%20your%20server%20effectively)). Think of them as pre-defined messages or conversation setups that the LLM can request. For example, a prompt might encapsulate “how to ask the server to review code” or “the format for querying a database”. Use `McpServer.prompt()` to register prompts.

Similar to tools, `McpServer.prompt` has overloads:

- **`prompt(name: string, callback): RegisteredPrompt`** – Register a prompt that takes no parameters. The `callback` should produce the prompt content. Signature: `async () => PromptOutput`.

- **`prompt(name: string, description: string, callback): RegisteredPrompt`** – Same as above, with a descriptive string for the prompt.

- **`prompt(name: string, argsSchema: ZodRawShape, callback): RegisteredPrompt`** – Register a parameterized prompt that accepts arguments. `argsSchema` is an object of named parameters (with Zod types) similar to tool parameters. The callback signature in this case is `async (args) => PromptOutput`, where `args` is an object with the validated arguments.

- **`prompt(name: string, description: string, argsSchema: ZodRawShape, callback): RegisteredPrompt`** – Prompt with both description and parameters.

The **callback** for a prompt is expected to return a **PromptOutput** object, which typically contains a `messages` array. Each message in the array has a `role` (e.g., `"user"` or `"assistant"`) and a `content` (which is structured similarly to tool/resource content, with `type`, `text`, etc.) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.prompt%28%20%22review,code%7D%60)). Essentially, the prompt’s output defines one or more messages that should be injected into the conversation with the LLM. Usually, a prompt will be one user message that asks the assistant to do something with the given parameters.

**Example – Prompt:**

```ts
server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:\n\n${code}`
      }
    }]
  })
);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.prompt%28%20%22review,code))

In this example, the prompt `"review-code"` takes a string of code and produces a user message asking the assistant to review the code. The client (LLM) could call `getPrompt("review-code", { code: "...source..." })` to retrieve this formatted message, which it would then include in its conversation context.

Prompt callbacks can also be async if needed (e.g., if they fetch some template from a database). They follow the same pattern of input validation via Zod. If the prompt has no arguments, just return a fixed set of messages. If an error occurs in the prompt callback, it can throw an exception which will be propagated similarly to tool errors.

**RegisteredPrompt:** The object returned by registering a prompt contains:

- `description` (string | undefined) – Description of the prompt (if provided).
- `argsSchema` (ZodObject | undefined) – Zod schema for arguments (if any).
- `enabled` (boolean) – Whether the prompt is active.
- `disable()` / `enable()` – Disable or enable the prompt (removing or adding it to listings).
- `update(updates: object)` – Update prompt properties: you can change its `name`, `description`, `argsSchema`, or `callback` function on the fly ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=registeredPrompt%3A%20RegisteredPrompt%20%3D%20,undefined)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=updates.description%20%21%3D%3D%20,this._registeredPrompts%5Bname)). For instance, you might adjust the prompt template or deprecate old prompts by renaming/removing.
- `remove()` – Unregister the prompt (`update({ name: null })` internally).

As with tools and resources, changing a prompt’s status or removing it will notify clients automatically ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=if%20%28typeof%20updates.enabled%20%21%3D%3D%20,if%20the%20server%20is%20connected)).

**Autocompletion for Prompt Arguments:** If you have arguments that could benefit from autocompletion (for example, a prompt argument that should be a file path or a code identifier), the SDK provides a way to support that. You can use a special schema type for such fields (a **Completable** – an extension of Zod schema with a `complete()` function). If an argument’s schema is marked as completable, the MCP server can handle `"complete"` requests from the client to provide suggestion lists for that field. To use this, you would wrap the field’s schema with the SDK’s `Completable` utility and provide a completion callback. Due to complexity, full details are beyond this summary, but know that the MCP SDK can support autocompleting prompt args if needed. By default, prompt arguments are not autocompleted unless explicitly configured.

### Server Transports

Once you have registered all resources, tools, and prompts on your `McpServer`, you need to **connect** it to a transport so it can communicate with an MCP client. The SDK provides two main server transport implementations out-of-the-box:

- **Standard I/O Transport (`StdioServerTransport`)** – Communicates via the process’s stdin/stdout streams (JSON messages). This is typically used when your MCP server runs as a child process of an application (for example, an editor or tool launching the MCP server and communicating over pipes) ([Model context protocol (MCP) - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/mcp/#:~:text=1,to%20them%20via%20a%20URL)). It’s extremely simple to use:

  ```ts
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  // ...
  const transport = new StdioServerTransport();
  await server.connect(transport);
  ``` 

  This will start reading JSON-RPC messages from stdin and writing responses to stdout ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=import%20,modelcontextprotocol%2Fsdk%2Fserver%2Fstdio.js)). No additional configuration is needed; by default it will read from the current process’s standard input/output.

- **HTTP SSE Transport (`SSEServerTransport`)** – Supports **Server-Sent Events** (SSE) over HTTP. Use this when your MCP server runs as a standalone service that clients connect to over HTTP. In SSE mode, the server pushes messages to the client over a persistent HTTP stream, and the client sends messages back via a separate POST endpoint. The SDK’s `SSEServerTransport` helps manage this pattern. 

  To use `SSEServerTransport`, you need an HTTP server or framework (e.g., Express) to handle incoming requests. Typically, you set up two endpoints:
  1. **SSE endpoint (GET)** – a route that clients connect to with an EventSource. For each connection, instantiate `SSEServerTransport`, providing it the URL path that will handle incoming messages (e.g., `"/messages"`) and the Express `Response` object for the SSE stream. Then call `server.connect(transport)` to start the session ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.get%28,await%20server.connect%28transport%29%3B)).
  2. **Message endpoint (POST)** – a route (e.g., `POST /messages`) that the client will POST MCP client messages to. This route should locate the appropriate `SSEServerTransport` (e.g., by session ID) and call `transport.handlePostMessage(req, res)` to feed the incoming message to the server ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.post%28,)).

  The `SSEServerTransport` generates a unique `sessionId` for each connection, which you can use as a key to map POST requests to the correct transport instance ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.get%28,await%20server.connect%28transport%29%3B)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.post%28,)). The sessionId is also sent to the client as a query parameter or part of the SSE handshake (in the SDK’s implementation, the client will include `?sessionId=...` when posting, as seen in the example).

**Example – Express server with SSE:**

```ts
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({ name: "example-server", version: "1.0.0" });
// ... register resources, tools, prompts ...

const app = express();
const transports: { [sessionId: string]: SSEServerTransport } = {};

// SSE GET endpoint
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

// Messages POST endpoint
app.post("/messages", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (!transport) {
    res.status(400).send("No transport for session");
  } else {
    await transport.handlePostMessage(req, res);
    // `handlePostMessage` will read the request body (the client message) 
    // and send the appropriate response back via the SSE stream.
  }
});

app.listen(3001);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.get%28,await%20server.connect%28transport%29%3B)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.post%28,))

In this example, when a client connects to `/sse`, we create a new `SSEServerTransport` bound to the `/messages` endpoint and store it. When the client posts to `/messages` with the matching sessionId, we forward that to the `transport`. The `SSEServerTransport` takes care of formatting and delivering messages over SSE. Each `SSEServerTransport` maintains the SSE connection (sending data to the client) and buffers any outgoing messages until the client polls them via `handlePostMessage`. This setup allows multiple simultaneous client connections to one server process, each identified by a `sessionId`.

**Note:** The details of SSE handling (like CORS, timeouts, reconnections) are handled by the client and transport implementation. As a server developer, you mainly ensure the routing is set up as above. If using frameworks other than Express, the idea is similar: on SSE connect, create a transport and call `server.connect`; on receiving a POST from the client, forward it to `transport.handlePostMessage`.

### Low-Level Server API (`Server` class)

While `McpServer` covers most use cases with a convenient interface, the SDK also provides a lower-level **`Server`** class in `@modelcontextprotocol/sdk/server/index.js` for advanced scenarios. This class directly represents an MCP server protocol handler. You might use it if you need fine-grained control over the MCP message handling or want to implement custom capabilities.

**Creating a Server:** 

```ts
import { Server, ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";

const serverInfo = { name: "example-server", version: "1.0.0" };  // same as used in McpServer
const options: ServerOptions = { 
  capabilities: { 
    // specify which capabilities this server will support from the start
    prompts: {}, 
    tools: {}, 
    resources: {} 
    // (empty objects or detailed capability configs; empty {} enables the basic capability)
  } 
};
const lowLevelServer = new Server(serverInfo, options);
```

This `Server` does not automatically set up any request handlers. Instead, you register handlers for each MCP request method you want to support:

- **`server.setRequestHandler(requestSchema, handler)`** – Attach a handler for a given request type. The SDK defines schema objects for each MCP request (for example, `ListResourcesRequestSchema`, `ReadResourceRequestSchema`, `ListToolsRequestSchema`, `CallToolRequestSchema`, `ListPromptsRequestSchema`, `GetPromptRequestSchema`, etc.). You must import the relevant schema and provide a handler function. For instance, if you want to support listing prompts, you’d do something like:

  ```ts
  import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

  lowLevelServer.setRequestHandler(ListPromptsRequestSchema, async () => {
    // return ListPromptsResult
    return { prompts: [ /* ... array of Prompt metadata ... */ ] };
  });

  lowLevelServer.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const name = request.params.name;
    // find prompt by name, then return GetPromptResult
    if (name === "example-prompt") {
      return { 
        description: "Example prompt",
        messages: [ /* ... prompt messages ... */ ]
      };
    } else {
      throw new Error("Unknown prompt");
    }
  });
  ``` 

   ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20List%20prompts%20const%20prompts,listPrompts)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.setRequestHandler%28GetPromptRequestSchema%2C%20async%20%28request%29%20%3D,content%3A)). You would do similar for tools (`ListToolsRequestSchema`, `CallToolRequestSchema`), resources (`ListResourcesRequestSchema`, `ReadResourceRequestSchema`, plus `ListResourceTemplatesRequestSchema` if you want to expose templates separately), etc., depending on what capabilities your server supports. The `requestSchema` objects are provided by the SDK for type safety, and the handler receives a typed `request` object (with `params` and possibly `id`) and optionally a context (`extra`) as with the high-level callbacks.

- **`server.registerCapabilities(capabilities)`** – Inform the server of supported capabilities and features. This is used to set flags like `{ tools: { listChanged: true } }` indicating the server will send `listChanged` events for tools, etc. When using `McpServer`, it calls this internally when needed ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=this.server.assertCanSetRequestHandler%28%20CallToolRequestSchema.shape.method.value%2C%20%29%3B%20this.server.registerCapabilities%28,setRequestHandler%28%20CallToolRequestSchema%2C%20async%20%28request)). With `Server`, you might call this to announce new capabilities if you dynamically add them.

- **`server.connect(transport)`** and **`server.close()`** – Similar to `McpServer.connect`/`close`, used to start and stop the server on a given transport.

- **Notification methods:** `Server` likely provides methods to send notifications such as `server.sendResourceListChanged()`, `server.sendToolListChanged()`, etc., which `McpServer` calls internally. You can use these if you manually manage lists and want to signal the client. Also, `Server.onerror` or other event handlers can be set to catch errors in processing.

Using `Server` directly is more verbose – you must manually handle request dispatch and maintain state (like lists of tools, etc.). In practice, you would only use this if you need something not supported by `McpServer`. For example, if you wanted to implement an MCP server that doesn’t use the provided resource/tool/prompt abstractions at all, but instead implements the MCP spec in a completely custom way, `Server` gives you a hook into the raw protocol. Most implementations can and should use `McpServer` for simplicity.

*(In summary, prefer `McpServer` unless you have a specific reason. `McpServer` uses a `Server` under the hood, setting up all standard handlers for you ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=_registeredPrompts%3A%20,private%20_toolHandlersInitialized)).)*

## MCP Client (TypeScript)

While the question focuses on implementing a server, it’s useful to know the SDK also includes a client-side API for MCP. The **`Client`** class (importable from `@modelcontextprotocol/sdk/client/index.js`) allows a TypeScript application or agent to connect to an MCP server and invoke its functionality. This is essentially the mirror of `McpServer`.

### Creating a Client and Transport

To use the client, you instantiate it with an identifier (name/version like a server, but identifying your client):

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "example-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]  // for example, spawn a child MCP server process
});
await client.connect(transport);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20transport%20%3D%20new%20StdioClientTransport%28,)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20client%20%3D%20new%20Client,client%22%2C%20version%3A%20%221.0.0%22%20%7D))

`StdioClientTransport` can spawn a subprocess (here `server.js`) and connect to it via stdio. You can also connect to an already running process by configuring the stdio transport accordingly (or by using pipes). For remote connections over HTTP, the SDK provides `SSEClientTransport` which takes the URL of the server’s SSE endpoint (for example, `new SSEClientTransport(new URL("http://localhost:3001/sse"))` to connect to the SSE server we set up earlier) ([Connecting to an MCP Server from JavaScript using LangChain.js](https://blog.marcnuri.com/connecting-to-mcp-server-with-langchainjs#:~:text=We%20create%20a%20new%20SSEClientTransport,client%20instance%2C%20passing%20the)). After connecting, the client will perform a handshake to establish protocol version compatibility with the server.

### Client Methods

Once connected, the `Client` instance has methods to interact with the server’s capabilities:

- **`listResources(): Promise<ListResourcesResult>`** – Fetches the list of available resources from the server. Returns an object containing an array of resources (each with `uri`, `name`, and any metadata) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20List%20resources%20const%20resources,listResources)).

- **`readResource(params: { uri: string }): Promise<ReadResourceResult>`** – Reads a specific resource given its URI. Returns the resource content (which may include `contents` array with data) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Read%20a%20resource%20const,)).

- **`listTools(): Promise<ListToolsResult>`** – Retrieves the list of available tools (name, description, and input schema for each). (Not shown in the code snippet above, but this method exists since the server supports listing tools. The Agents SDK, for example, calls `listTools()` on each run ([Model context protocol (MCP) - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/mcp/#:~:text=Using%20MCP%20servers)).)

- **`callTool(params: { name: string, arguments: any }): Promise<CallToolResult>`** – Invokes a tool by name with the given arguments object. Returns the tool’s result (which includes the `content` array, and possibly an `isError` flag) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Call%20a%20tool%20const,%7D)).

- **`listPrompts(): Promise<ListPromptsResult>`** – Gets the list of available prompt templates from the server ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20List%20prompts%20const%20prompts,listPrompts)). The result includes each prompt’s name, description, and schema for arguments (if any).

- **`getPrompt(params: { name: string, arguments?: any }): Promise<GetPromptResult>`** – Requests a prompt by name, optionally supplying arguments. Returns the prompt’s details, typically including the prompt’s formatted `messages` ready to be used in an LLM conversation ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Get%20a%20prompt%20const,%7D)). (If the prompt has required arguments, you must provide them; if no args, you can omit the `arguments` field or pass an empty object.)

- **`close(): Promise<void>`** – Disconnects from the server (if you are done using it).

The client API essentially mirrors the server’s features. For example, calling `client.listResources()` triggers the server’s `ListResources` handler (which `McpServer` sets up for you), `client.callTool()` triggers the server’s `CallTool` logic, and so forth.

**Usage example (client):**

```ts
// Assume client is already connected as shown above
const resources = await client.listResources();
console.log("Available resources:", resources.resources);

if (resources.resources.length) {
  const first = resources.resources[0];
  const data = await client.readResource({ uri: first.uri });
  console.log("Content of first resource:", data.contents);
}

const tools = await client.listTools();
console.log("Available tools:", tools.tools);

if (tools.tools.find(t => t.name === "example-tool")) {
  const result = await client.callTool({
    name: "example-tool",
    arguments: { arg1: "value" }
  });
  console.log("Tool result content:", result.content);
}

const prompts = await client.listPrompts();
if (prompts.prompts.find(p => p.name === "example-prompt")) {
  const prompt = await client.getPrompt({
    name: "example-prompt",
    arguments: { arg1: "value" }
  });
  console.log("Prompt messages:", prompt.messages);
}
``` 

This illustrates how a client would discover what a server offers and use it. In practice, an LLM agent (like those in OpenAI’s Agents SDK or other frameworks) would perform these calls under the hood to integrate the MCP server’s functionality into the LLM’s tool use.

**Client Transports:** We demonstrated `StdioClientTransport` (which spawns or attaches to a local process via stdio). For remote servers, you would use **`SSEClientTransport`**, providing the URL to the server’s SSE endpoint. The SSE client transport will handle establishing the SSE connection and managing the POST requests for you (likely using `fetch` under the hood). Ensure the server’s SSE endpoint is accessible (and CORS enabled if cross-origin). The usage is straightforward: 

```ts
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
const transport = new SSEClientTransport(new URL("http://localhost:3001/sse"));
await client.connect(transport);
```

After this, you can call the same methods (`listResources`, etc.) on the client. The difference is purely in transport.

## Authentication and OAuth Integration

MCP has a concept of **authorization** for servers that require authentication (e.g., OAuth2). The TypeScript SDK includes utilities to help implement an OAuth2 flow by proxying it to an external provider. This is useful if your MCP server needs to authorize the LLM (or user) to access certain data, often via an OAuth login.

The main components are **`ProxyOAuthServerProvider`** and **`mcpAuthRouter`** (available from the package’s root import). These help set up an Express router that implements the OAuth endpoints (authorization, token exchange, etc.) according to the MCP spec, delegating the actual auth to an external OAuth provider.

- **`new ProxyOAuthServerProvider(options)`** – Creates a provider that knows how to forward OAuth requests. The `options` include:
  - `endpoints` – An object with URLs for the external provider’s endpoints: `{ authorizationUrl, tokenUrl, revocationUrl }` (and possibly others if needed). These are the URLs of the real OAuth 2.0 provider (for example, Okta, Google, etc.) that will handle the user login and token issuance ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20proxyProvider%20%3D%20new%20ProxyOAuthServerProvider%28,token)).
  - `verifyAccessToken: async (token) => AuthInfo` – A function to validate incoming access tokens. After the client obtains an access token, MCP may call this to verify it. You should implement it to call the external provider’s introspection or validation, or decode a JWT if appropriate. It should return an object with at least the `token`, `clientId`, and `scopes` that were granted ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20proxyProvider%20%3D%20new%20ProxyOAuthServerProvider%28,token)).
  - `getClient: async (client_id) => ClientInfo` – A function to retrieve client registration info (like redirect URIs) by ID ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=clientId%3A%20,)). MCP uses this when performing the authorization code flow to ensure the client (the entity requesting OAuth, which in many cases is the LLM application) is known and to get its redirect URI for callbacks.

- **`mcpAuthRouter({ provider, issuerUrl, baseUrl, serviceDocumentationUrl })`** – Creates an Express router with the necessary routes (`/authorize`, `/token`, `/revoke`, and supporting `.well-known` metadata) for the MCP OAuth flow. You supply the `provider` (likely the `ProxyOAuthServerProvider` instance), the `issuerUrl` (the base URL of the external auth issuer), the `baseUrl` of your MCP service, and a `serviceDocumentationUrl` (a URL to human-readable docs about your service, to be included in the OAuth metadata) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.use%28mcpAuthRouter%28,)). 

Using these, your server can handle an OAuth authorization request by redirecting the user to the external provider’s authorization page, and then exchanging the code for a token via the external provider – essentially acting as a proxy. The `mcpAuthRouter` ensures the routes conform to MCP’s expectations and that the tokens are ultimately issued for the MCP server.

**Example – Setting up OAuth proxy:**

```ts
import express from "express";
import { ProxyOAuthServerProvider, mcpAuthRouter } from "@modelcontextprotocol/sdk";

const proxyProvider = new ProxyOAuthServerProvider({
  endpoints: {
    authorizationUrl: "https://auth.external.com/oauth2/v1/authorize",
    tokenUrl: "https://auth.external.com/oauth2/v1/token",
    revocationUrl: "https://auth.external.com/oauth2/v1/revoke",
  },
  verifyAccessToken: async (token) => {
    // Validate token (this is application-specific; e.g., call external introspection)
    return {
      token,
      clientId: "123",
      scopes: ["openid", "email", "profile"],
    };
  },
  getClient: async (client_id) => {
    // Return client registration info
    return {
      client_id,
      redirect_uris: ["http://localhost:3000/callback"],
    };
  }
});

const app = express();
app.use(mcpAuthRouter({
  provider: proxyProvider,
  issuerUrl: new URL("http://auth.external.com"),
  baseUrl: new URL("http://mcp.example.com"),
  serviceDocumentationUrl: new URL("https://docs.example.com/")
}));

app.listen(3000);
``` 

 ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=import%20express%20from%20%27express%27%3B%20import,from%20%27%40modelcontextprotocol%2Fsdk)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.use%28mcpAuthRouter%28,))

In the above code, we configure the router to forward OAuth requests to `auth.external.com`. When an MCP client (like an LLM agent) initiates an OAuth flow with our MCP server, these routes will handle the exchange: presenting the user with the external login (via redirect), then obtaining the token and ultimately handing an access token (or error) back to the MCP client. The `verifyAccessToken` and `getClient` are hooks for the developer to integrate with their specific auth provider logic.

Once this is set up, your MCP server can declare an `"oauth2"` capability (if not automatically declared) and require clients to obtain an access token via this flow for protected operations. The details of using the access tokens in requests (and marking resources/tools as protected) are part of the MCP spec (the SDK’s `RequestHandlerExtra` may carry authentication info after verification). Essentially, this feature allows your MCP server to deferring authentication to an external OAuth provider.

## Conclusion

This reference covered the main APIs of the `@modelcontextprotocol/sdk` TypeScript SDK v1.9.0, including `McpServer` and its usage for defining resources, tools, and prompts, how to connect the server using available transports (stdio, SSE), and how to manage dynamic changes. We also briefly covered the corresponding client API and advanced features like using the low-level `Server` class and setting up OAuth2 integration. 

Using this SDK, a developer can implement an MCP server that exposes arbitrary data and functionality to AI assistants in a standardized way. The high-level `McpServer` methods abstract away the JSON-RPC message handling – you simply define what the server offers and plug in a transport. The SDK ensures that everything conforms to the MCP protocol (handshakes, request/response formatting, error codes, etc.) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=The%20McpServer%20is%20your%20core,protocol%20compliance%2C%20and%20message%20routing)). By following the above patterns and utilizing the comprehensive methods provided, you can build robust MCP-compatible services for your AI applications.

**References:**

- MCP TypeScript SDK README and documentation ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=The%20McpServer%20is%20your%20core,protocol%20compliance%2C%20and%20message%20routing)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Static%20resource%20server.resource%28%20,%7D%5D)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Dynamic%20resource%20with%20parameters,userId%7D%60)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Simple%20tool%20with%20parameters,%28%7B%20content%3A)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.tool%28%20%22fetch,text%3A%20data%20%7D%5D)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=server.prompt%28%20%22review,code)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=import%20,modelcontextprotocol%2Fsdk%2Fserver%2Fstdio.js))  
- MCP SDK source code (v1.9.0) for method signatures and behaviors ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=enabled%3A%20true%20,this._registeredTools%5Bname%5D)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=registeredPrompt%3A%20RegisteredPrompt%20%3D%20,undefined)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=ReadResourceCallback%2C%20enabled%3A%20true%2C%20disable%3A%20,registeredResource.readCallback)) ([raw.githubusercontent.com](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/src/server/mcp.ts#:~:text=throw%20new%20Error%28%60Resource%20template%20%24,updates.name%5D%20%3D%20registeredResourceTemplate)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=If%20you%20want%20to%20offer,notificaions)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=%2F%2F%20Until%20we%20upgrade%20auth%2C,disable)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.get%28,await%20server.connect%28transport%29%3B)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.post%28,)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=import%20express%20from%20%27express%27%3B%20import,from%20%27%40modelcontextprotocol%2Fsdk)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=app.use%28mcpAuthRouter%28,)).