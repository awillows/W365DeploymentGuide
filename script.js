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
