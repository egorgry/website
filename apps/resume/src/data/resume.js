export const profile = {
  name: "Gregory Marchese",
  title: "Principal Engineer — Identity & Access Management",
  tagline:
    "An accomplished engineer providing secure enterprise SSO solutions. Over 20 years of IT experience.",
  summary:
    "Information security and technology professional specializing in building and supporting complex SSO environments at enterprise scale. Excel at integrating technology to achieve highly efficient security and a seamless, user-friendly experience — with in-depth expertise in SSO federation protocols, risk-based authentication, and security best practices that protect systems and data from internal and external threats.",
  location: "New Jersey, USA",
  email: "greg@gregory-marchese.com",
  phone: "973.570.5113",
  linkedin: "https://www.linkedin.com/in/gregorymarchese",
  twitter: "https://twitter.com/GregoryMarches1",
};

export const experience = [
  {
    company: "Johnson & Johnson",
    role: "Principal Engineer",
    start: "Mar 2013",
    end: "Present",
    active: true,
    summary:
      "Part of J&J's information security IAM team, responsible for the globally distributed single sign-on infrastructure — a hybrid cloud / on-premise approach enabling complex SAML and OAuth2 / OIDC use cases plus streamlined SAML provisioning for operational fulfillment.",
    highlights: [
      "Leading large migration from our legacy SSO platform to a modern, cloud-native identity provider with conditional access and FIDO2 support.",
      "Fully automated SAML and OAuth2 / OIDC provisioning for thousands of applications, including SaaS, internal, and partner-facing apps.",
      "Run a risk-based approach to MFA — strong multi-factor for thousands of SSO-enabled applications while keeping login friction low for trusted end users.",
      "Designed a system that only prompts for MFA when trust has dropped or a time window has passed, or denies login outright when risk is too high.",
      "Delivers a seamless login experience that increases productivity and cuts costs for J&J's operating companies.",
    ],
    tools: ["EntraID", "MS Authenticator", "PowerShell", "MS Graph API", "PingFederate", "PingOne", "PingID", "SAML 2.0", "OAuth2 / OIDC", "Risk-Based MFA", "Conditional Access", "FIDO2 Standards", "Cyber Incident Response & Remediation"],
  },
  {
    company: "Whiptail",
    companyNote: "acquired by Cisco",
    role: "Senior Full Stack Engineer",
    start: "Jan 2012",
    end: "Mar 2013",
    active: false,
    summary:
      "Lead systems engineer at an innovative startup building solid-state storage appliances for the enterprise — responsible for system engineering and support for the development teams.",
    highlights: [
      "Wrote scripts for automated system deployments, auto-support alerting, and RAID build/management within the Invicta and Accella storage appliances.",
      "Maintained AWS infrastructure running the team's internal tools — Git, Bugzilla, and LAMP dev environments on Ubuntu and CentOS.",
      "Delivered storage protocol integration, Front end to back-end API support and integrations, custom kernel tuning, and open-source license management for appliance builds; trained support staff on complex issues.",
    ],
    tools: ["AWS", "LAMP Stack", "Ubuntu", "CentOS", "Kernel Tuning", "Bash Scripting", "RAID Management", "Git", "Bugzilla", "Open-Source License Management"]
  },
  {
    company: "Johnson & Johnson",
    companyNote: "contract",
    role: "Analysis & Design, Network Delivery",
    start: "Feb 2011",
    end: "Jan 2012",
    active: false,
    summary:
      "Built and maintained J&J's Novell Access Manager gateways on SUSE Linux, implementing SAML-based single sign-on from development through production for every internal and external-facing J&J application.",
    highlights: [
      "Ran SAML rollouts through change management for internal, external, and SaaS-focused initiatives.",
      "Acted as liaison between L1/L2 support and L3 engineering, developing policy for newly deployed SSO services.",
      "Maintained two four-node identity provider / reverse-proxy clusters plus a two-node admin console cluster, all on Novell Access Manager and Apache Tomcat.",
    ],
    tools: ["Novell Access Manager", "SAML", "SUSE Linux", "Apache Tomcat"],
  },
  {
    company: "Burrelles Luce",
    companyNote: "media analysis & metrics for PR teams",
    role: "Sr. Linux Engineer, Web Portal",
    start: "Mar 2008",
    end: "Dec 2010",
    active: false,
    summary:
      "Hired as part of a team transforming the existing platform into an all-new digital experience — built, deployed, and scaled the full LAMP cluster for the customer-facing web portal and backend admin CMS.",
    highlights: [
      "Provided full engineering support for the development team while ensuring the integrity and security of all systems.",
    ],
    tools: ["LAMP Stack", "Custom CMS", "CentOS", "NetApp", "Bash Scripting", "SSH", "SFTP", "HTTPS"],
  },
  {
    company: "CIT",
    companyNote: "formerly Newcourt Financial / ATT Capital",
    role: "Sr. UNIX/Linux Engineer",
    start: "Mar 2001",
    end: "Nov 2008",
    active: false,
    summary:
      "Moved into a senior administrator role after the Newcourt acquisition, taking over the global backup environment and migrating remaining local backups to a centralized NetBackup service.",
    highlights: [
      "Enhanced off-site tape inventory reporting and management; participated in disaster recovery exercises and maintained HP Ignite images and DR documentation.",
      "Wrote and maintained UNIX/Linux security standards, and moved the company from clear-text protocols to HTTPS, SSH, and SFTP.",
      "Helped establish the company's first Linux-based infrastructure, including Oracle RAC clusters and Apache web servers, with extensive HP-UX/Red Hat kernel tuning.",
    ],
    tools: ["Red Hat Linux", "HP-UX", "Solaris", "Oracle RAC", "NetBackup", "Bash / KSH","Perl", "SSH", "SFTP", "HTTPS"],
  },
  {
    company: "Newcourt Financial",
    companyNote: "formerly ATT Capital, acquired by CIT",
    role: "Operations / Systems Administrator",
    start: "Jan 1998",
    end: "Mar 2001",
    active: false,
    summary:
      "Focused on system backups, monitoring with HP OpenView, and initial server builds for HP-UX, Solaris, and Microsoft NT — plus first-level support for customers and application users.",
    highlights: [
      "Ran backups across TAR, Backup Exec, and Veritas NetBackup.",
      "Replaced a manual spreadsheet tape-tracking process with a Perl program backed by a searchable flat-file database, speeding up offsite tape recall and DR ordering.",
    ],
    tools: ["HP OpenView", "NetBackup", "Perl", "HP-UX", "Solaris", "Windows NT"],
  },
];

