# Detection Notes Standard

## Core requirements

Detection guidance must name at least one concrete, observable field value: a status code, hexadecimal access mask, encryption type, port, timeout threshold, registry path, or equivalent. Explain why that exact value signals an attack technique rather than normal activity, and state the correlation or response step. Do not rely on generic advice such as "investigate unusual accounts".

## Positive examples

### Event 4768

PreAuthType 0 for an account outside the reviewed exception list makes T1558.004 AS-REP Roasting possible because a requester can obtain material for offline password cracking without proving knowledge of the password. In an AES-only domain, TicketEncryptionType 0x17 RC4 is an additional compatibility deviation. A burst of ResultCode 0x6 across distinct account names from one client supports account-enumeration triage, not a password-spraying verdict, because the named principal was not found.

### Event 4794

T1098 Account Manipulation applies when an unauthorized operator attempts to set the Directory Services Restore Mode administrator password. Treat one unexpected 4794 on a domain controller as high priority: Status 0x0 means the operation succeeded, so confirm SubjectUserName, SubjectLogonId, and Workstation against an approved recovery-maintenance change; nonzero status values still warrant review as attempted access.

## Negative example

Before revision, Event 4740 said: "Correlate 4740 with preceding 4625 and 4776 activity by account and caller computer. Escalate lockouts affecting privileged accounts, multiple accounts from one source, or lockouts followed by successful access." It names no field value, lockout threshold, or distinction between policy noise and an attack.

## Self-check

- Does the note include at least one concrete number, status code, hexadecimal mask, port, timeout threshold, or registry path?
- Does it explain why that exact value indicates an attack rather than normal activity?
- Could the text before any trailing ATT&CK reference be turned directly into a detection rule?
- Does it identify the ATT&CK technique and a useful follow-on correlation or response?
- If no ATT&CK technique directly applies, does it explicitly say so and explain why the tempting mapping would be inaccurate?
