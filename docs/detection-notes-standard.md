# Detection Notes Standard

## Core requirements

Detection guidance must name at least one concrete, observable field value: a status code, hexadecimal access mask, encryption type, port, timeout threshold, registry path, or equivalent. Explain why that exact value signals an attack technique rather than normal activity, and state the correlation or response step. Do not rely on generic advice such as "investigate unusual accounts".

## Positive examples

### Event 4768

Pre-Authentication Type = 0 for an account outside the reviewed exception list makes T1558.004 AS-REP Roasting possible: an attacker can request a TGT without a password and crack its encrypted portion offline. Alert on every non-exempt occurrence. In an AES-only domain, 0x17 (RC4) or DES is independently suspicious because it weakens offline cracking resistance. A burst of Failure Code 0x6 against distinct account names from one source is a T1110.003 password-spraying or enumeration precursor; correlate it with 4625 and 4771.

### Event 4794

4794 can expose a specific T1098/T1556 persistence technique: an attacker with domain-admin rights sets the DSRM password with ntdsutil and changes HKLM\\System\\CurrentControlSet\\Control\\Lsa\\DsrmAdminLogonBehavior to 1 or 2. A non-zero value permits the built-in DSRM local administrator to authenticate over the network to the domain controller. That local SAM account survives ordinary domain-password resets and some domain-account containment steps. Treat an unexpected 4794 as active persistence: verify the operator and change ticket, then inspect DsrmAdminLogonBehavior immediately. A non-zero unapproved value is a likely backdoor, not configuration drift.

## Negative example

Before revision, Event 4740 said: "Correlate 4740 with preceding 4625 and 4776 activity by account and caller computer. Escalate lockouts affecting privileged accounts, multiple accounts from one source, or lockouts followed by successful access." It names no field value, lockout threshold, or distinction between policy noise and an attack.

## Self-check

- Does the note include at least one concrete number, status code, hexadecimal mask, port, timeout threshold, or registry path?
- Does it explain why that exact value indicates an attack rather than normal activity?
- Could the text before any trailing ATT&CK reference be turned directly into a detection rule?
- Does it identify the ATT&CK technique and a useful follow-on correlation or response?
