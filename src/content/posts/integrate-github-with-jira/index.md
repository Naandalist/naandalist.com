---
title: "Integrate GitHub Enterprise Server with Jira"
subtitle: "Make Work Traceable from Issue to PR"
description: "Step-by-step guide to connect GitHub Enterprise Server (GHES) with Jira using a GitHub App, network allowlisting or a secure gateway, and workflow conventions (issue keys) so Jira shows real dev activity."
date: "2025-12-27"
keywords:
  - GitHub Enterprise Server
  - GHES
  - Jira integration
  - GitHub App
  - Atlassian
  - developer traceability
  - issue keys
  - pull requests
  - commits
  - DevOps workflow
  - enterprise tooling
  - repository permissions
---


Integrating GitHub Enterprise Server (GHES) with Jira is one of those “small setup, big payoff” moves: your Jira issues stop being static tickets and start showing real development activity—branches, commits, pull requests, and more—in the context of the work itself.

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1766842153/naandalist.com/neon_cyberpunk_alley_by_n1ghtw1re_dkhcupt-414w-2x_rmhor5.jpg" alt="Integrate GitHub Enterprise Server with Jira" />
</div>



## What You Get After Connecting GHES to Jira

When Jira is connected to GitHub Enterprise Server, Jira work items can display development activity such as branches, commits, and pull requests. This makes it easier to track progress directly from Jira boards and issue views.

In practice, this helps with:
- Faster status visibility for PMs and engineering managers
- Cleaner handoffs between planning (Jira) and execution (GitHub)
- Less manual copy-paste of links and updates

## Prerequisites (Do Not Skip These)

Before you start, confirm:
- You have Jira admin access (or someone who does)
- You have GHES admin or equivalent permissions to create/manage GitHub Apps
- Your GHES networking constraints are known (public URL vs behind a firewall)

If your GHES sits behind a firewall (common), Jira must be able to communicate with it. Atlassian provides two approaches: allowlist Atlassian IPs, or create a locked public gateway that Jira can use.

## Step 1: Prepare Network Access (Firewall / Gateway)

If your GHES has a public-facing URL, you can allow access from Atlassian IP addresses.

If your GHES does not have a public-facing URL—or you want extra security—use a locked, public-facing gateway approach and provide Jira with:
- a gateway server URL
- a request header name
- an API key value

This step is the most common failure point. If Jira cannot reach your GHES, nothing else matters.

## Step 2: Connect Your GitHub Enterprise Server in Jira

In Jira, connect your GHES instance by entering the server URL in the required format, and (if you use a gateway) the header name and API key.

At this stage, Jira is establishing the “server connection.” The next step is what actually governs data flow and repository access: a GitHub App.

## Step 3: Create the GitHub App (Automatic vs Manual)

After connecting GHES, Jira requires a GitHub App to manage the data flow to your Jira site, including which repositories are available and what Jira automations can be triggered via commit messages.

### Automatic App Creation (Recommended)

Automatic creation is the most convenient path. Atlassian notes that automatic app creation requires a minimum GHES version to support it. 

If your GHES meets the requirement:
- Choose “Automatic app creation”
- You will be redirected to GitHub to create the GitHub App
- Name the app clearly (e.g., “jira-integration-prod”)

### Manual App Creation

If you cannot use automatic creation, you can create the GitHub App manually based on Jira-provided details. Atlassian provides a <a href="https://support.atlassian.com/jira-cloud-administration/docs/connect-a-github-enterprise-server-account-to-jira-software/" rel="nofollow">dedicated manual creation guide</a> for this flow. 

## Step 4: Limit Access to the Right Repositories (Least Privilege)

Do not connect everything “just because.” You want the integration to show development activity for the repos that actually map to Jira projects.

A good rule:
- Start with one org + a small set of repos
- Validate the data appears correctly in Jira issues
- Expand gradually

This avoids accidental data exposure and reduces noise in Jira.

## Step 5: Make Jira Issue Keys Non-Negotiable in Your Workflow

The integration becomes valuable only when your team consistently references Jira issue keys in development artifacts.

Enforce these conventions:
- Branch names include the Jira issue key  
  Example: PROJ-123-add-login-rate-limit
- Pull request titles include the issue key  
  Example: PROJ-123 Add rate limiting to login
- Commit messages include the issue key where appropriate  
  Example: fix(auth): prevent token refresh loop (PROJ-123)

Once you do this, Jira can associate development activity with the right work items.

If you want a strong standard for commit messages, use Conventional Commits and enforce it in PR reviews. For a deep dive, read [Git Commit Message Standard](https://naandalist.com/posts/git-commit-message-convention).

## Step 6: Validate in Jira (What to Check)

After setup, pick a Jira issue and confirm you can see development signals such as:
- linked branches
- related commits
- pull requests

If nothing appears:
- it is usually networking/firewall access, or
- the GitHub App permissions/repo access is misconfigured, or
- your team is not using issue keys consistently.

## Security and Scaling Notes

If you operate multiple GHES instances (or multiple environments), Atlassian states you can connect multiple GitHub Servers to a single Jira account, and multiple GitHub Apps per server.

One constraint to remember: each GitHub App can only be connected to a single Jira instance to prevent data leaks. 

## Troubleshooting: Common Failure Modes

### Jira cannot connect to GHES
This is usually firewall/IP allowlist/gateway configuration. Re-check your network approach and ensure Jira can reach the GHES URL you provided.

### GitHub App creation fails
Use manual app creation as the fallback path following Atlassian’s guide.

### Data is connected but nothing shows on Jira issues
Almost always workflow discipline:
- ensure issue keys exist in branch/PR/commit text
- ensure the GitHub App has access to the correct repositories

## FAQ

### Can I connect multiple GitHub Enterprise Servers to one Jira site?
Yes. Atlassian states you can connect multiple GitHub Servers to a single Jira account.

### Can I connect multiple GitHub Apps to one GitHub Server?
Yes. You can add multiple GitHub Apps per server to connect organizations as needed.

### Can I reuse one GitHub App across multiple Jira sites?
No. Atlassian notes each GitHub App can only be connected to one Jira instance to maintain security and prevent data leaks.

### What is the fastest way to get value from this integration?
Make Jira issue keys mandatory in branch names and PR titles. Without that discipline, the integration will look “installed” but not “useful.”

## Conclusion

Connecting GitHub Enterprise Server to Jira is straightforward, but usefulness depends on two things: reliable network access and consistent issue key conventions in your workflow.

Do the setup carefully, start small, validate, then scale. Most teams fail not because the integration is hard, but because they never enforce the habits that make it meaningful.

