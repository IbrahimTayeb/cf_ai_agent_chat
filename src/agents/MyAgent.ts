import { Agent } from "agents";
import type { Env } from "../env";

export class MyAgent extends Agent<Env> {
  async onMessage(event: any) {
    const { message, userId } = event.data || event;

    // Get chat history
    const history = (await this.getState("conversation")) || [];
    history.push({ role: "user", text: message });
    await this.setState("conversation", history);

    // Create embedding & store in Vectorize
    const embedding = await this.env.AI.run("@cf/baai/bge-small-en-v1.5", { text: message });
    await this.env.MEMORY_INDEX.upsert([
      {
        id: `${this.id}-${Date.now()}`,
        values: embedding.data[0],
        metadata: { text: message, user: userId }
      }
    ]);

    // Retrieve related memories
    const query = await this.env.MEMORY_INDEX.query({
      vector: embedding.data[0],
      topK: 3
    });

    const context = query.matches.map(m => m.metadata.text).join("\n");

    // Build prompt
    const prompt = `You are a helpful assistant. Here are relevant memories:\n${context}\nUser: ${message}\nAssistant:`;

    // Generate response using Llama 3.3
    const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      prompt,
      stream: false,
      max_tokens: 256
    });

    const reply = response?.response || "I'm not sure yet!";

    // Save assistant response
    history.push({ role: "assistant", text: reply });
    await this.setState("conversation", history);

    // Send streamed response to client
    this.sendToClient({ type: "message", text: reply });

    // Schedule background reminder task
    await this.schedule({ name: "reminder", runAt: Date.now() + 60_000 });

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
