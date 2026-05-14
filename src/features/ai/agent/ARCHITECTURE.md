# Agent Architecture

## Overview

The agent is a LangGraph-powered conversational AI wired into the WhatsApp inbound message pipeline. It handles intent detection, tool execution, and multi-turn memory. When a user asks about room availability, the agent hands off to the existing hospitality workflow engine rather than handling the booking flow itself.

---

## High-Level Request Flow

```
WhatsApp inbound message
        │
        ▼
WhatsAppService.handleWebhook()
        │
        ▼
BullMQ queue: "message-debounce"
  (10s window — buffers rapid messages from same conversation)
        │
        ▼
MessageDebounceProcessor
  1. Combines buffered messages into one string
  2. Calls agentService.processMessage(text, ctx)
  3. If reply starts with "FLOW:" → sendAvailabilityResultFlow()
  4. Otherwise         → sendAgentReply() (plain WhatsApp text)
```

---

## LangGraph State Machine

```
                   ┌──────────────────────┐
  START ─────────► │   intent_detector    │
                   │   AI_FAST_MODEL      │
                   │   sees full history  │
                   └──────────┬───────────┘
                              │ intent label
               ┌──────────────┴──────────────┐
               │ TOOL_INTENTS                │ other intents
               │ booking / cancellation      │ greeting / faq /
               │ status / payment            │ complaint / support
               │                             │ handoff / other
               ▼                             ▼
  ┌────────────────────┐         ┌───────────────────────┐
  │    tool_caller     │◄─loop   │       responder       │
  │ AI_PRIMARY_MODEL   │         │   AI_PRIMARY_MODEL    │
  │    tools bound     │         │       final reply     │
  └─────────┬──────────┘         └───────────────────────┘
            │                                ▲
            │ execute tool calls             │
            │ ToolMessage results            │
            │                               route here
            ├── FLOW: in result?            when no more
            │       │                       tool_calls
            │    YES: add AIMessage(FLOW:)
            │         skip responder ───────────────────► END
            │
            └── NO: loop back to tool_caller (more tools?)
                    or route to responder (no tool_calls)
```

---

## Agent State

```typescript
{
  messages:   BaseMessage[]   // full conversation history (reduced by messagesStateReducer)
  intent:     string          // last classified intent
  businessId: string          // from AgentContext
  phone:      string          // customer WhatsApp number
  leadId?:    string          // Prisma lead_id if available
}
```

State is persisted per conversation via **PostgresSaver** (LangGraph checkpointer).
`thread_id = conversationId` (from the WhatsApp conversation record).

---

## Nodes

Model selection is configured through environment variables:
`AI_PRIMARY_MODEL`, `AI_FAST_MODEL`, `AI_TOOL_FALLBACK_MODEL`, `AI_SUMMARY_MODEL`, and
`AI_EMBEDDING_MODEL`. `OPENAI_BASE_URL` can point the same client at an OpenAI-compatible
gateway/provider when you want to test non-default model backends without changing node code.

### `intent_detector`
- Model: `AI_FAST_MODEL` (defaults to `gpt-4o-mini` for fast, cheap classification)
- Sees full message history
- Returns one of: `booking`, `cancellation`, `status`, `complaint`, `support`, `faq`, `payment`, `handoff`, `greeting`, `other`
- Ambiguous / low-confidence → `handoff`

### `tool_caller`
- Model: `AI_PRIMARY_MODEL`, temperature 0, all tools bound
- Fallback: `AI_TOOL_FALLBACK_MODEL` if the primary model fails temporarily
- Two responsibilities per turn:
  1. **Execute** any pending `tool_calls` from the previous AIMessage
  2. **Decide** what tool to call next (or hand off to responder)
- Uses a directive-heavy system prompt: "You MUST call a tool — do not respond with plain text"
- Short-circuits to END when a tool returns a `FLOW:` signal (no responder call needed)

### `responder`
- Model: `AI_PRIMARY_MODEL`, temperature 0.3
- Summaries use `AI_SUMMARY_MODEL`
- Generates the final user-facing reply
- Passes `FLOW:` signals through unchanged (does not call LLM if last message is already `FLOW:`)

---

## Tools

