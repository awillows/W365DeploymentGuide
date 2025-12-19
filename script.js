// Windows 365 Deployment Guide - Interactive Script

// State Management
const state = {
    currentStep: 1,
    totalSteps: 6,
    selections: {
        license: null,
        identity: null,
        network: null,
        image: null,
        security: {
            mfa: true,
            sso: false,
            compliant: true,
            location: false,
            risk: false,
            defender: true,
            bitlocker: true,
            baselines: false,
            clipboard: false,
            drive: false,
            watermark: false
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeWizard();
    initializeOptionCards();
    initializeSecurityCheckboxes();
    initializeNavLinks();
    initializeMermaid();
});

// Initialize Mermaid diagrams
function initializeMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#0078d4',
                primaryTextColor: '#fff',
                primaryBorderColor: '#005a9e',
                lineColor: '#6c757d',
                secondaryColor: '#00a4ef',
                tertiaryColor: '#f5f5f5'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }
}

// Expand all considerations by default
function expandAllConsiderations() {
    document.querySelectorAll('.considerations-panel').forEach(panel => {
        panel.classList.add('expanded');
    });
}

// Toggle considerations panel
function toggleConsiderations(panelId) {
    const content = document.getElementById(panelId);
    const panel = content.closest('.considerations-panel');
    panel.classList.toggle('expanded');
}

// Initialize wizard
function initializeWizard() {
    updateProgressBar();
    updateNavigationButtons();
}

// Handle option card selection
function initializeOptionCards() {
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const parent = card.closest('.wizard-step');
            const stepId = parent.id;
            
            // Remove selection from siblings
            parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            card.classList.add('selected');
            
            // Store selection
            const value = card.dataset.value;
            switch(stepId) {
                case 'step1':
                    state.selections.license = value;
                    // Apply Business license constraints
                    applyLicenseConstraints(value);
                    break;
                case 'step2':
                    state.selections.identity = value;
                    // Auto-update network requirement for hybrid
                    if (value === 'hybrid') {
                        showNetworkRequirement();
                    } else {
                        clearNetworkRequirement();
                    }
                    // Update considerations panel
                    updateConsiderations('identity', value);
                    // Update architecture diagram
                    updateArchitectureDiagram();
                    break;
                case 'step3':
                    state.selections.network = value;
                    // Update considerations panel
                    updateConsiderations('network', value);
                    // Update architecture diagram
                    updateArchitectureDiagram();
                    break;
                case 'step4':
                    state.selections.image = value;
                    break;
            }
        });
    });
}

// Update considerations panel based on selection
function updateConsiderations(step, value) {
    // Hide all considerations for this step
    const panel = document.getElementById(`${step}-considerations-panel`);
    if (!panel) return;
    
    panel.querySelectorAll('.considerations-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the relevant considerations
    const targetId = `${step}-${value}`;
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
    }
}

// Initialize security checkboxes
function initializeSecurityCheckboxes() {
    const checkboxMapping = {
        'sec-mfa': 'mfa',
        'sec-sso': 'sso',
        'sec-compliant': 'compliant',
        'sec-location': 'location',
        'sec-risk': 'risk',
        'sec-defender': 'defender',
        'sec-bitlocker': 'bitlocker',
        'sec-baselines': 'baselines',
        'sec-clipboard': 'clipboard',
        'sec-drive': 'drive',
        'sec-watermark': 'watermark'
    };
    
    Object.entries(checkboxMapping).forEach(([id, key]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            // Set initial state
            checkbox.checked = state.selections.security[key];
            
            // Add listener
            checkbox.addEventListener('change', () => {
                state.selections.security[key] = checkbox.checked;
            });
        }
    });
}

