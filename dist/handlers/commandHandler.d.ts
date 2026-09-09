import { type SendFn } from "../shop/SessionManager.js";
export interface ParsedCommand {
    type: "shop" | "decide" | "help" | "unknown";
    args?: string;
}
export declare function parseCommand(text: string): ParsedCommand;
export declare function handleCommand(command: ParsedCommand, chatId: string, senderId: string, senderName: string, send: SendFn): Promise<void>;
//# sourceMappingURL=commandHandler.d.ts.map