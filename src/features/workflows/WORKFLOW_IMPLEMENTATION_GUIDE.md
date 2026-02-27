# Workflow waitForInput Implementation Guide

## Overview
The `waitForInput` feature allows workflows to pause execution when waiting for user responses (menu selections, button clicks, text input, etc.) and resume when the user provides input.

## How It Works

### 1. **Workflow Pauses Automatically**
When a node that requires user input is executed (e.g., `action.send_message_withmenu`), the workflow:
- Sets `waitForInput = true`
- Saves the current node ID
- Calls the `onPause` callback to persist state
- Stops execution (doesn't traverse to next node)

### 2. **State is Persisted**
You need to store the workflow execution state in your database so it can be resumed later.

### 3. **User Provides Input**
When the user responds (via WhatsApp, Instagram, etc.), you:
- Load the saved workflow state
- Call `workflow.resume(userInput)` with the user's response
- Workflow continues from where it paused

## Implementation Example

### Step 1: Create a WorkflowExecution table in Prisma

```prisma
model WorkflowExecution {
  id              String   @id @default(uuid())
  workflowId      String
  userId          String
  channel         String   // 'whatsapp' or 'instagram'
  currentNodeId   String?
  context         Json     @default("{}")
  waitingForInput Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, channel, workflowId])
  @@index([userId, channel, waitingForInput])
}
```

### Step 2: Update WorkflowsService to handle state persistence

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Workflow } from './core/workflow';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start a new workflow execution
   */
  async startWorkflow(
    workflowId: string,
    userId: string,
    channel: 'whatsapp' | 'instagram',
    triggerData: any
  ) {
    const workflow = new Workflow();
    workflow.init(this.getWorkflowDefinition(workflowId));

    // Set up the pause callback to save state
    workflow.onPause = async (state) => {
      await this.saveExecutionState(userId, channel, state);
    };

    // Start execution
    await workflow.execute(triggerData);

    return workflow.getExecutionState();
  }

  /**
   * Resume a paused workflow with user input
   */
  async resumeWorkflow(
    userId: string,
    channel: 'whatsapp' | 'instagram',
    userInput: any
  ) {
    // Find the paused workflow execution
    const execution = await this.prisma.workflowExecution.findFirst({
      where: {
        userId,
        channel,
        waitingForInput: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!execution) {
      this.logger.warn(`No paused workflow found for user ${userId}`);
      return null;
    }

    // Restore the workflow
    const workflow = new Workflow();
    workflow.init(this.getWorkflowDefinition(execution.workflowId));
    workflow.restoreState({
      currentNodeId: execution.currentNodeId,
      context: execution.context,
      waitingForInput: execution.waitingForInput,
    });

    // Set up the pause callback
    workflow.onPause = async (state) => {
      await this.saveExecutionState(userId, channel, state);
    };

    // Resume with user input
    await workflow.resume(userInput);

    // If workflow is no longer waiting, mark as completed
    if (!workflow.waitForInput) {
      await this.prisma.workflowExecution.updateMany({
        where: { id: execution.id },
        data: { waitingForInput: false },
      });
    }

    return workflow.getExecutionState();
  }

  /**
   * Save workflow execution state to database
   */
  private async saveExecutionState(
    userId: string,
    channel: 'whatsapp' | 'instagram',
    state: any
  ) {
    await this.prisma.workflowExecution.upsert({
      where: {
        userId_channel_workflowId: {
          userId,
          channel,
          workflowId: state.workflowId,
        },
      },
      create: {
        workflowId: state.workflowId,
        userId,
        channel,
        currentNodeId: state.currentNodeId,
        context: state.context,
        waitingForInput: state.waitingForInput,
      },
      update: {
        currentNodeId: state.currentNodeId,
        context: state.context,
        waitingForInput: state.waitingForInput,
        updatedAt: new Date(),
      },
    });
  }

  private getWorkflowDefinition(workflowId: string) {
    // Return your workflow definition
    return this.workflowDefinition; // Your existing workflow definition
  }
}
```

### Step 3: Integrate with WhatsApp/Instagram message handler

```typescript
// In your WhatsApp controller or service
async handleIncomingMessage(message: any, userId: string) {
  const channel = 'whatsapp';

  // Check if there's a paused workflow waiting for input
  const hasWaitingWorkflow = await this.prisma.workflowExecution.findFirst({
    where: {
      userId,
      channel,
      waitingForInput: true,
    },
  });

  if (hasWaitingWorkflow) {
    // Resume the workflow with user's message
    await this.workflowsService.resumeWorkflow(
      userId,
      channel,
      message.text || message.selection
    );
  } else {
    // Start a new workflow
    await this.workflowsService.startWorkflow(
      'workflow_1',
      userId,
      channel,
      { userInfo: { id: userId }, message }
    );
  }
}
```

## Node Types That Wait for Input

The following node types automatically pause workflow execution:

- `action.send_message_withmenu` - Waits for menu selection
- `action.send_message_with_btns` - Waits for button click
- `action.send_catalog` - Waits for catalog item selection
- `action.send_payment` - Waits for payment confirmation
- `action.wait_for_text` - Waits for text message
- `action.wait_for_image` - Waits for image upload
- `action.wait_for_location` - Waits for location share

You can add more in the `shouldWaitForInput()` method in [workflow.ts](./core/workflow.ts).

## Flow Example

```
User sends message → Start workflow
  ↓
Execute trigger node
  ↓
Execute send_message_withmenu node
  ↓
🛑 PAUSE (waitForInput = true)
  ↓ State saved to DB

[User sees menu and clicks option]

User clicks option → Resume workflow
  ↓ Load state from DB
  ↓ Call workflow.resume(selectedOption)
  ↓
Continue to next node based on selection
  ↓
Execute next node...
```

## Testing

```typescript
// Test pausing
const workflow = new Workflow();
workflow.init(workflowDef);
workflow.onPause = async (state) => {
  console.log('Workflow paused:', state);
};

await workflow.execute({ userInfo: { name: 'Test' } });
console.log('Waiting for input:', workflow.waitForInput); // true

// Test resuming
await workflow.resume('option_1');
console.log('Waiting for input:', workflow.waitForInput); // false (if no more input needed)
```

## Important Notes

1. **One workflow per user per channel**: Only one workflow should be active at a time per user/channel
2. **Timeout handling**: Consider adding a TTL or cleanup job for old paused workflows
3. **Context preservation**: The entire workflow context is saved, so variables persist across resume
4. **Error handling**: Handle cases where user sends unexpected input
5. **Validation**: Validate user input against expected options (menu items, button IDs, etc.)

## API Methods Reference

### Workflow Class

#### `execute(triggerData: any): Promise<any>`
Starts workflow execution from the trigger node.

#### `resume(userInput: any): Promise<void>`
Resumes a paused workflow with user input. Throws error if workflow is not waiting for input.

#### `getExecutionState()`
Returns current workflow state (workflowId, currentNodeId, context, waitingForInput).

#### `restoreState(state: any)`
Restores workflow to a previous state.

#### `onPause?: (state: any) => Promise<void>`
Callback function called when workflow pauses. Use this to save state to database.

### Properties

- `waitForInput: boolean` - Whether workflow is currently waiting for user input
- `currentNodeId: string | null` - ID of the current/paused node
- `context: any` - Workflow execution context (variables, user data, etc.)

## Example: Complete Integration

```typescript
// workflows.service.ts
@Injectable()
export class WorkflowsService {
  async executeWorkflowForUser(userId: string, channel: string, triggerData: any) {
    // Check if there's already a waiting workflow
    const existingExecution = await this.prisma.workflowExecution.findFirst({
      where: { userId, channel, waitingForInput: true },
    });

    if (existingExecution) {
      // Resume existing workflow
      return this.resumeWorkflow(userId, channel, triggerData);
    } else {
      // Start new workflow
      return this.startWorkflow('workflow_1', userId, channel, triggerData);
    }
  }
}

// whatsapp.controller.ts
@Post('webhook')
async handleWebhook(@Body() body: any) {
  const message = body.entry[0].changes[0].value.messages[0];
  const userId = message.from;

  await this.workflowsService.executeWorkflowForUser(
    userId,
    'whatsapp',
    {
      userInfo: { id: userId },
      message: message.text?.body || message.interactive?.button_reply?.id,
    }
  );
}
```
