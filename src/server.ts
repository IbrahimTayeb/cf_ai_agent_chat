import { AgentNamespace } from "agents";
import { MyAgent } from "./agents/MyAgent";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const ns = new AgentNamespace(env.MyAgent, env, ctx);
    return ns.handleRequest(request);
  }
};
