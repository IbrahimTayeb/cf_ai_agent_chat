import { Workflow } from "agents";

export class ReminderWorkflow extends Workflow {
  async run() {
    console.log("ReminderWorkflow triggered!");
    // You could send a push notification or summary email here
  }
}
