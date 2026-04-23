# PROMPTS.md — Output Format Control

Enforces structured output. LLMs tend toward walls of text — this counteracts that.

---

## Core Format Rule

**Every response MUST use structured formatting:**
- Bullet points by default
- Double line breaks between items
- Headers for sections
- Never more than 3 sentences without a line break

---

## Negative Constraints (Critical)

Add these to prompt END for maximum effect:

```
CRITICAL FORMATTING RULES:
- Do NOT write paragraphs or walls of text
- Do NOT put more than 2 sentences together
- Do NOT skip line breaks between points
- ALWAYS use bullets for lists
- ALWAYS add blank line after each bullet
```

---

## Format Templates

### For Explanations

```
**[Topic]**

• [Key point 1]

• [Key point 2]

• [Key point 3]

**Bottom line:** [One sentence summary]
```

### For Lists

```
**[List Title]**

1. [First item]

2. [Second item]

3. [Third item]
```

### For Step-by-Step

```
**How to [Action]**

Step 1: [First step]

Step 2: [Second step]

Step 3: [Third step]
```

### For Comparisons

```
**[Option A] vs [Option B]**

| [Option A] | [Option B] |
| [Point 1] | [Point 1] |

| [Point 2] | [Point 2] |
```

---

## Few-Shot Examples

### Example 1: Simple Question

**Bad Output (wall of text):**
```
This is a large language model that uses a Mixture of Experts architecture which allows it to be very efficient while maintaining high performance across many different tasks and the model has been trained on a massive dataset of over 28 trillion tokens making it one of the most capable models available today for reasoning and technical tasks.
```

**Good Output (structured):**
```
**Model Overview**

• Mixture of Experts architecture

• Trained on 28T+ tokens

• Strong at reasoning and technical tasks

• Efficient despite massive size

**Bottom line:** High-performance model with efficient MoE design.
```

---

### Example 2: How-To Request

**Bad Output:**
```
To fix the formatting issue you should first check your prompt structure and make sure you're putting the formatting rules at the end of your prompt because models have recency bias and then you should add negative constraints that tell the model what NOT to do and finally consider lowering the temperature to make the model more literal.
```

**Good Output:**
```
**How to Fix Formatting**

Step 1: Put format rules at prompt END

Step 2: Add negative constraints ("Do NOT...")

Step 3: Lower temperature (0.1-0.3)

Step 4: Use empty templates

**Why it works:** Models prioritize the last thing they read.
```

---

### Example 3: Comparison

**Bad Output:**
```
The main difference between structured outputs and regular outputs is that structured outputs use constrained decoding which guarantees the output matches a schema while regular outputs just generate text freely based on probability and structured outputs are more reliable for APIs but regular outputs are better for creative tasks.
```

**Good Output:**
```
**Structured vs Regular Outputs**

| Structured | Regular |
| Constrained decoding | Free generation |
| Schema-guaranteed | Probability-based |
| Best for APIs | Best for creative |
| 100% reliable | Needs validation |
```

---

## Prompt Engineering Techniques

### 1. Delimiter Method

Use `###` or `---` to separate instructions from content:

```
### INSTRUCTIONS
[Format rules here]

### CONTENT
[Your actual question/request here]

### FORMAT (CRITICAL)
- Use bullets
- Double line breaks
```

### 2. Empty Template Method

End prompt with incomplete structure:

```
Summarize this using this format:

• [Main point]

• [Supporting point]

• [Conclusion]

Summary:
```

### 3. Format Priming

Start assistant's response:

```
[User message ends with]

Response:
• 
```

The model feels pressure to continue the bullet.

---

## Temperature Settings

| Task | Temperature | Why |
|------|-------------|-----|
| Structured output | 0.1 - 0.3 | Literal, follows rules |
| Q&A / Facts | 0.3 - 0.5 | Consistent accuracy |
| Creative writing | 0.7 - 1.0 | More variety |

**For structured output:** Use 0.2 max

---

## Quick Reference

**Before every response, check:**
- [ ] Is it bullet-pointed?
- [ ] Double line breaks between items?
- [ ] Headers used for sections?
- [ ] No paragraph longer than 3 sentences?

**If failing:** Add negative constraints to prompt END.

---

_This file is the formatting enforcement layer. Update as you learn what works._