| Tool | Intent(s) | Factory | Description |
|---|---|---|---|
| `check_availability` | booking | `makeCheckAvailabilityTool(inventoryService)` | Validates dates via chrono-node, checks inventory. If rooms found → returns `FLOW:{businessId,checkIn,checkOut}`. If none → returns text. |
| `cancel_booking` | cancellation | `makeCancelBookingTool(inventoryService, prisma)` | Looks up latest active booking by phone, cancels it |
| `get_booking` | status | static stub | Booking lookup by ID / phone |
| `get_payment` | payment | static stub | Payment / invoice lookup |
| `faq_search` | faq | RAG-backed | Searches business FAQ/docs uploaded by the tenant |
| `handoff` | handoff | static stub | Returns escalation message |

All stateful tools use the **factory pattern** — NestJS services are captured in the closure at module init, so `@Inject` is never used inside tools.

---

## FLOW: Signal — Handoff to Workflow Engine

When `check_availability` finds available rooms it returns a sentinel string instead of plain text:

```
FLOW:{"businessId":"...","checkIn":"2026-03-25","checkOut":"2026-03-28"}
```

This propagates through the graph unchanged (`tool_caller` short-circuits, `responder` passes it through). The debounce processor detects the prefix and calls:

```
WhatsAppService.sendAvailabilityResultFlow(phoneNumberId, phone, businessId, { checkIn, checkOut })
        │
        ▼
HospitalityFlowService.checkAvailability()   ← single source of truth
        │   fetches rooms from Postgres
        │   fetches images, resizes via sharp (<100KB)
        │   builds NavigationList (available_services)
        ▼
Meta WhatsApp API
        flow_action: 'navigate'
        screen:      'AVAILABILITY_RESULT'
        data:        { available_services, check_in, check_out, nights }
        │
        ▼
User sees WhatsApp Flow with room cards
        │
        ▼ (user taps a room)
Existing data_exchange flow handles the rest:
  AVAILABILITY_RESULT → ROOM_DETAIL → BOOKING_FORM → CONFIRMATION → PAYMENT
```

Fallback: if no hospitality flow is found in MongoDB, a plain text room list is sent instead.

---

## Natural Language Date Handling

Two-layer approach so dates like "today", "tomorrow", "25", "27,28", "next friday" always resolve:

1. **LLM layer** — system prompt injects `Today's date` and instructs the LLM to resolve dates to `YYYY-MM-DD` before calling tools
2. **Safety net** — `resolveDate()` in `src/features/agent/utils/date-resolver.ts` uses `chrono-node` inside the tool itself; valid ISO dates pass through unchanged

---

## Multi-Turn Memory

```
PostgresSaver (LangGraph checkpoint)
  connection: DATABASE_URL (SSL rejectUnauthorized: false for Render)
  thread_id:  conversationId

Full message history is stored and replayed on every turn.
The debounce 10s window means multiple rapid messages are merged
into a single agent invocation before the checkpoint is written.
```

---

## Module Dependency Graph

```
AppModule
└── WhatsAppModule
      ├── AgentModule                       ← no back-dep on WhatsApp (avoids circular)
      │     ├── InventoryModule
      │     └── PrismaModule
      │
      ├── WhatsAppFlowsModule               ← exports WhatsAppFlowsService, HospitalityFlowService
      │     └── InventoryModule
      │
      └── WhatsAppService
            ├── HospitalityFlowService      ← builds AVAILABILITY_RESULT screen data
            └── WhatsAppFlowsService        ← finds metaFlowId from MongoDB whatsapp_flows
```

---

## Key Files

| Layer | File |
|---|---|
| NestJS service / entry point | `src/features/agent/agent.service.ts` |
| LangGraph graph wiring | `src/features/agent/graph/agent-graph.ts` |
| State definition | `src/features/agent/graph/agent-state.ts` |
| Intent classifier | `src/features/agent/nodes/intent-detector.node.ts` |
| Tool executor | `src/features/agent/nodes/tool-caller.node.ts` |
| Final reply generator | `src/features/agent/nodes/responder.node.ts` |
| System prompt | `src/features/agent/prompts/system.prompt.ts` |
| Tool registry | `src/features/agent/tools/index.ts` |
| Date resolver utility | `src/features/agent/utils/date-resolver.ts` |
| Debounce processor | `src/features/whatsapp/processors/message-debounce.processor.ts` |
| Flow trigger | `src/features/whatsapp/whatsapp.service.ts` → `sendAvailabilityResultFlow()` |
| Screen builder | `src/features/whatsapp-flows/hospitality-flow.service.ts` → `checkAvailability()` |
| Flow lookup | `src/features/whatsapp-flows/whatsapp-flows.service.ts` → `findHospitalityFlowId()` |
