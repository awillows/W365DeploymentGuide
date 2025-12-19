// Windows 365 Deployment Guide - Interactive Script

// State Management
const state = {
    currentStep: 1,
    totalSteps: 8,
    selections: {
        license: null,
        identity: null,
        network: null,
        image: null,
        updates: null,
        apps: null,
        data: null
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeWizard();
    initializeOptionCards();
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
                    // Update considerations panel
                    updateConsiderations('image', value);
                    break;
                case 'step5':
                    state.selections.updates = value;
                    // Update considerations panel
                    updateConsiderations('updates', value);
                    break;
                case 'step6':
                    state.selections.apps = value;
                    // Update considerations panel
                    updateConsiderations('apps', value);
                    break;
                case 'step7':
                    state.selections.data = value;
                    // Update considerations panel
                    updateConsiderations('data', value);
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
        case 5:
            if (!state.selections.updates) {
                showValidationMessage('Please select an update management strategy');
                return false;
            }
            break;
        case 6:
            if (!state.selections.apps) {
                showValidationMessage('Please select an app deployment strategy');
                return false;
            }
            break;
        case 7:
            if (!state.selections.data) {
                showValidationMessage('Please select a user data strategy');
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
    generateExecutiveSummary();
    generateSummaryDiagram();
    generateConfigSummary();
    generateNextSteps();
    generateProvisioningPolicyCode();
}

// Generate Executive Summary
function generateExecutiveSummary() {
    const container = document.getElementById('execSummary');
    
    const licenseNames = {
        'enterprise': 'Windows 365 Enterprise',
        'business': 'Windows 365 Business',
        'frontline': 'Windows 365 Frontline'
    };
    
    const identityDesc = {
        'entra': 'cloud-native Microsoft Entra ID Join',
        'hybrid': 'Hybrid Entra ID Join with on-premises AD integration'
    };
    
    const networkDesc = {
        'microsoft-hosted': 'Microsoft Hosted Network (no Azure infrastructure required)',
        'anc': 'Azure Network Connection (custom networking with your Azure VNet)'
    };
    
    const imageDesc = {
        'gallery': 'Microsoft Gallery images (pre-configured, auto-updated)',
        'custom': 'Custom images from your Azure Compute Gallery'
    };
    
    const updateDesc = {
        'autopatch': 'Windows Autopatch for fully automated update management',
        'wufb': 'Windows Update for Business with custom ring deployment',
        'wsus': 'WSUS/SCCM for traditional update management'
    };
    
    // Determine complexity
    let complexity = 'Simple';
    let complexityIcon = 'fa-smile';
    let complexityClass = 'recommended';
    
    if (state.selections.network === 'anc' || state.selections.identity === 'hybrid' || state.selections.image === 'custom') {
        complexity = 'Moderate';
        complexityIcon = 'fa-meh';
        complexityClass = '';
    }
    if (state.selections.network === 'anc' && state.selections.identity === 'hybrid') {
        complexity = 'Complex';
        complexityIcon = 'fa-frown';
        complexityClass = '';
    }
    
    // Estimate timeline
    let timeline = '3-5 days';
    if (complexity === 'Moderate') timeline = '1-2 weeks';
    if (complexity === 'Complex') timeline = '2-4 weeks';
    
    const isRecommended = state.selections.identity === 'entra' && 
                          state.selections.network === 'microsoft-hosted' && 
                          state.selections.image === 'gallery' &&
                          state.selections.updates === 'autopatch';
    
    let html = `
        <p>This deployment plan uses <strong>${licenseNames[state.selections.license]}</strong> with ${identityDesc[state.selections.identity]}. 
        Cloud PCs will connect via ${networkDesc[state.selections.network]} and use ${imageDesc[state.selections.image]}.</p>
    `;
    
    if (isRecommended) {
        html += `
            <div class="highlight-box recommended">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Streamlined Configuration</strong><br>
                    You've selected Microsoft's recommended approach for the fastest, simplest deployment with minimal infrastructure requirements.
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="highlight-box">
            <i class="fas fa-clock"></i>
            <div>
                <strong>Estimated Timeline: ${timeline}</strong><br>
                Deployment complexity: ${complexity}
            </div>
        </div>
        
        <div class="config-tags">
            <span class="config-tag">${state.selections.identity === 'entra' ? 'Entra ID Join' : 'Hybrid Join'}</span>
            <span class="config-tag">${state.selections.network === 'microsoft-hosted' ? 'Microsoft Hosted' : 'Azure Network'}</span>
            <span class="config-tag secondary">${state.selections.image === 'gallery' ? 'Gallery Image' : 'Custom Image'}</span>
            <span class="config-tag secondary">${updateDesc[state.selections.updates]?.split(' ')[0] || 'Updates'}</span>
        </div>
    `;
    
    container.innerHTML = html;
}

// Generate Summary Architecture Diagram
function generateSummaryDiagram() {
    const container = document.getElementById('summaryDiagram');
    
    const identity = state.selections.identity;
    const network = state.selections.network;
    const image = state.selections.image;
    const updates = state.selections.updates;
    const apps = state.selections.apps;
    const data = state.selections.data;
    
    let diagram = `graph LR
    subgraph "Users"
        U[("👤 Users")]
    end
    
    subgraph "Access"
        WA["Windows App<br/>Web/Desktop"]
    end
    
    subgraph "Windows 365"
        CPC["☁️ Cloud PC"]
    end
    
    subgraph "Identity"
        ${identity === 'entra' ? 'ENTRA["Microsoft<br/>Entra ID"]' : 'ENTRA["Microsoft<br/>Entra ID"]\n        AD["On-Premises<br/>Active Directory"]'}
    end
    
    subgraph "Management"
        INTUNE["Microsoft<br/>Intune"]
        ${updates === 'autopatch' ? 'AP["Windows<br/>Autopatch"]' : updates === 'wufb' ? 'WUFB["Windows Update<br/>for Business"]' : 'WSUS["WSUS/SCCM"]'}
    end
    
    ${network === 'anc' ? `subgraph "Azure Network"
        VNET["Azure VNet"]
        ${identity === 'hybrid' ? 'VPN["VPN/ExpressRoute"]' : ''}
    end` : ''}
    
    ${data === 'onedrive' ? `subgraph "Data"
        OD["OneDrive for<br/>Business"]
    end` : data === 'hybrid-storage' ? `subgraph "Data"
        OD["OneDrive"]
        FS["File Shares"]
    end` : ''}
    
    U --> WA
    WA --> CPC
    CPC --> ENTRA
    ${identity === 'hybrid' ? 'CPC --> AD' : ''}
    ${network === 'anc' ? 'CPC --> VNET' : ''}
    ${network === 'anc' && identity === 'hybrid' ? 'VNET --> VPN\n    VPN --> AD' : ''}
    INTUNE --> CPC
    ${updates === 'autopatch' ? 'AP --> CPC' : updates === 'wufb' ? 'WUFB --> CPC' : 'WSUS --> CPC'}
    ${data === 'onedrive' || data === 'hybrid-storage' ? 'CPC --> OD' : ''}
    ${data === 'hybrid-storage' ? 'CPC --> FS' : ''}
    
    style CPC fill:#0078d4,color:#fff
    style ENTRA fill:#00a4ef,color:#fff
    style INTUNE fill:#00a4ef,color:#fff
    ${updates === 'autopatch' ? 'style AP fill:#107c10,color:#fff' : ''}`;
    
    // Clear and re-render with Mermaid
    container.innerHTML = '';
    container.removeAttribute('data-processed');
    
    const diagramDiv = document.createElement('div');
    diagramDiv.className = 'mermaid';
    diagramDiv.textContent = diagram;
    container.appendChild(diagramDiv);
    
    // Re-render mermaid
    if (typeof mermaid !== 'undefined') {
        try {
            mermaid.init(undefined, diagramDiv);
        } catch (e) {
            console.log('Mermaid diagram error:', e);
            // Fallback: show a simple text representation
            container.innerHTML = `
                <div class="diagram-fallback">
                    <div class="diagram-flow">
                        <span class="diagram-node">👤 Users</span>
                        <span class="diagram-arrow">→</span>
                        <span class="diagram-node">Windows App</span>
                        <span class="diagram-arrow">→</span>
                        <span class="diagram-node highlight">☁️ Cloud PC</span>
                        <span class="diagram-arrow">→</span>
                        <span class="diagram-node">${identity === 'entra' ? 'Entra ID' : 'Hybrid AD'}</span>
                    </div>
                    <div class="diagram-management">
                        <span class="diagram-label">Managed by:</span>
                        <span class="diagram-node small">Intune</span>
                        <span class="diagram-node small">${updates === 'autopatch' ? 'Autopatch' : updates === 'wufb' ? 'WUfB' : 'WSUS'}</span>
                        ${data === 'onedrive' || data === 'hybrid-storage' ? '<span class="diagram-node small">OneDrive</span>' : ''}
                    </div>
                </div>
            `;
        }
    }
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
    
    const updateNames = {
        'autopatch': 'Windows Autopatch',
        'wufb': 'Windows Update for Business',
        'wsus': 'WSUS / Legacy'
    };
    
    const appNames = {
        'intune': 'Microsoft Intune',
        'intune-image': 'Intune + Custom Image',
        'sccm': 'SCCM / Co-management'
    };
    
    const dataNames = {
        'onedrive': 'OneDrive for Business',
        'hybrid-storage': 'Hybrid (OneDrive + File Shares)',
        'fileshares': 'Traditional File Shares'
    };
    
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
            <label>Updates</label>
            <div class="value">${updateNames[state.selections.updates] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>App Deployment</label>
            <div class="value">${appNames[state.selections.apps] || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <label>User Data</label>
            <div class="value">${dataNames[state.selections.data] || 'Not selected'}</div>
        </div>
    `;
}

// Generate Next Steps
function generateNextSteps() {
    const container = document.getElementById('nextSteps');
    const steps = [];
    
    // Step 1: Always create user group
    steps.push({
        title: 'Create Entra ID User Group',
        description: 'Create a security group for your Cloud PC users',
        link: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups'
    });
    
    // Step 2: Network (if ANC)
    if (state.selections.network === 'anc') {
        steps.push({
            title: 'Configure Azure Network Connection',
            description: 'Set up VNet and create the Azure Network Connection',
            link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/w365AzureNetworkConnection'
        });
    }
    
    // Step 3: Image (if custom)
    if (state.selections.image === 'custom') {
        steps.push({
            title: 'Upload Custom Image',
            description: 'Add your custom image to Device Images',
            link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/w365DeviceImage'
        });
    }
    
    // Step 4: Create provisioning policy
    steps.push({
        title: 'Create Provisioning Policy',
        description: 'Configure and create your Cloud PC provisioning policy',
        link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/w365ProvisionPolicy'
    });
    
    // Step 5: User settings
    steps.push({
        title: 'Configure User Settings',
        description: 'Set local admin rights, restore points, and other user settings',
        link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/w365UserSettings'
    });
    
    // Step 6: App deployment (if Intune)
    if (state.selections.apps === 'intune' || state.selections.apps === 'intune-image') {
        steps.push({
            title: 'Configure App Deployment',
            description: 'Package and assign apps in Intune',
            link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/AppsMenu/~/windowsApps'
        });
    }
    
    // Step 7: Update management
    if (state.selections.updates === 'autopatch') {
        steps.push({
            title: 'Enable Windows Autopatch',
            description: 'Configure Autopatch for automated update management',
            link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/windowsAutopatch'
        });
    } else if (state.selections.updates === 'wufb') {
        steps.push({
            title: 'Configure Update Rings',
            description: 'Create Windows Update for Business policies',
            link: 'https://intune.microsoft.com/#view/Microsoft_Intune_DeviceSettings/DevicesWindowsMenu/~/windowsUpdateRings'
        });
    }
    
    container.innerHTML = steps.map((step, index) => `
        <div class="next-step-item">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
                <div class="step-title">${step.title}</div>
                <div class="step-description">${step.description}</div>
            </div>
            <a href="${step.link}" target="_blank" class="step-link">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `).join('');
}

// Toggle collapsible section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const icon = document.getElementById(sectionId + 'Icon');
    
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        icon.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('collapsed');
        icon.style.transform = 'rotate(0deg)';
    }
}

// Legacy function stubs for compatibility
function generateChecklist() {
    // Removed - functionality replaced by generateNextSteps
}

function generateTimeline() {
    // Removed - functionality replaced by executive summary
}

function generateRequiredUrls() {
    // Removed - simplified summary page
}

function generateLicensingRequirements() {
    // Removed - info included in executive summary
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
    
    content += `\n## Next Steps\n\n`;
    document.querySelectorAll('#nextSteps .next-step-item').forEach((item, index) => {
        const title = item.querySelector('.step-title').textContent;
        const desc = item.querySelector('.step-description').textContent;
        content += `${index + 1}. **${title}** - ${desc}\n`;
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
    
    const updateNames = {
        'autopatch': 'Windows Autopatch',
        'wufb': 'Windows Update for Business',
        'wsus': 'WSUS / Legacy'
    };
    
    const appNames = {
        'intune': 'Microsoft Intune',
        'intune-image': 'Intune + Custom Image',
        'sccm': 'SCCM / Co-management'
    };
    
    const dataNames = {
        'onedrive': 'OneDrive for Business',
        'hybrid-storage': 'Hybrid (OneDrive + File Shares)',
        'fileshares': 'Traditional File Shares'
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
| Updates | ${updateNames[state.selections.updates]} |
| App Deployment | ${appNames[state.selections.apps]} |
| User Data | ${dataNames[state.selections.data]} |

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
