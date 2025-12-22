# Windows 365 Planning Guide

> ⚠️ **DISCLAIMER:** This is an unofficial community guide and is NOT an official Microsoft document. The information provided is for educational purposes only. Always refer to [official Microsoft documentation](https://learn.microsoft.com/windows-365/) for the most current and authoritative guidance.

A successful Windows 365 deployment starts with planning. This guide helps you plan your move or adoption of Windows 365 as your Cloud PC solution.

![Planning Steps Diagram](https://img.shields.io/badge/7%20Steps-Planning%20Guide-0078D4?style=for-the-badge)

Windows 365 gives organizations options to do what's best for them and their users. You can provision Cloud PCs that stream a full Windows desktop experience from the Microsoft Cloud to any device, anywhere.

This guide:

- Lists and describes common objectives for Cloud PC deployment
- Lists potential licensing needs
- Provides guidance on identity and network configuration
- Recommends reviewing current infrastructure
- Gives examples of creating a rollout plan
- And more

Use this guide to plan your Windows 365 deployment.

> 💡 **Tip**
> - Want to print or save this guide as a PDF? In your web browser, use the Print option, Save as PDF.
> - This guide is a living document. Be sure to add or update tips and guidance you've found helpful.

---

## Table of Contents

- [Step 1 - Determine your objectives](#step-1---determine-your-objectives)
- [Step 2 - Inventory your requirements](#step-2---inventory-your-requirements)
- [Step 3 - Determine costs and licensing](#step-3---determine-costs-and-licensing)
- [Step 4 - Review existing infrastructure](#step-4---review-existing-infrastructure)
- [Step 5 - Create a rollout plan](#step-5---create-a-rollout-plan)
- [Step 6 - Communicate changes](#step-6---communicate-changes)
- [Step 7 - Support help desk and end users](#step-7---support-help-desk-and-end-users)

---

## Step 1 - Determine your objectives

Organizations use Windows 365 to provide secure, personalized Windows desktops to their workforce. When evaluating Windows 365, look at what the goal is and what you want to achieve.

In this section, we discuss common objectives or scenarios when using Windows 365.

### Objective: Enable flexible and remote work

Users expect to work from anywhere, on any device, with a consistent Windows experience. With Windows 365, you can:

- Stream a full Windows 11 desktop to any device
- Access Cloud PCs from Windows, Mac, iOS, Android, or web browsers
- Maintain the same desktop experience whether at home, office, or traveling
- Support hybrid work scenarios seamlessly

✅ **Task: Identify your remote work requirements**

These are the scenarios you want to enable. Some considerations:

- **Geographic distribution**: Where are your users located? Consider Azure region proximity for optimal performance.
- **Device diversity**: What devices do your users have? Cloud PCs can be accessed from virtually any device with a modern browser.
- **Connectivity**: What are your users' internet connection capabilities? Windows 365 requires stable connectivity but works well even on moderate bandwidth.
- **Offline needs**: Do users need to work without internet? Windows 365 Offline (preview) enables limited offline scenarios.

> 💡 Many organizations start with Windows 365 for specific use cases like contractors, remote workers, or BYOD scenarios before expanding to broader deployment.

### Objective: Simplify desktop management

Traditional desktop management requires significant IT overhead for hardware procurement, imaging, patching, and troubleshooting. Windows 365 simplifies this:

- **No hardware lifecycle management** for Cloud PCs
- **Unified management** through Microsoft Intune
- **Simplified provisioning** - new Cloud PCs in minutes, not days
- **Consistent configurations** across all Cloud PCs

✅ **Task: Assess your current desktop management burden**

Some considerations:

- How much time does your IT team spend on desktop hardware issues?
- How long does it take to provision a new desktop for a user?
- What is your current patch compliance rate?
- How many different desktop configurations do you maintain?

### Objective: Enhance security posture

When data is stored in the cloud rather than on local devices, it's inherently more secure. Windows 365 helps protect your organization:

- **Data never leaves the cloud** - only pixels are streamed to devices
- **Zero Trust ready** - integrates with Conditional Access and Microsoft Defender
- **Centralized security controls** - manage security from a single pane of glass
- **Reduced data loss risk** - lost or stolen devices don't contain corporate data

✅ **Task: Determine your security requirements**

Some considerations:

- **Conditional Access**: What conditions should be met before users can access their Cloud PC? Consider device compliance, location, and risk level.
- **Multi-factor authentication (MFA)**: MFA should be required for all Cloud PC access.
- **Endpoint protection**: Microsoft Defender for Endpoint can protect your Cloud PCs just like physical devices.
- **Data Loss Prevention (DLP)**: Consider policies to prevent sensitive data from being copied out of the Cloud PC.
- **Screen capture protection**: For highly sensitive environments, you can disable screenshots and screen sharing.

### Objective: Support specialized workloads

Some workloads require specific configurations or have unique requirements:

- **Contractors and temporary workers**: Quick provisioning and deprovisioning
- **Developers**: Powerful Cloud PCs for development environments
- **Frontline workers**: Shared Cloud PCs for shift workers
- **Secure workloads**: Isolated environments for sensitive data access

✅ **Task: Identify specialized workload requirements**

Some considerations:

- What user personas exist in your organization?
- What applications do each persona need?
- What compute resources (CPU, RAM, storage) does each workload require?
- Are there compliance or regulatory requirements for specific workloads?

### Objective: Reduce total cost of ownership

Windows 365 can reduce costs through:

- **Predictable per-user-per-month pricing**
- **Eliminated hardware refresh cycles**
- **Reduced IT management overhead**
- **No data center infrastructure required**

✅ **Task: Calculate your current desktop costs**

Document your current costs:

| Cost Category | Current Annual Cost |
|--------------|---------------------|
| Hardware procurement | $ |
| Hardware maintenance | $ |
| Software licensing | $ |
| IT personnel (desktop support) | $ |
| Data center (power, cooling, space) | $ |
| VDI infrastructure (if applicable) | $ |
| **Total** | **$** |

---

## Step 2 - Inventory your requirements

Organizations have diverse requirements for their Cloud PC deployment. This section helps you inventory the key considerations.

### User personas and sizing

Different users have different compute needs. Windows 365 offers various SKUs:

| SKU | vCPU | RAM | Storage | Best For |
|-----|------|-----|---------|----------|
| Basic | 2 | 4 GB | 64 GB | Light users, task workers, kiosk scenarios |
| Standard | 2 | 8 GB | 128 GB | Knowledge workers, general productivity |
| Premium | 4 | 16 GB | 128 GB | Power users, multitaskers |
| Advanced | 8 | 32 GB | 512 GB | Developers, data analysts, graphics work |

✅ **Task: Map your users to Cloud PC sizes**

Create a user persona inventory:

| Persona | User Count | Primary Applications | Recommended SKU |
|---------|------------|---------------------|-----------------|
| Example: Knowledge Worker | 500 | M365 Apps, Teams, Browser | Standard (2vCPU/8GB) |
| Example: Developer | 50 | Visual Studio, Docker | Advanced (8vCPU/32GB) |
| | | | |

### Windows 365 editions

Choose the right edition for your organization:

#### Windows 365 Enterprise

**Best for**: Organizations with Microsoft 365 E3/E5 or existing Intune infrastructure

| Feature | Details |
|---------|---------|
| Prerequisites | Microsoft 365 E3/E5 or Windows E3/E5 + Intune |
| User limit | Unlimited |
| Management | Full Intune integration |
| Network options | Microsoft Hosted Network or Azure Network Connection |
| Custom images | ✅ Supported |
| Hybrid join | ✅ Supported |
| Provisioning policies | ✅ Granular control |

#### Windows 365 Business

**Best for**: Small to medium businesses without Intune

| Feature | Details |
|---------|---------|
| Prerequisites | None beyond Windows 365 license |
| User limit | 300 users |
| Management | Simplified web portal (windows365.microsoft.com) |
| Network options | Microsoft Hosted Network only |
| Custom images | ❌ Not supported |
| Hybrid join | ❌ Not supported |
| Provisioning | ✅ Self-service |

#### Windows 365 Frontline

**Best for**: Shift workers with non-concurrent usage patterns

| Feature | Details |
|---------|---------|
| Licensing model | 3:1 ratio (one license serves 3 users) |
| Use case | Shift workers, retail, manufacturing |
| Concurrency | Maximum 1 active session per license |
| Management | Full Intune integration |

✅ **Task: Determine which edition(s) you need**

Consider:

- Do you have existing Microsoft 365 E3/E5 licensing?
- Do you use Microsoft Intune today?
- Do you need hybrid identity (on-premises AD integration)?
- Do you need custom images?
- Do you have shift workers who could share Cloud PCs?

### Identity requirements

Windows 365 supports two identity models:

#### Microsoft Entra ID Join (Cloud-only)

**Recommended for**: New deployments, cloud-first organizations

| Aspect | Details |
|--------|---------|
| Prerequisites | Microsoft Entra ID |
| On-premises AD | Not required |
| Network connection | Microsoft Hosted Network supported |
| Authentication | Modern authentication, passwordless ready |
| Group Policy | Not applicable (use Intune) |
| Best for | Cloud-native organizations, new deployments |

#### Microsoft Entra Hybrid Join

**Recommended for**: Organizations with existing AD infrastructure

| Aspect | Details |
|--------|---------|
| Prerequisites | Microsoft Entra ID + on-premises AD + Azure AD Connect |
| On-premises AD | Required |
| Network connection | Azure Network Connection required |
| Authentication | Kerberos for legacy apps |
| Group Policy | Can coexist (transition to Intune recommended) |
| Best for | Legacy app requirements, existing AD investment |

✅ **Task: Determine your identity strategy**

Answer these questions:

- [ ] Do you have applications that require Kerberos authentication?
- [ ] Do you have an existing on-premises Active Directory?
- [ ] Are you willing/able to deploy Azure Network Connection?
- [ ] Do you have existing Group Policies you need to maintain?
- [ ] Is your organization moving toward cloud-only identity?

**Decision guide**:

| If you answered... | Recommended identity |
|-------------------|---------------------|
| No to all questions | Microsoft Entra ID Join |
| Yes to Kerberos requirement | Hybrid Join |
| Yes to AD but moving to cloud | Start with Hybrid, plan migration |
| New/greenfield deployment | Microsoft Entra ID Join |

### Network requirements

#### Microsoft Hosted Network

**Recommended for**: Simplest deployment, no on-premises requirements

| Aspect | Details |
|--------|---------|
| Azure subscription | Not required |
| Setup complexity | None - Microsoft managed |
| On-premises access | Internet only (or via VPN client on Cloud PC) |
| DNS/DHCP | Microsoft managed |

#### Azure Network Connection (ANC)

**Recommended for**: Hybrid scenarios requiring on-premises access

| Aspect | Details |
|--------|---------|
| Azure subscription | Required |
| Setup complexity | Moderate - requires networking knowledge |
| On-premises access | Native through VNet peering/VPN/ExpressRoute |
| DNS/DHCP | Customer configurable |
| Hybrid join | Required for this identity type |

✅ **Task: Determine your network requirements**

Answer these questions:

- [ ] Do users need direct access to on-premises resources (file shares, legacy apps)?
- [ ] Can on-premises access be achieved through VPN client on the Cloud PC?
- [ ] Do you have an existing Azure subscription?
- [ ] Do you have networking expertise to configure Azure VNets?
- [ ] Are you using Hybrid Join identity?

**Decision guide**:

| Scenario | Recommended network |
|----------|-------------------|
| Cloud-only apps (M365, SaaS) | Microsoft Hosted Network |
| On-premises access via VPN client | Microsoft Hosted Network |
| Native on-premises access required | Azure Network Connection |
| Hybrid Join identity | Azure Network Connection |
| Fastest deployment | Microsoft Hosted Network |

---

## Step 3 - Determine costs and licensing

Windows 365 licensing is straightforward with predictable per-user-per-month pricing. However, there are prerequisites and additional services to consider.

### Licensing prerequisites

#### For Windows 365 Enterprise

| Requirement | Options |
|-------------|---------|
| Windows license | Microsoft 365 E3/E5, Microsoft 365 F3, Microsoft 365 A3/A5, Windows E3/E5, Microsoft 365 Business Premium |
| Intune license | Included in above, or standalone |
| Entra ID | P1 minimum (P2 recommended for Conditional Access) |

#### For Windows 365 Business

| Requirement | Options |
|-------------|---------|
| Prerequisites | None - all-inclusive licensing |
| Note | Cannot exceed 300 users |

#### For Windows 365 Frontline

| Requirement | Options |
|-------------|---------|
| Windows license | Microsoft 365 E3/E5 or Windows E3/E5 |
| Intune license | Included in above, or standalone |
| Usage pattern | Non-concurrent shift workers |

### Windows 365 SKU pricing

> ⚠️ Pricing is subject to change. Always verify current pricing at [microsoft.com/windows-365](https://www.microsoft.com/windows-365)

| Configuration | Typical monthly price (USD)* |
|--------------|------------------------------|
| 2 vCPU, 4 GB, 64 GB | ~$28 |
| 2 vCPU, 8 GB, 128 GB | ~$40 |
| 4 vCPU, 16 GB, 128 GB | ~$60 |
| 8 vCPU, 32 GB, 256 GB | ~$105 |
| 8 vCPU, 32 GB, 512 GB | ~$130 |

*Enterprise pricing. Business SKUs may differ. Frontline is approximately 1/3 the cost due to sharing model.

### Additional services to consider

| Service | Purpose | License |
|---------|---------|---------|
| Microsoft Defender for Endpoint | Advanced threat protection | M365 E5 or standalone |
| Windows Autopatch | Managed updates | M365 E3+ (included) |
| Universal Print | Cloud printing | M365 E3+ (included with limits) |
| Azure Network Connection | Hybrid connectivity | Azure subscription costs |

### Cost calculation example

**Scenario**: 500 knowledge workers + 50 developers + 200 frontline workers

| User Group | Count | SKU | Monthly/User | Monthly Total |
|------------|-------|-----|--------------|---------------|
| Knowledge Workers | 500 | 2vCPU/8GB | $40 | $20,000 |
| Developers | 50 | 8vCPU/32GB | $130 | $6,500 |
| Frontline (3:1) | 200 | 2vCPU/8GB Frontline | $13 | $2,600 |
| **Total** | **750** | | | **$29,100/month** |

Annual cost: **$349,200**

✅ **Task: Calculate your Windows 365 costs**

Create your cost estimate:

| User Group | Count | SKU | Monthly/User | Monthly Total |
|------------|-------|-----|--------------|---------------|
| | | | | |
| | | | | |
| | | | | |
| **Total** | | | | **$** |

---

## Step 4 - Review existing infrastructure

Before deploying Windows 365, assess your current environment and plan for integration.

### Current device management

✅ **Task: Assess your current management solution**

| Question | Your Answer |
|----------|-------------|
| What MDM/UEM solution do you use today? | |
| Do you use Microsoft Intune? | Yes / No / Partially |
| Do you use Configuration Manager? | Yes / No |
| Do you use Group Policy extensively? | Yes / No |
| How do you deploy applications today? | |

**Recommendations based on current state**:

| Current State | Recommendation |
|---------------|----------------|
| No MDM | Start fresh with Intune for Cloud PCs |
| Intune only | Seamless - use existing policies |
| ConfigMgr only | Consider co-management or Intune migration |
| ConfigMgr + Intune | Co-management works well |
| Third-party MDM | Plan migration to Intune for Cloud PCs |
| Group Policy heavy | Use Group Policy Analytics to migrate to Intune |

### Applications inventory

✅ **Task: Inventory applications that will run on Cloud PCs**

| Application | Deployment Method | Compatibility Notes |
|-------------|-------------------|---------------------|
| Microsoft 365 Apps | Gallery image or Intune | ✅ Fully supported |
| | | |
| | | |
| | | |

**Application deployment options**:

| Method | Best For | Notes |
|--------|----------|-------|
| Gallery image | M365 Apps included | Fastest deployment |
| Custom image | Core LOB apps | Reduces login time |
| Intune Win32 apps | Most applications | Flexible, manageable |
| Microsoft Store | Modern apps | Auto-updates |
| MSIX App Attach | Large apps, shared scenarios | Advanced scenario |

### Existing policies

✅ **Task: Document policies to migrate or create**

| Policy Type | Current Implementation | Windows 365 Approach |
|-------------|----------------------|----------------------|
| Security baseline | | Intune security baselines |
| Application control | | Intune app policies |
| Update management | | Windows Update for Business |
| Compliance requirements | | Intune compliance policies |
| Conditional Access | | Entra ID Conditional Access |

### Network readiness

✅ **Task: Verify network requirements**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Required endpoints accessible | ☐ | See [network requirements](https://learn.microsoft.com/windows-365/enterprise/requirements-network) |
| Bandwidth adequate | ☐ | Minimum 1.5 Mbps, recommend 5+ Mbps per user |
| Latency acceptable | ☐ | <100ms to Azure region |
| UDP 3478 allowed | ☐ | For RDP Shortpath (recommended) |
| Proxy compatible | ☐ | Some proxies may cause issues |

### Pilot group identification

✅ **Task: Identify pilot users**

Select 10-50 users for initial pilot:

| Criteria | Pilot User Characteristics |
|----------|---------------------------|
| Technical comfort | Mix of technical and non-technical |
| Locations | Representative of your geography |
| Use cases | Cover primary workload scenarios |
| Feedback willingness | Users who will provide honest feedback |
| Risk tolerance | Users who can tolerate some issues |

---

## Step 5 - Create a rollout plan

The next task is to plan how and when your users receive their Cloud PCs.

### Define success metrics

✅ **Task: Establish your success criteria**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| User satisfaction | >80% positive | Survey |
| Provisioning time | <30 minutes | Intune reporting |
| Help desk tickets | <5% of users/week | Ticket system |
| Login success rate | >99% | Azure AD logs |
| Application compatibility | >95% working | User feedback |
| Performance (latency) | <100ms | User experience monitoring |

### Phased rollout approach

We recommend a phased approach to minimize risk and incorporate learnings.

#### Phase 1: Proof of Concept (2-4 weeks)

| Activity | Duration | Participants |
|----------|----------|--------------|
| Environment setup | 1 week | IT team |
| Initial configuration | 1 week | IT team |
| Technical validation | 1-2 weeks | IT team (5-10 users) |
| Documentation | Ongoing | IT team |

**Goals**:
- Validate technical architecture
- Test provisioning process
- Verify core applications work
- Document initial findings

#### Phase 2: Pilot (4-6 weeks)

| Activity | Duration | Participants |
|----------|----------|--------------|
| Pilot deployment | 1 week | IT + early adopters (25-50 users) |
| Feedback collection | 2-3 weeks | Pilot users |
| Issue resolution | Ongoing | IT team |
| Process refinement | 1-2 weeks | IT team |

**Goals**:
- Validate user experience
- Identify and resolve issues
- Refine deployment process
- Train help desk

#### Phase 3: Broad deployment (8-12 weeks)

| Wave | Users | Timeline |
|------|-------|----------|
| Wave 1 | IT Department + Champions | Week 1-2 |
| Wave 2 | Early adopter departments | Week 3-4 |
| Wave 3 | General population (50%) | Week 5-8 |
| Wave 4 | Remaining users | Week 9-12 |

### Sample rollout timeline

| Phase | Week 1-2 | Week 3-4 | Week 5-6 | Week 7-8 | Week 9-10 | Week 11-12 |
|-------|----------|----------|----------|----------|-----------|------------|
| POC | IT team | | | | | |
| Pilot | | IT + Early adopters | | | | |
| Wave 1 | | | IT + Champions | | | |
| Wave 2 | | | | Sales, Marketing | | |
| Wave 3 | | | | | Engineering, Finance | |
| Wave 4 | | | | | | All remaining |

### Enrollment approach

✅ **Task: Determine how users will receive their Cloud PCs**

| Approach | Description | Best For |
|----------|-------------|----------|
| IT-provisioned | IT creates and assigns Cloud PCs | Most organizations |
| Self-service (Business) | Users provision own Cloud PC | Windows 365 Business |
| Automated provisioning | Cloud PCs created based on group membership | Large-scale deployment |

---

## Step 6 - Communicate changes

Change management relies on clear and helpful communications about upcoming changes. The goal is a smooth Windows 365 deployment with users aware of changes and benefits.

### Communication phases

✅ **Task: Create your communication plan**

#### Kickoff communication (2-4 weeks before pilot)

**Audience**: All affected users

**Key messages**:
- What is Windows 365?
- Why is the organization adopting it?
- What are the benefits for users?
- High-level timeline
- Who to contact with questions

**Channels**:
- All-hands meeting or email
- Intranet article
- FAQ document

**Sample messaging**:

> **Subject: Introducing Windows 365 - Your PC in the Cloud**
>
> We're excited to announce that [Organization] is adopting Windows 365, a Cloud PC solution that will give you a personalized Windows desktop accessible from any device, anywhere.
>
> **What this means for you:**
> - Access your desktop from any device - your laptop, tablet, or even your phone
> - Work from anywhere with a consistent experience
> - Your files and apps are always available
> - Enhanced security - your data stays safe in the cloud
>
> **Timeline:**
> - Pilot program: [Date]
> - Broader rollout: [Date]
>
> Stay tuned for more information!

#### Pre-enrollment communication (1-2 weeks before user's deployment)

**Audience**: Users in upcoming deployment wave

**Key messages**:
- You're scheduled to receive your Cloud PC on [date]
- Here's what to expect
- Here's how to access your Cloud PC
- Training resources available
- Support contacts

**Channels**:
- Direct email
- Teams message
- Calendar invitation for onboarding session

#### Enrollment day communication

**Audience**: Users receiving Cloud PCs that day

**Key messages**:
- Your Cloud PC is ready!
- Step-by-step access instructions
- Quick start guide
- Who to contact if you have issues

#### Post-enrollment communication (1 week after deployment)

**Audience**: Recently deployed users

**Key messages**:
- How is your Cloud PC experience?
- Tips and tricks
- Feedback survey link
- Reminder of support resources

### Communication timeline example

| Week | Audience | Communication |
|------|----------|---------------|
| -4 | All | Kickoff announcement |
| -2 | Pilot users | Pre-enrollment details |
| -1 | Pilot users | Training invitation |
| 0 | Pilot users | Your Cloud PC is ready |
| +1 | Pilot users | Feedback survey |
| +2 | Wave 1 | Pre-enrollment details |
| ... | ... | ... |

---

## Step 7 - Support help desk and end users

Include your IT support and help desk in early stages of Windows 365 planning. Early involvement builds expertise and prepares them for supporting users.

### Help desk preparation

✅ **Task: Train your support team**

**Training topics**:

| Topic | Content |
|-------|---------|
| Windows 365 overview | What it is, how it works |
| Accessing Cloud PCs | Windows app, web browser, client apps |
| Common issues | Connection problems, performance, apps |
| Troubleshooting tools | Intune, Azure AD, Connection diagnostics |
| Escalation paths | When and how to escalate |

**Recommended training activities**:

- [ ] Give help desk staff their own Cloud PCs
- [ ] Run through common scenarios
- [ ] Create troubleshooting runbooks
- [ ] Establish escalation procedures
- [ ] Set up monitoring and alerting

### Common issues and resolutions

✅ **Task: Prepare troubleshooting documentation**

| Issue | Possible Causes | Resolution Steps |
|-------|-----------------|------------------|
| Can't connect to Cloud PC | Network, authentication, Cloud PC not provisioned | 1. Verify network connectivity 2. Check Entra ID sign-in logs 3. Verify Cloud PC status in Intune |
| Slow performance | Network latency, Cloud PC size, running apps | 1. Check user's internet speed 2. Review Cloud PC metrics 3. Consider larger SKU |
| Application not working | Compatibility, not installed, permissions | 1. Verify app is deployed 2. Check compatibility 3. Review app logs |
| Can't print | Printer not configured, Universal Print | 1. Check Universal Print setup 2. Verify printer is shared 3. Consider local printer redirection |
| Audio/video issues | Client settings, bandwidth | 1. Check client settings 2. Verify bandwidth 3. Update client app |

### Support tiers

| Tier | Responsibility | Examples |
|------|---------------|----------|
| Tier 1 | First contact, basic issues | Password resets, access issues, basic how-to |
| Tier 2 | Complex issues, escalations | Application problems, performance issues |
| Tier 3 | Advanced issues, engineering | Provisioning failures, infrastructure issues |
| Microsoft | Product issues | Bugs, outages, feature requests |

### End user resources

✅ **Task: Create/curate end user documentation**

| Resource | Purpose |
|----------|---------|
| Quick start guide | Getting started with your Cloud PC |
| FAQ | Common questions and answers |
| Video tutorials | Visual guides for key tasks |
| Self-service portal | Password reset, basic troubleshooting |
| Support contact info | How to get help |

**Sample quick start guide topics**:

1. Accessing your Cloud PC (web, Windows app, mobile)
2. Signing in with your credentials
3. Navigating the Cloud PC desktop
4. Saving files (OneDrive recommendation)
5. Installing additional apps (Company Portal)
6. Printing
7. Using peripherals (camera, microphone, USB devices)
8. Disconnecting vs. signing out
9. Getting help

### User feedback collection

✅ **Task: Establish feedback mechanisms**

| Method | Timing | Purpose |
|--------|--------|---------|
| Initial survey | 1 week after provisioning | Early experience feedback |
| Ongoing feedback channel | Continuous | Ongoing improvement |
| Periodic surveys | Monthly/quarterly | Trend analysis |
| Focus groups | As needed | Deep dive on specific topics |

**Sample survey questions**:

1. How easy was it to access your Cloud PC for the first time? (1-5)
2. How would you rate the performance of your Cloud PC? (1-5)
3. Are all your required applications available and working? (Yes/No)
4. How does your Cloud PC experience compare to your previous desktop? (Better/Same/Worse)
5. Would you recommend Cloud PC to a colleague? (Yes/No)
6. What could be improved?

---

## Summary checklist

Use this checklist to track your planning progress:

### Step 1: Objectives
- [ ] Identified primary objectives for Windows 365
- [ ] Documented use cases and scenarios
- [ ] Defined success criteria

### Step 2: Requirements
- [ ] Created user persona inventory
- [ ] Mapped users to Cloud PC sizes
- [ ] Determined Windows 365 edition(s)
- [ ] Selected identity model
- [ ] Determined network configuration

### Step 3: Costs and Licensing
- [ ] Verified prerequisite licenses
- [ ] Calculated Windows 365 licensing costs
- [ ] Identified additional services needed
- [ ] Obtained budget approval

### Step 4: Infrastructure
- [ ] Assessed current device management
- [ ] Inventoried applications
- [ ] Documented policies to migrate
- [ ] Verified network readiness
- [ ] Identified pilot group

### Step 5: Rollout Plan
- [ ] Defined success metrics
- [ ] Created phased rollout timeline
- [ ] Determined enrollment approach
- [ ] Assigned resources and responsibilities

### Step 6: Communications
- [ ] Created communication plan
- [ ] Prepared communication materials
- [ ] Scheduled communications

### Step 7: Support
- [ ] Trained help desk
- [ ] Created troubleshooting documentation
- [ ] Established support tiers
- [ ] Prepared end user resources
- [ ] Set up feedback mechanisms

---

## Related resources

- [Windows 365 documentation](https://learn.microsoft.com/windows-365/)
- [Windows 365 requirements](https://learn.microsoft.com/windows-365/enterprise/requirements)
- [Windows 365 network requirements](https://learn.microsoft.com/windows-365/enterprise/requirements-network)
- [What's new in Windows 365](https://learn.microsoft.com/windows-365/enterprise/whats-new)
- [Windows 365 Tech Community](https://techcommunity.microsoft.com/t5/windows-365/bd-p/Windows365)

---

## Disclaimer

*This is an **unofficial community guide** and is not affiliated with, endorsed by, or representative of Microsoft Corporation. The information contained in this document is provided "as-is" for educational and informational purposes only.*

*Product names, logos, and brands are property of their respective owners. Always refer to official Microsoft documentation and consult with qualified professionals before making deployment decisions.*

*For official guidance, please visit: [Microsoft Learn - Windows 365](https://learn.microsoft.com/windows-365/)*