export const skillGroups = [
  {
    label: "Identity & Security Expertise",
    skills: [
      "Identity & Access Management",
      "Access Governance",
      "SAML 2.0 (SME)",
      "OAuth2 / OIDC (SME)",
      "Multi-Factor Authentication (SME)",
      "Risk-Based MFA (SME)",
      "FIDO2 Standards",
      "Cyber Incident Response & Remediation",
    ],
  },
  {
    label: "Platforms & Tools",
    skills: [
      "PingFederate",
      "PingOne",
      "PingID",
      "PingCentral",
      "Ubuntu & Red Hat Linux",
      "Windows Server",
      "AWS",
      "VMware ESXi",
      "Kali Linux",
      "Nessus",
      "Bitbucket, Jira & Confluence",
    ],
  },
  {
    label: "Practices & Operations",
    skills: [
      "Shell Scripting & Automation",
      "Disaster Recovery / Business Continuity",
      "Change Management",
      "Multi-Cloud Experience",
      "Team Training",
    ],
  },
];

export const achievements = [
  { text: "ID Pro member", href: "https://membership.idpro.org/Sys/PublicProfile/53720040/4680524" },
  { text: "Guest speaker at Identiverse 2020", href: "https://identiverse.com/videos/videos2020/" },
  { text: "J&J team won two Identity Excellence Awards — 2017 and 2021" },
  { text: "Working toward CIDPRO certification", href: "https://idpro.org/cidpro/" },
];

export const extras = {
  heading: "Off the clock",
  body: "I'm an avid learner and enjoy sharing knowledge — teaching my kids about hacking, computers, and electronics using open-source tools and SBCs like Raspberry Pi and Arduino, and contributing back to the maker community. When I'm not in front of a screen, I'm hiking, mountain biking, camping, kayaking, cooking, or taking pictures. I'm a big music and movie fan and love to take in live performances whenever I can.",
};
