# Task Registry
*Last Updated: May 17, 2025*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T13 | Implement Memory Bank CLI | 🔄 | HIGH | 2025-05-17 | T12 | [Details](tasks/T13.md) |
| T12 | Rewrite Documentation for Practical Usage | 🔄 | HIGH | 2025-05-17 | T11 | [Details](tasks/T12.md) |
| T11 | Document GitHub Project Integration | 🔄 | HIGH | 2025-05-17 | - | [Details](tasks/T11.md) |

| T9 | Implement Rules v6.2 Changes | 🔄 | HIGH | 2025-04-30 | T7, T8 | [Details](tasks/T9.md) |
| T8 | Add KIRS Principle | 🔄 | HIGH | 2025-04-25 | - | [Details](tasks/T8.md) |
| T1 | Multi-task Support | 🔄 | HIGH | 2025-04-14 | - | [Details](tasks/T1.md) |
| T3 | Implement DB Migration | 🔄 | HIGH | 2025-04-15 | T2 | [Details](tasks/T3.md) |
| T4 | Optimize Rules System | 🔄 | HIGH | 2025-04-15 | T1 | [Details](tasks/T4.md) |
| T5 | Optimize Rules v4 | 🔄 | MEDIUM | 2025-04-17 | - | [Details](tasks/T5.md) |

## Task Structure
All task details are now maintained in individual files under the `tasks/` directory.
See individual task files for:
- Detailed descriptions
- Completion criteria
- Related files
- Progress tracking
- Context and notes

## Completed Tasks
| ID | Title | Completed | Related Tasks | Archive |
|----|-------|-----------|---------------|---------|
| T10 | Clarify Directory Structure in Rules v6.3 | 2025-05-17 | T9 | [Details](tasks/T10.md) |
| T0 | Initial Memory Bank setup | 2025-04-10 | - | [Details](archive/T0.md) |
| T2 | Plan Database Migration | 2025-04-15 | T3 | [Details](archive/T2.md) |
| T6 | Streamline Rules v6 | 2025-04-20 | T5 | [Details](archive/T6.md) |
| T7 | Fix Rules v6 Ambiguities | 2025-04-20 | T6 | [Details](archive/T7.md) |

## Task Relationships
```mermaid
graph TD
    T0[T0: Initial Setup]
    T1[T1: Multi-task Support]
    T2[T2: Plan DB Migration]
    T3[T3: Implement DB Migration]
    T4[T4: Rules System]
    T5[T5: Rules v4]
    T6[T6: Rules v6]
    T7[T7: Rules v6 Fix]
    T8[T8: KIRS]
    T9[T9: Rules v6.2]
    T10[T10: Dir Structure v6.3]
    T11[T11: GitHub Integration Doc]
    T12[T12: Practical Docs Rewrite]
    T13[T13: Memory Bank CLI]

    T0 --> T1
    T11 --> T12
    T12 --> T13
    T0 --> T2
    T2 --> T3
    T1 --> T4
    T1 --> T5
    T5 --> T6
    T6 --> T7
    T7 --> T9
    T8 --> T9
    T9 --> T10
    T10 --> T11
```