// Initialize navigation links for smooth scrolling
function initializeNavLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Change wizard step
function changeStep(direction) {
    const newStep = state.currentStep + direction;
    
    if (newStep < 1 || newStep > state.totalSteps) return;
    
    // Validate before moving forward
    if (direction > 0 && !validateStep(state.currentStep)) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step${state.currentStep}`).classList.remove('active');
    
    // Update state
    state.currentStep = newStep;
    
    // Show new step
    document.getElementById(`step${state.currentStep}`).classList.add('active');
    
    // Update UI
    updateProgressBar();
    updateNavigationButtons();
    updateProgressSteps();
    
    // Generate summary if on last step
    if (state.currentStep === state.totalSteps) {
        generateSummary();
    }
    
    // Scroll to wizard
    document.getElementById('wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Validate current step
function validateStep(step) {
    switch(step) {
        case 1:
            if (!state.selections.license) {
                showValidationMessage('Please select a license type');
                return false;
            }
            break;
        case 2:
            if (!state.selections.identity) {
                showValidationMessage('Please select an identity configuration');
                return false;
            }
            break;
        case 3:
            if (!state.selections.network) {
                showValidationMessage('Please select a network configuration');
                return false;
            }
            // Validate hybrid + network requirement
            if (state.selections.identity === 'hybrid' && state.selections.network === 'microsoft-hosted') {
                showValidationMessage('Hybrid Entra ID Join requires Azure Network Connection');
                return false;
            }
            break;
        case 4:
            if (!state.selections.image) {
                showValidationMessage('Please select an image type');
                return false;
            }
            break;
    }
    return true;
}

// Show validation message
function showValidationMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'validation-toast';
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #d83b01;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Apply license constraints (Business has limited options)
function applyLicenseConstraints(license) {
    const identityStep = document.getElementById('step2');
    const networkStep = document.getElementById('step3');
    const imageStep = document.getElementById('step4');
    
    const entraCard = identityStep.querySelector('[data-value="entra"]');
    const hybridCard = identityStep.querySelector('[data-value="hybrid"]');
    const mhnCard = networkStep.querySelector('[data-value="microsoft-hosted"]');
    const ancCard = networkStep.querySelector('[data-value="anc"]');
    const galleryCard = imageStep.querySelector('[data-value="gallery"]');
    const customCard = imageStep.querySelector('[data-value="custom"]');
    
    if (license === 'business') {
        // Business: Only Entra ID Join, Microsoft Hosted Network, Gallery Image
        disableCard(hybridCard, 'Requires Enterprise');
        disableCard(ancCard, 'Requires Enterprise');
        disableCard(customCard, 'Requires Enterprise');
        
        // Auto-select the only valid options
        selectCard(entraCard, 'step2');
        selectCard(mhnCard, 'step3');
        selectCard(galleryCard, 'step4');
        
        state.selections.identity = 'entra';
        state.selections.network = 'microsoft-hosted';
        state.selections.image = 'gallery';
        
        showValidationMessage('Business license: Entra ID Join, Microsoft Hosted Network, and Gallery Image only');
    } else {
        // Enterprise/Frontline: All options available
        enableCard(hybridCard);
        enableCard(ancCard);
        enableCard(customCard);
        
        // Clear auto-selections (user must choose)
        clearSelections();
    }
}

// Disable a card with tooltip
function disableCard(card, reason) {
    if (!card) return;
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
    card.classList.remove('selected');
    card.setAttribute('title', reason);
    
    // Add visual indicator
    if (!card.querySelector('.constraint-badge')) {
        const badge = document.createElement('span');
        badge.className = 'constraint-badge';
        badge.textContent = reason;
        badge.style.cssText = 'position:absolute;top:10px;right:10px;background:#d83b01;color:white;padding:2px 8px;border-radius:4px;font-size:11px;';
        card.style.position = 'relative';
        card.appendChild(badge);
    }
}

// Enable a card
function enableCard(card) {
    if (!card) return;
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
    card.removeAttribute('title');
    
    const badge = card.querySelector('.constraint-badge');
    if (badge) badge.remove();
}

// Select a card programmatically
function selectCard(card, stepId) {
    if (!card) return;
    const parent = document.getElementById(stepId);
    parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

// Clear selections when switching to Enterprise
function clearSelections() {
    ['step2', 'step3', 'step4'].forEach(stepId => {
        const step = document.getElementById(stepId);
        step.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    });
    state.selections.identity = null;
    state.selections.network = null;
    state.selections.image = null;
}

// Show network requirement notification for hybrid
function showNetworkRequirement() {
    const networkStep = document.getElementById('step3');
    const mhnCard = networkStep.querySelector('[data-value="microsoft-hosted"]');
    const ancCard = networkStep.querySelector('[data-value="anc"]');
    
    disableCard(mhnCard, 'Hybrid requires ANC');
    selectCard(ancCard, 'step3');
    state.selections.network = 'anc';
}

// Clear network requirement when not hybrid
function clearNetworkRequirement() {
    if (state.selections.license === 'business') return; // Don't clear if Business
    
    const networkStep = document.getElementById('step3');
    const mhnCard = networkStep.querySelector('[data-value="microsoft-hosted"]');
    
    enableCard(mhnCard);
}

// Update progress bar
function updateProgressBar() {
    const fill = document.getElementById('progressFill');
    const percentage = (state.currentStep / state.totalSteps) * 100;
    fill.style.width = `${percentage}%`;
}

// Update progress steps
function updateProgressSteps() {
    document.querySelectorAll('.progress-steps .step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum === state.currentStep) {
            step.classList.add('active');
        } else if (stepNum < state.currentStep) {
            step.classList.add('completed');
        }
    });
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = state.currentStep === 1;
    
    if (state.currentStep === state.totalSteps) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Finish';
        nextBtn.onclick = () => {
            document.getElementById('checklist').scrollIntoView({ behavior: 'smooth' });
        };
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        nextBtn.onclick = () => changeStep(1);
    }
}

// Generate summary
function generateSummary() {
    generateConfigSummary();
    generateChecklist();
    generateTimeline();
    generateProvisioningPolicyCode();
    generateRequiredUrls();
    generateLicensingRequirements();
}

// Generate configuration summary
function generateConfigSummary() {
    const grid = document.getElementById('summaryGrid');
    
    const licenseNames = {
        'enterprise': 'Windows 365 Enterprise',
        'business': 'Windows 365 Business',
        'frontline': 'Windows 365 Frontline'
    };
    
    const identityNames = {
        'entra': 'Microsoft Entra ID Join',
        'hybrid': 'Hybrid Entra ID Join'
    };
    
    const networkNames = {
        'microsoft-hosted': 'Microsoft Hosted Network',
        'anc': 'Azure Network Connection'
    };
    
    const imageNames = {
        'gallery': 'Gallery Image',
        'custom': 'Custom Image'
    };
    
    // Count security features
    const securityCount = Object.values(state.selections.security).filter(v => v).length;
    
    grid.innerHTML = `
        <div class="summary-item">
            <label>License</label>
            <div class="value">${licenseNames[state.selections.license] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>Identity</label>
            <div class="value">${identityNames[state.selections.identity] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>Network</label>
            <div class="value">${networkNames[state.selections.network] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>Image</label>
            <div class="value">${imageNames[state.selections.image] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>Security Features</label>
            <div class="value">${securityCount} enabled</div>
        </div>
    `;
}

// Generate deployment checklist
function generateChecklist() {
    const checklist = document.getElementById('deploymentChecklist');
    const items = [];
    
    // Base requirements
    items.push({
        title: 'Verify Microsoft 365 / EMS licensing',
        note: 'E3/E5 or Intune license required',
        type: 'required'
    });
    
    items.push({
        title: 'Purchase Windows 365 licenses',
        note: `${state.selections.license === 'enterprise' ? 'Enterprise' : state.selections.license === 'frontline' ? 'Frontline' : 'Business'} licenses for target users`,
        type: 'required'
    });
    
    // Identity requirements
    if (state.selections.identity === 'hybrid') {
        items.push({
            title: 'Configure Azure AD Connect',
            note: 'Enable password hash sync and device writeback',
            type: 'required'
        });
        items.push({
            title: 'Verify Domain Controller connectivity',
            note: 'Cloud PCs must reach DCs for domain join',
            type: 'required'
        });
    }
    
    // Network requirements
    if (state.selections.network === 'anc') {
        items.push({
            title: 'Create Azure subscription',
            note: 'Required for Azure Network Connection',
            type: 'required'
        });
        items.push({
            title: 'Create Virtual Network',
            note: 'With /26 subnet minimum for Cloud PCs',
            type: 'required'
        });
        items.push({
            title: 'Configure Azure Network Connection',
            note: 'In Intune admin center',
            type: 'required'
        });
        if (state.selections.identity === 'hybrid') {
            items.push({
                title: 'Set up VPN Gateway or ExpressRoute',
                note: 'For connectivity to on-premises DC',
                type: 'required'
            });
        }
    }
    
    // Image requirements
    if (state.selections.image === 'custom') {
        items.push({
            title: 'Create Azure Compute Gallery',
            note: 'To store custom images',
            type: 'required'
        });
        items.push({
            title: 'Build and generalize custom image',
            note: 'Windows 10/11 Enterprise, Gen 2, Sysprep',
            type: 'required'
        });
    }
    
    // Security requirements
    if (state.selections.security.mfa) {
        items.push({
            title: 'Configure MFA for Cloud PC access',
            note: 'Conditional Access policy',
            type: 'recommended'
        });
    }
    
    if (state.selections.security.defender) {
        items.push({
            title: 'Enable Defender for Endpoint onboarding',
            note: 'Via Intune device configuration',
            type: 'recommended'
        });
    }
    
    // Standard items
    items.push({
        title: 'Create provisioning policy',
        note: 'Specify image, network, join type, and sizing',
        type: 'required'
    });
    
    items.push({
        title: 'Create user assignment group',
        note: 'Entra ID group for Cloud PC users',
        type: 'required'
    });
    
    items.push({
        title: 'Configure user settings policy',
        note: 'Local admin, restore points, etc.',
        type: 'optional'
    });
    
    items.push({
        title: 'Deploy Windows App to endpoints',
        note: 'Via Intune or manual installation',
        type: 'recommended'
    });
    
    items.push({
        title: 'Create user documentation',
        note: 'Access instructions and support contacts',
        type: 'optional'
    });
    
    // Render checklist
    checklist.innerHTML = items.map(item => `
        <div class="checklist-item ${item.type}">
            <input type="checkbox">
            <div class="item-content">
                <div class="item-title">${item.title}</div>
                <div class="item-note">${item.note}</div>
            </div>
            <span class="badge ${item.type === 'required' ? '' : item.type === 'recommended' ? 'badge-recommended' : ''}">${item.type}</span>
        </div>
    `).join('');
}

// Generate timeline
function generateTimeline() {
    const timeline = document.getElementById('timeline');
    const steps = [];
    
    // Day 1-2: Prerequisites
    steps.push({
        day: '1-2',
        title: 'Prerequisites & Licensing',
        description: 'Verify licensing, purchase W365 licenses, create user groups'
    });
    
    // Network setup timing
    if (state.selections.network === 'anc') {
        steps.push({
            day: '3-5',
            title: 'Network Configuration',
            description: 'Create VNet, configure ANC, set up VPN if needed'
        });
        
        if (state.selections.identity === 'hybrid') {
            steps.push({
                day: '5-7',
                title: 'Identity Configuration',
                description: 'Configure AD Connect, verify DC connectivity'
            });
        }
    }
    
    // Image setup
    if (state.selections.image === 'custom') {
        steps.push({
            day: state.selections.network === 'anc' ? '7-10' : '3-6',
            title: 'Custom Image Creation',
            description: 'Build, configure, and upload custom image'
        });
    }
    
    // Provisioning
    const provDay = state.selections.image === 'custom' ? 
        (state.selections.network === 'anc' ? '10-11' : '6-7') :
        (state.selections.network === 'anc' ? '7-8' : '3-4');
    
    steps.push({
        day: provDay,
        title: 'Provisioning Policy Setup',
        description: 'Create policy, configure security, assign users'
    });
    
    // Pilot
    const pilotDay = state.selections.image === 'custom' ? 
        (state.selections.network === 'anc' ? '11-14' : '7-10') :
        (state.selections.network === 'anc' ? '8-10' : '4-6');
    
    steps.push({
        day: pilotDay,
        title: 'Pilot Deployment',
        description: 'Deploy to pilot group, gather feedback, refine'
    });
    
    // Full rollout
    steps.push({
        day: 'Ongoing',
        title: 'Production Rollout',
        description: 'Phased deployment to remaining users'
    });
    
    // Render timeline
    timeline.innerHTML = steps.map((step, index) => `
        <div class="timeline-item">
            <div class="timeline-marker">${index + 1}</div>
            <div class="timeline-content">
                <h5>Day ${step.day}: ${step.title}</h5>
                <p>${step.description}</p>
            </div>
        </div>
    `).join('');
}

// Export summary as text/markdown
function exportSummary() {
    const licenseNames = {
        'enterprise': 'Windows 365 Enterprise',
        'business': 'Windows 365 Business',
        'frontline': 'Windows 365 Frontline'
    };
    
    const identityNames = {
        'entra': 'Microsoft Entra ID Join',
        'hybrid': 'Hybrid Entra ID Join'
    };
    
    const networkNames = {
        'microsoft-hosted': 'Microsoft Hosted Network',
        'anc': 'Azure Network Connection'
    };
    
    const imageNames = {
        'gallery': 'Gallery Image',
        'custom': 'Custom Image'
    };
    
    let content = `# Windows 365 Deployment Plan\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += `## Configuration Summary\n\n`;
    content += `- **License:** ${licenseNames[state.selections.license]}\n`;
    content += `- **Identity:** ${identityNames[state.selections.identity]}\n`;
    content += `- **Network:** ${networkNames[state.selections.network]}\n`;
    content += `- **Image:** ${imageNames[state.selections.image]}\n\n`;
    
    content += `## Security Settings\n\n`;
    Object.entries(state.selections.security).forEach(([key, value]) => {
        content += `- [${value ? 'x' : ' '}] ${key.charAt(0).toUpperCase() + key.slice(1)}\n`;
    });
    
    content += `\n## Deployment Checklist\n\n`;
    document.querySelectorAll('#deploymentChecklist .checklist-item').forEach(item => {
        const title = item.querySelector('.item-title').textContent;
        const note = item.querySelector('.item-note').textContent;
        content += `- [ ] **${title}** - ${note}\n`;
    });
    
    // Create download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'W365-Deployment-Plan.md';
    a.click();
    URL.revokeObjectURL(url);
}

// Print summary
function printSummary() {
    window.print();
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Update Architecture Diagram based on selections
function updateArchitectureDiagram() {
    const diagramContainer = document.getElementById('architecture-diagram');
    if (!diagramContainer || typeof mermaid === 'undefined') return;
    
    const identity = state.selections.identity;
    const network = state.selections.network;
    
    let diagramCode = '';
    
    if (network === 'microsoft-hosted') {
        if (identity === 'entra') {
            // Entra ID + Microsoft Hosted Network
            diagramCode = `graph LR
    subgraph Users["User Devices"]
        U[fa:fa-laptop Windows App]
    end
    
    subgraph MSCloud["Microsoft Cloud"]
        W365[fa:fa-cloud Cloud PC<br/>Microsoft Hosted Network]
        EntraID[fa:fa-shield-alt Entra ID]
        M365[fa:fa-microsoft Microsoft 365]
        Intune[fa:fa-cogs Intune]
    end
    
    subgraph Internet["Internet / SaaS"]
        SaaS[fa:fa-globe SaaS Apps]
    end
    
    U -->|RDP/HTTPS| W365
    W365 <-->|Auth| EntraID
    W365 -->|Direct| M365
    W365 -->|Managed| Intune
    W365 -->|Direct| SaaS
    
    style W365 fill:#0078d4,stroke:#005a9e,color:#fff
    style EntraID fill:#00a4ef,stroke:#0078d4,color:#fff
    style M365 fill:#d83b01,stroke:#a52a00,color:#fff
    style Intune fill:#00bcf2,stroke:#0078d4,color:#fff`;
        } else {
            // Hybrid selected but MHN - should not happen due to constraints
            diagramCode = `graph LR
    W365[Hybrid Join requires<br/>Azure Network Connection]
    style W365 fill:#d83b01,stroke:#a52a00,color:#fff`;
        }
    } else if (network === 'anc') {
        if (identity === 'hybrid') {
            // Hybrid + ANC - full on-prem connectivity
            diagramCode = `graph LR
    subgraph Users["User Devices"]
        U[fa:fa-laptop Windows App]
    end
    
    subgraph MSCloud["Microsoft Cloud"]
        W365[fa:fa-cloud Cloud PC]
        EntraID[fa:fa-shield-alt Entra ID]
        M365[fa:fa-microsoft Microsoft 365]
    end
    
    subgraph Azure["Your Azure VNet"]
        VNet[fa:fa-network-wired Azure VNet<br/>/26 Subnet]
        VPN[fa:fa-shield-alt VPN Gateway /<br/>ExpressRoute]
    end
    
    subgraph OnPrem["On-Premises"]
        DC[fa:fa-server Domain<br/>Controller]
        Files[fa:fa-folder File Servers]
        Apps[fa:fa-desktop Legacy Apps]
    end
    
    U -->|RDP/HTTPS| W365
    W365 <-->|Auth| EntraID
    W365 -->|Direct| M365
    W365 ---|ANC| VNet
    VNet --- VPN
    VPN ---|S2S/ER| DC
    VPN ---|S2S/ER| Files
    VPN ---|S2S/ER| Apps
    
    style W365 fill:#0078d4,stroke:#005a9e,color:#fff
    style EntraID fill:#00a4ef,stroke:#0078d4,color:#fff
    style VNet fill:#5c2d91,stroke:#3b1f5e,color:#fff
    style DC fill:#107c10,stroke:#0b5c0b,color:#fff
    style Files fill:#107c10,stroke:#0b5c0b,color:#fff
    style Apps fill:#107c10,stroke:#0b5c0b,color:#fff`;
        } else {
            // Entra ID + ANC
            diagramCode = `graph LR
    subgraph Users["User Devices"]
        U[fa:fa-laptop Windows App]
    end
    
    subgraph MSCloud["Microsoft Cloud"]
        W365[fa:fa-cloud Cloud PC]
        EntraID[fa:fa-shield-alt Entra ID]
        M365[fa:fa-microsoft Microsoft 365]
    end
    
    subgraph Azure["Your Azure VNet"]
        VNet[fa:fa-network-wired Azure VNet<br/>/26 Subnet]
        DNS[fa:fa-server Custom DNS]
        VPN[fa:fa-shield-alt VPN Gateway]
    end
    
    subgraph OnPrem["On-Premises"]
        Files[fa:fa-folder File Servers]
        Apps[fa:fa-desktop Internal Apps]
    end
    
    U -->|RDP/HTTPS| W365
    W365 <-->|Auth| EntraID
    W365 -->|Direct| M365
    W365 ---|ANC| VNet
    VNet --- DNS
    VNet --- VPN
    VPN ---|Optional| Files
    VPN ---|Optional| Apps
    
    style W365 fill:#0078d4,stroke:#005a9e,color:#fff
    style EntraID fill:#00a4ef,stroke:#0078d4,color:#fff
    style VNet fill:#5c2d91,stroke:#3b1f5e,color:#fff
    style Files fill:#107c10,stroke:#0b5c0b,color:#fff`;
        }
    } else {
        // Default diagram when nothing selected
        diagramCode = `graph LR
    subgraph Users
        U[fa:fa-user User Device]
    end
    
    subgraph MSCloud["Microsoft Cloud"]
        W365[fa:fa-cloud Windows 365<br/>Cloud PC]
        M365[fa:fa-microsoft Microsoft 365]
    end
    
    U -->|Windows App| W365
    W365 -->|Direct| M365
    
    style W365 fill:#0078d4,stroke:#005a9e,color:#fff
    style M365 fill:#00a4ef,stroke:#0078d4,color:#fff`;
    }
    
    // Re-render the diagram
    diagramContainer.innerHTML = diagramCode;
    diagramContainer.removeAttribute('data-processed');
    
    try {
        mermaid.run({
            nodes: [diagramContainer]
        });
    } catch (e) {
        console.log('Mermaid render:', e);
    }
}

// Generate Provisioning Policy PowerShell Code
function generateProvisioningPolicyCode() {
    const powershellContent = document.getElementById('powershellContent');
    const graphContent = document.getElementById('graphContent');
    
    const identity = state.selections.identity;
    const network = state.selections.network;
    const image = state.selections.image;
    const license = state.selections.license;
    const sso = state.selections.security.sso;
    
    // Determine domain join type
    const domainJoinType = identity === 'hybrid' ? 'hybridAzureADJoin' : 'azureADJoin';
    
    // Determine provisioning type
    let provisioningType = 'dedicated';
    if (license === 'frontline') {
        provisioningType = 'shared'; // or 'dedicated' based on selection
    }
    
    // PowerShell Script
    const powershellCode = `# Windows 365 Provisioning Policy Creation Script
# Generated by W365 Deployment Guide - ${new Date().toLocaleDateString()}
# 
# Prerequisites:
# - Install-Module Microsoft.Graph -Scope CurrentUser
# - Connect-MgGraph -Scopes "CloudPC.ReadWrite.All"

#Requires -Modules Microsoft.Graph.Beta.DeviceManagement.Actions

# Connect to Microsoft Graph
Connect-MgGraph -Scopes "CloudPC.ReadWrite.All"

# Define provisioning policy parameters
$policyName = "W365-Policy-$(Get-Date -Format 'yyyyMMdd')"
$policyDescription = "Windows 365 provisioning policy created via deployment guide"

${network === 'anc' ? `# Azure Network Connection ID - Replace with your actual ANC ID
# Get available ANCs: Get-MgBetaDeviceManagementVirtualEndpointOnPremisesConnection
$ancId = "<YOUR-ANC-ID-HERE>"
` : `# Using Microsoft Hosted Network
$geography = "US"  # Change to your preferred geography: US, EU, APAC, etc.
$regionGroup = "US East"  # Optional: specify region group or leave for auto-selection
`}
# Domain Join Configuration
$domainJoinConfig = @{
    DomainJoinType = "${domainJoinType}"
${network === 'anc' ? `    OnPremisesConnectionId = $ancId` : `    RegionGroup = $regionGroup
    RegionName = ""  # Leave empty for automatic selection (recommended)`}
}

# Image Configuration
${image === 'custom' ? `# Custom Image - Replace with your image ID
# Get available images: Get-MgBetaDeviceManagementVirtualEndpointDeviceImage
$imageId = "<YOUR-CUSTOM-IMAGE-ID>"
$imageType = "custom"
$imageDisplayName = "Custom Windows 11 Image"` : `# Gallery Image - Windows 11 Enterprise + Microsoft 365 Apps
$imageId = "MicrosoftWindowsDesktop_windows-ent-cpc_win11-23h2-ent-cpc-m365"
$imageType = "gallery"
$imageDisplayName = "Windows 11 Enterprise + Microsoft 365 Apps"`}

# Windows Settings
$windowsSettings = @{
    Locale = "en-US"  # Change to your preferred locale
}

# Create the provisioning policy body
$policyBody = @{
    "@odata.type" = "#microsoft.graph.cloudPcProvisioningPolicy"
    displayName = $policyName
    description = $policyDescription
    domainJoinConfigurations = @(
        $domainJoinConfig
    )
    imageId = $imageId
    imageType = $imageType
    imageDisplayName = $imageDisplayName
    enableSingleSignOn = $${sso ? 'true' : 'false'}
    windowsSetting = $windowsSettings
    provisioningType = "${provisioningType}"
${network === 'microsoft-hosted' ? `    microsoftManagedDesktop = @{
        managedType = "notManaged"
        profile = $null
    }` : ''}
}

# Create the provisioning policy
try {
    $policy = New-MgBetaDeviceManagementVirtualEndpointProvisioningPolicy -BodyParameter $policyBody
    Write-Host "✓ Provisioning policy created successfully!" -ForegroundColor Green
    Write-Host "  Policy ID: $($policy.Id)"
    Write-Host "  Policy Name: $($policy.DisplayName)"
} catch {
    Write-Error "Failed to create provisioning policy: $_"
}

# Assign the policy to a group (uncomment and modify as needed)
<#
$groupId = "<YOUR-ENTRA-GROUP-ID>"
$assignment = @{
    target = @{
        "@odata.type" = "#microsoft.graph.cloudPcManagementGroupAssignmentTarget"
        groupId = $groupId
    }
}
New-MgBetaDeviceManagementVirtualEndpointProvisioningPolicyAssignment -CloudPcProvisioningPolicyId $policy.Id -BodyParameter $assignment
Write-Host "✓ Policy assigned to group: $groupId"
#>

# Disconnect from Graph (optional)
# Disconnect-MgGraph`;

    // Graph API JSON
    const graphJson = {
        "@odata.type": "#microsoft.graph.cloudPcProvisioningPolicy",
        displayName: `W365-Policy-${new Date().toISOString().split('T')[0]}`,
        description: "Windows 365 provisioning policy",
        domainJoinConfigurations: [
            {
                domainJoinType: domainJoinType,
                ...(network === 'anc' 
                    ? { onPremisesConnectionId: "<YOUR-ANC-ID>" }
                    : { regionGroup: "US East", regionName: "" }
                )
            }
        ],
        imageId: image === 'custom' 
            ? "<YOUR-CUSTOM-IMAGE-ID>" 
            : "MicrosoftWindowsDesktop_windows-ent-cpc_win11-23h2-ent-cpc-m365",
        imageType: image === 'custom' ? "custom" : "gallery",
        imageDisplayName: image === 'custom' 
            ? "Custom Windows 11 Image" 
            : "Windows 11 Enterprise + Microsoft 365 Apps",
        enableSingleSignOn: sso,
        windowsSetting: {
            locale: "en-US"
        },
        provisioningType: provisioningType
    };

    const graphCode = `// Graph API - Create Provisioning Policy
// POST https://graph.microsoft.com/v1.0/deviceManagement/virtualEndpoint/provisioningPolicies
// 
// Required Permission: CloudPC.ReadWrite.All
// Content-Type: application/json

${JSON.stringify(graphJson, null, 2)}

// -------------------------------------------
// To assign the policy to a group, use:
// POST https://graph.microsoft.com/v1.0/deviceManagement/virtualEndpoint/provisioningPolicies/{policy-id}/assignments
// 
// {
//   "target": {
//     "@odata.type": "#microsoft.graph.cloudPcManagementGroupAssignmentTarget",
//     "groupId": "<YOUR-ENTRA-GROUP-ID>"
//   }
// }`;

    powershellContent.textContent = powershellCode;
    graphContent.textContent = graphCode;
}

// Generate Required URLs and Endpoints
function generateRequiredUrls() {
    const container = document.getElementById('requiredUrls');
    const network = state.selections.network;
    const identity = state.selections.identity;
    
    let html = '';
    
    // Core Windows 365 URLs
    html += `
        <div class="url-category">
            <h5><i class="fas fa-cloud"></i> Windows 365 Service (Required)</h5>
            <div class="url-list">
                <div class="url-item"><i class="fas fa-check"></i> *.wvd.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> *.prod.warm.ingest.monitor.core.windows.net <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> *.xt.cloudpc.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> *.cloudpc.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> windows365.microsoft.com <span class="port">443</span></div>
            </div>
        </div>
    `;
    
    // Entra ID URLs
    html += `
        <div class="url-category">
            <h5><i class="fas fa-shield-alt"></i> Microsoft Entra ID (Required)</h5>
            <div class="url-list">
                <div class="url-item"><i class="fas fa-check"></i> login.microsoftonline.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> login.windows.net <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> aadcdn.msftauth.net <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> enterpriseregistration.windows.net <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> device.login.microsoftonline.com <span class="port">443</span></div>
            </div>
        </div>
    `;
    
    // Intune URLs
    html += `
        <div class="url-category">
            <h5><i class="fas fa-cogs"></i> Microsoft Intune (Required)</h5>
            <div class="url-list">
                <div class="url-item"><i class="fas fa-check"></i> *.manage.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> enrollment.manage.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> portal.manage.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> config.office.com <span class="port">443</span></div>
            </div>
        </div>
    `;
    
    // RDP Connection URLs
    html += `
        <div class="url-category">
            <h5><i class="fas fa-desktop"></i> Remote Desktop Connection (Required)</h5>
            <div class="url-list">
                <div class="url-item"><i class="fas fa-check"></i> *.wvd.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> rdgateway*.wvd.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> rdbroker*.wvd.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> rdweb*.wvd.microsoft.com <span class="port">443</span></div>
            </div>
        </div>
    `;
    
    // Windows Update
    html += `
        <div class="url-category">
            <h5><i class="fas fa-sync-alt"></i> Windows Update (Required)</h5>
            <div class="url-list">
                <div class="url-item"><i class="fas fa-check"></i> *.update.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> *.windowsupdate.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> *.delivery.mp.microsoft.com <span class="port">443</span></div>
                <div class="url-item"><i class="fas fa-check"></i> tsfe.trafficshaping.dsp.mp.microsoft.com <span class="port">443</span></div>
            </div>
        </div>
    `;
    
    // Hybrid-specific
    if (identity === 'hybrid') {
        html += `
            <div class="url-category">
                <h5><i class="fas fa-server"></i> Hybrid Join Requirements (On-Premises)</h5>
                <div class="url-list">
                    <div class="url-item"><i class="fas fa-check"></i> Domain Controller (LDAP) <span class="port">389/636</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> Domain Controller (Kerberos) <span class="port">88</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> Domain Controller (DNS) <span class="port">53</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> Domain Controller (SMB) <span class="port">445</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> Global Catalog <span class="port">3268/3269</span></div>
                </div>
            </div>
        `;
    }
    
    // Defender
    if (state.selections.security.defender) {
        html += `
            <div class="url-category">
                <h5><i class="fas fa-shield-virus"></i> Microsoft Defender for Endpoint</h5>
                <div class="url-list">
                    <div class="url-item"><i class="fas fa-check"></i> *.securitycenter.windows.com <span class="port">443</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> *.security.microsoft.com <span class="port">443</span></div>
                    <div class="url-item"><i class="fas fa-check"></i> winatp-gw-*.microsoft.com <span class="port">443</span></div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Generate Licensing Requirements
function generateLicensingRequirements() {
    const container = document.getElementById('licensingRequirements');
    const license = state.selections.license;
    const identity = state.selections.identity;
    
    let licenses = [];
    
    // Base licenses always required
    if (license === 'enterprise' || license === 'frontline') {
        licenses.push({
            name: 'Windows 365 Enterprise',
            description: license === 'frontline' ? 'Frontline license' : 'Per-user license',
            icon: 'fa-cloud',
            required: true
        });
        
        licenses.push({
            name: 'Windows E3/E5',
            description: 'Or Windows A3/A5 for Education',
            icon: 'fa-windows',
            required: true
        });
        
        licenses.push({
            name: 'Microsoft Intune',
            description: 'Standalone or via EMS/M365',
            icon: 'fa-cogs',
            required: true
        });
        
        licenses.push({
            name: 'Entra ID P1',
            description: 'Included in M365 E3/E5',
            icon: 'fa-shield-alt',
            required: true
        });
    } else if (license === 'business') {
        licenses.push({
            name: 'Windows 365 Business',
            description: 'Per-user license (includes Entra & Intune)',
            icon: 'fa-cloud',
            required: true
        });
    }
    
    // Optional licenses
    if (state.selections.security.risk) {
        licenses.push({
            name: 'Entra ID P2',
            description: 'For risk-based Conditional Access',
            icon: 'fa-shield-alt',
            required: false
        });
    }
    
    if (state.selections.security.defender) {
        licenses.push({
            name: 'Defender for Endpoint',
            description: 'P1 or P2 for advanced protection',
            icon: 'fa-shield-virus',
            required: false
        });
    }
    
    let html = licenses.map(lic => `
        <div class="license-item ${lic.required ? 'required' : 'optional'}">
            <i class="fab ${lic.icon.includes('windows') ? 'fa-windows' : ''} fas ${!lic.icon.includes('windows') ? lic.icon : ''}"></i>
            <h5>${lic.name}</h5>
            <p>${lic.description}</p>
            <span class="license-badge">${lic.required ? 'Required' : 'Recommended'}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Switch code tabs
function switchCodeTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.code-tab[onclick*="${tab}"]`).classList.add('active');
    
    // Update code blocks
    document.getElementById('powershellCode').classList.toggle('hidden', tab !== 'powershell');
    document.getElementById('graphCode').classList.toggle('hidden', tab !== 'graph');
}

// Copy code to clipboard
async function copyCode(type) {
    const content = type === 'powershell' 
        ? document.getElementById('powershellContent').textContent
        : document.getElementById('graphContent').textContent;
    
    try {
        await navigator.clipboard.writeText(content);
        const btn = document.querySelector(`#${type}Code .copy-btn`);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// Export PowerShell script
function exportPowerShell() {
    const content = document.getElementById('powershellContent').textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Create-W365ProvisioningPolicy.ps1';
    a.click();
    URL.revokeObjectURL(url);
}

// Export full deployment package
function exportFullPackage() {
    const licenseNames = {
        'enterprise': 'Windows 365 Enterprise',
        'business': 'Windows 365 Business',
        'frontline': 'Windows 365 Frontline'
    };
    
    const identityNames = {
        'entra': 'Microsoft Entra ID Join',
        'hybrid': 'Hybrid Entra ID Join'
    };
    
    const networkNames = {
        'microsoft-hosted': 'Microsoft Hosted Network',
        'anc': 'Azure Network Connection'
    };
    
    const imageNames = {
        'gallery': 'Gallery Image',
        'custom': 'Custom Image'
    };
    
    // Build comprehensive markdown document
    let content = `# Windows 365 Deployment Package
Generated: ${new Date().toLocaleString()}

---

## Configuration Summary

| Setting | Value |
|---------|-------|
| License Type | ${licenseNames[state.selections.license]} |
| Identity | ${identityNames[state.selections.identity]} |
| Network | ${networkNames[state.selections.network]} |
| Image | ${imageNames[state.selections.image]} |
| Single Sign-On | ${state.selections.security.sso ? 'Enabled' : 'Disabled'} |

---

## Licensing Requirements

`;
    
    // Add licensing info
    if (state.selections.license === 'enterprise' || state.selections.license === 'frontline') {
        content += `### Required Licenses (per user)
- [ ] Windows 365 ${state.selections.license === 'frontline' ? 'Frontline' : 'Enterprise'} license
- [ ] Windows E3 or E5 (or Windows A3/A5 for Education)
- [ ] Microsoft Intune license
- [ ] Microsoft Entra ID P1

`;
    } else {
        content += `### Required Licenses (per user)
- [ ] Windows 365 Business license (includes Intune and Entra ID basic)

`;
    }
    
    // Add checklist
    content += `---

## Pre-Deployment Checklist

`;
    document.querySelectorAll('#deploymentChecklist .checklist-item').forEach(item => {
        const title = item.querySelector('.item-title').textContent;
        const note = item.querySelector('.item-note').textContent;
        const badge = item.querySelector('.badge').textContent;
        content += `- [ ] **${title}** (${badge})\n  - ${note}\n`;
    });
    
    // Add URLs
    content += `
---

## Required URLs & Endpoints

### Windows 365 Service
| URL | Port |
|-----|------|
| *.wvd.microsoft.com | 443 |
| *.prod.warm.ingest.monitor.core.windows.net | 443 |
| *.xt.cloudpc.microsoft.com | 443 |
| windows365.microsoft.com | 443 |

### Microsoft Entra ID
| URL | Port |
|-----|------|
| login.microsoftonline.com | 443 |
| login.windows.net | 443 |
| aadcdn.msftauth.net | 443 |
| enterpriseregistration.windows.net | 443 |

### Microsoft Intune
| URL | Port |
|-----|------|
| *.manage.microsoft.com | 443 |
| enrollment.manage.microsoft.com | 443 |
| portal.manage.microsoft.com | 443 |

`;

    if (state.selections.identity === 'hybrid') {
        content += `### On-Premises (Hybrid Join)
| Service | Port |
|---------|------|
| Domain Controller (LDAP) | 389/636 |
| Domain Controller (Kerberos) | 88 |
| Domain Controller (DNS) | 53 |
| Global Catalog | 3268/3269 |

`;
    }
    
    // Add PowerShell script
    content += `---

## Provisioning Policy Script

\`\`\`powershell
${document.getElementById('powershellContent').textContent}
\`\`\`

---

## Graph API Payload

\`\`\`json
${document.getElementById('graphContent').textContent}
\`\`\`

---

## Estimated Timeline

`;
    document.querySelectorAll('#timeline .timeline-item').forEach(item => {
        const title = item.querySelector('h5').textContent;
        const desc = item.querySelector('p').textContent;
        content += `### ${title}\n${desc}\n\n`;
    });

    content += `---

## Resources

- [Windows 365 Documentation](https://learn.microsoft.com/windows-365/)
- [Requirements](https://learn.microsoft.com/windows-365/enterprise/requirements)
- [Provisioning Policies](https://learn.microsoft.com/windows-365/enterprise/create-provisioning-policy)
- [Intune Admin Center](https://intune.microsoft.com)
- [Windows 365 Portal](https://windows365.microsoft.com)

---

*Generated by Windows 365 Deployment Guide*
`;

    // Download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'W365-Deployment-Package.md';
    a.click();
    URL.revokeObjectURL(url);
}
