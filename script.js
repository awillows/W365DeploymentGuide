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
}

// Generate Executive Summary
function generateExecutiveSummary() {
    const container = document.getElementById('execSummary');
    
    const license = state.selections.license;
    const identity = state.selections.identity;
    const network = state.selections.network;
    const image = state.selections.image;
    const updates = state.selections.updates;
    const apps = state.selections.apps;
    const data = state.selections.data;
    
    // Determine complexity and timeline
    let complexity = 'Low';
    let timeline = '3-5 business days';
    let infrastructureReqs = 'Minimal';
    
    if (network === 'anc' || identity === 'hybrid' || image === 'custom') {
        complexity = 'Medium';
        timeline = '1-2 weeks';
        infrastructureReqs = 'Moderate';
    }
    if (network === 'anc' && identity === 'hybrid') {
        complexity = 'High';
        timeline = '2-4 weeks';
        infrastructureReqs = 'Significant';
    }
    
    const isStreamlined = identity === 'entra' && network === 'microsoft-hosted' && image === 'gallery';
    const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let html = `
        <div class="plan-meta">
            <span class="plan-date">Generated: ${generatedDate}</span>
        </div>

        <div class="plan-section">
            <h5>Overview</h5>
            <p>This document outlines the deployment plan for Windows 365 Cloud PCs within the organisation. 
            The selected configuration ${isStreamlined ? 'follows Microsoft\'s recommended streamlined approach, minimising infrastructure requirements and accelerating time-to-value' : 'has been tailored to meet specific organisational requirements'}.</p>
            
            <div class="plan-metrics">
                <div class="metric">
                    <span class="metric-label">Complexity</span>
                    <span class="metric-value ${complexity.toLowerCase()}">${complexity}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Est. Timeline</span>
                    <span class="metric-value">${timeline}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Infrastructure</span>
                    <span class="metric-value">${infrastructureReqs}</span>
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>1. Licensing</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${license === 'enterprise' ? 'Windows 365 Enterprise' : license === 'frontline' ? 'Windows 365 Frontline' : 'Windows 365 Business'}</strong>
                </div>
                <div class="decision-rationale">
                    ${license === 'enterprise' ? `
                        <p><strong>Why Enterprise:</strong> Provides full management capabilities through Microsoft Intune, supports both Microsoft Hosted Network and Azure Network Connection options, and enables custom image deployment. Requires existing Microsoft 365 E3/E5 or equivalent licensing.</p>
                        <p><strong>Prerequisites:</strong> Windows E3/E5 license, Microsoft Intune license, Microsoft Entra ID P1 (all typically included in Microsoft 365 E3/E5).</p>
                    ` : license === 'frontline' ? `
                        <p><strong>Why Frontline:</strong> Cost-effective option for shift workers and part-time employees who share Cloud PCs. Users access Cloud PCs on a rotating basis rather than having dedicated machines.</p>
                        <p><strong>Prerequisites:</strong> Windows E3/E5 license, Microsoft Intune license, Microsoft Entra ID P1. Frontline-specific license assignment.</p>
                    ` : `
                        <p><strong>Why Business:</strong> Simplified licensing model ideal for smaller organisations. Includes Entra ID and basic Intune capabilities without requiring separate licenses.</p>
                        <p><strong>Limitations:</strong> Maximum 300 users, Microsoft Hosted Network only, no custom images, limited management features compared to Enterprise.</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>2. Identity & Directory Services</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${identity === 'entra' ? 'Microsoft Entra ID Join (Cloud-Native)' : 'Hybrid Microsoft Entra ID Join'}</strong>
                    ${identity === 'entra' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${identity === 'entra' ? `
                        <p><strong>Why Entra ID Join:</strong> Cloud-native identity approach that eliminates dependency on on-premises Active Directory infrastructure. Cloud PCs are joined directly to Microsoft Entra ID.</p>
                        <p><strong>Benefits:</strong></p>
                        <ul>
                            <li>No line-of-sight to domain controllers required</li>
                            <li>Simplified deployment with Microsoft Hosted Network</li>
                            <li>Single Sign-On (SSO) to Microsoft 365 and Entra ID-integrated applications</li>
                            <li>Modern authentication with passwordless options</li>
                        </ul>
                        <p><strong>On-premises resource access:</strong> Entra ID Kerberos enables SSO to on-premises file shares and legacy applications without Hybrid Join. Requires Entra Connect with password hash synchronisation.</p>
                    ` : `
                        <p><strong>Why Hybrid Join:</strong> Cloud PCs are joined to both on-premises Active Directory and Microsoft Entra ID, maintaining compatibility with traditional infrastructure.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure Network Connection (ANC) is mandatory</li>
                            <li>Direct line-of-sight from Cloud PCs to Domain Controllers</li>
                            <li>Entra Connect configured with device writeback enabled</li>
                            <li>Network connectivity via VPN Gateway or ExpressRoute</li>
                        </ul>
                        <p><strong>Use cases:</strong> Required for Group Policy management, legacy NTLM authentication, or compliance requirements mandating domain membership.</p>
                        <p><strong>Consideration:</strong> Increases deployment complexity and creates dependency on on-premises infrastructure availability.</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>3. Network Configuration</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${network === 'microsoft-hosted' ? 'Microsoft Hosted Network' : 'Azure Network Connection (ANC)'}</strong>
                    ${network === 'microsoft-hosted' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${network === 'microsoft-hosted' ? `
                        <p><strong>Why Microsoft Hosted Network:</strong> Microsoft manages all network infrastructure. No Azure subscription or virtual network configuration required.</p>
                        <p><strong>Benefits:</strong></p>
                        <ul>
                            <li>Zero network infrastructure to deploy or maintain</li>
                            <li>Automatic regional optimisation for best performance</li>
                            <li>No Azure networking costs</li>
                            <li>Fastest path to deployment</li>
                        </ul>
                        <p><strong>Internet access:</strong> Cloud PCs access the internet directly through Microsoft's network. Corporate resources are accessed via the internet (SaaS applications, VPN client if needed).</p>
                    ` : `
                        <p><strong>Why Azure Network Connection:</strong> Cloud PCs are provisioned within your Azure Virtual Network, enabling direct access to Azure and on-premises resources.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure subscription with appropriate permissions</li>
                            <li>Azure Virtual Network with dedicated subnet (/26 minimum recommended)</li>
                            <li>Network connectivity to any required on-premises resources</li>
                            ${identity === 'hybrid' ? '<li>VPN Gateway or ExpressRoute for Domain Controller access</li>' : ''}
                        </ul>
                        <p><strong>Use cases:</strong> Direct access to Azure resources, on-premises connectivity without VPN client, compliance requirements for network isolation, or Hybrid Entra ID Join.</p>
                        <p><strong>Cost consideration:</strong> Azure networking costs apply (VNet, bandwidth, VPN Gateway if applicable).</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>4. Image Strategy</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${image === 'gallery' ? 'Microsoft Gallery Images' : 'Custom Images'}</strong>
                    ${image === 'gallery' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${image === 'gallery' ? `
                        <p><strong>Why Gallery Images:</strong> Pre-built, optimised images maintained by Microsoft. Always current with latest security updates.</p>
                        <p><strong>Available images:</strong></p>
                        <ul>
                            <li>Windows 11 Enterprise + Microsoft 365 Apps</li>
                            <li>Windows 11 Enterprise</li>
                            <li>Windows 10 Enterprise + Microsoft 365 Apps</li>
                            <li>Windows 10 Enterprise</li>
                        </ul>
                        <p><strong>Application deployment:</strong> Applications should be deployed via Microsoft Intune rather than baked into images. This approach provides centralised management, easier updates, and user self-service through Company Portal.</p>
                    ` : `
                        <p><strong>Why Custom Images:</strong> Organisation-specific images with pre-installed applications and configurations, stored in Azure Compute Gallery.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure subscription with Compute Gallery</li>
                            <li>Generation 2 VM image</li>
                            <li>Windows 10/11 Enterprise</li>
                            <li>Sysprep generalised</li>
                        </ul>
                        <p><strong>Maintenance:</strong> Custom images require regular updates to include Windows security patches. Recommend monthly image refresh cycle with testing before production deployment.</p>
                        <p><strong>Recommendation:</strong> Consider a hybrid approach—include only large or complex applications in the image, deploy remaining applications via Intune.</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>5. Update Management</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${updates === 'autopatch' ? 'Windows Autopatch' : updates === 'wufb' ? 'Windows Update for Business' : 'WSUS / Configuration Manager'}</strong>
                    ${updates === 'autopatch' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${updates === 'autopatch' ? `
                        <p><strong>Why Autopatch:</strong> Fully managed update service. Microsoft handles update deployment, ring progression, and rollback if issues detected.</p>
                        <p><strong>Coverage:</strong> Windows quality updates, Windows feature updates, Microsoft 365 Apps updates, Microsoft Edge updates, and Teams updates.</p>
                        <p><strong>Benefits:</strong></p>
                        <ul>
                            <li>Automated ring-based deployment (Test → First → Fast → Broad)</li>
                            <li>Built-in rollback capabilities</li>
                            <li>Service health monitoring and reporting</li>
                            <li>Minimal IT overhead</li>
                        </ul>
                    ` : updates === 'wufb' ? `
                        <p><strong>Why Windows Update for Business:</strong> Cloud-based update management with customisable deployment rings and deferral periods.</p>
                        <p><strong>Configuration:</strong></p>
                        <ul>
                            <li>Define update rings in Intune (e.g., Pilot, Production)</li>
                            <li>Set quality update deferral periods</li>
                            <li>Set feature update deferral periods</li>
                            <li>Configure maintenance windows</li>
                        </ul>
                        <p><strong>Consideration:</strong> Requires ongoing management and monitoring. Consider Windows Autopatch for reduced operational overhead.</p>
                    ` : `
                        <p><strong>Why WSUS/ConfigMgr:</strong> Traditional update management using existing on-premises infrastructure.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure Network Connection for WSUS server access</li>
                            <li>ConfigMgr co-management if using Configuration Manager</li>
                            <li>Existing WSUS/ConfigMgr infrastructure</li>
                        </ul>
                        <p><strong>Consideration:</strong> This approach maintains existing processes but adds complexity. Consider migrating to Windows Update for Business or Autopatch for cloud-native management.</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>6. Application Delivery</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${apps === 'intune' ? 'Microsoft Intune' : apps === 'intune-image' ? 'Intune + Custom Image' : 'Configuration Manager / Co-management'}</strong>
                    ${apps === 'intune' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${apps === 'intune' ? `
                        <p><strong>Why Intune:</strong> Cloud-native application management with support for multiple application types and deployment scenarios.</p>
                        <p><strong>Supported application types:</strong></p>
                        <ul>
                            <li>Microsoft 365 Apps (built-in deployment)</li>
                            <li>Win32 applications (.intunewin packages)</li>
                            <li>Microsoft Store apps</li>
                            <li>Line-of-business applications</li>
                            <li>Web links and PWAs</li>
                        </ul>
                        <p><strong>User experience:</strong> Company Portal provides self-service application installation. Required apps install automatically during or after provisioning.</p>
                    ` : apps === 'intune-image' ? `
                        <p><strong>Why Hybrid Approach:</strong> Large or complex applications pre-installed in custom image, remaining applications deployed via Intune.</p>
                        <p><strong>Image candidates:</strong></p>
                        <ul>
                            <li>Large applications (>5GB) to reduce provisioning time</li>
                            <li>Applications with complex dependencies</li>
                            <li>Applications requiring specific install sequences</li>
                        </ul>
                        <p><strong>Intune deployment:</strong> Smaller applications, frequently updated software, and user-requested applications via Company Portal.</p>
                    ` : `
                        <p><strong>Why Configuration Manager:</strong> Continue using existing ConfigMgr infrastructure through co-management.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure Network Connection for ConfigMgr infrastructure access</li>
                            <li>Co-management enabled</li>
                            <li>Cloud Management Gateway (recommended)</li>
                        </ul>
                        <p><strong>Consideration:</strong> Co-management allows gradual migration to Intune. Consider shifting application workload to Intune over time.</p>
                    `}
                </div>
            </div>
        </div>

        <div class="plan-section">
            <h5>7. User Data & Storage</h5>
            <div class="decision-box">
                <div class="decision-choice">
                    <strong>${data === 'onedrive' ? 'OneDrive for Business' : data === 'hybrid-storage' ? 'OneDrive + Network File Shares' : 'Traditional File Shares'}</strong>
                    ${data === 'onedrive' ? '<span class="badge badge-recommended">Recommended</span>' : ''}
                </div>
                <div class="decision-rationale">
                    ${data === 'onedrive' ? `
                        <p><strong>Why OneDrive:</strong> Cloud-native storage with automatic sync, backup, and cross-device access.</p>
                        <p><strong>Key features:</strong></p>
                        <ul>
                            <li>Known Folder Move (Desktop, Documents, Pictures automatically synced)</li>
                            <li>Files On-Demand (access files without downloading)</li>
                            <li>Version history and ransomware recovery</li>
                            <li>Seamless roaming between devices</li>
                        </ul>
                        <p><strong>Configuration:</strong> Deploy OneDrive sync client settings via Intune. Enable Known Folder Move silently to ensure user data is protected.</p>
                    ` : data === 'hybrid-storage' ? `
                        <p><strong>Why Hybrid:</strong> OneDrive for user data combined with traditional file shares for departmental or shared data.</p>
                        <p><strong>OneDrive:</strong> Personal files, Desktop, Documents via Known Folder Move.</p>
                        <p><strong>File shares:</strong> Shared departmental data, legacy application data stores.</p>
                        <p><strong>Access method:</strong> ${identity === 'entra' ? 'Entra ID Kerberos enables SSO to on-premises file shares without Hybrid Join.' : 'Direct access via Azure Network Connection.'}</p>
                    ` : `
                        <p><strong>Why File Shares:</strong> Continue using existing file server infrastructure.</p>
                        <p><strong>Requirements:</strong></p>
                        <ul>
                            <li>Azure Network Connection for file server access</li>
                            <li>Appropriate network connectivity and DNS resolution</li>
                            ${identity === 'hybrid' ? '<li>Domain membership for authentication</li>' : '<li>Entra ID Kerberos or mapped drives with saved credentials</li>'}
                        </ul>
                        <p><strong>Recommendation:</strong> Consider migrating to OneDrive for user data to enable seamless roaming and reduce infrastructure dependency.</p>
                    `}
                </div>
            </div>
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
// Legacy function stubs - removed to simplify summary
function generateConfigSummary() {}
function generateNextSteps() {}

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
function generateChecklist() {}
function generateTimeline() {}
function generateRequiredUrls() {}
function generateLicensingRequirements() {}
function generateProvisioningPolicyCode() {}

// Export deployment plan to PDF
function exportToPDF() {
    // Get the summary section to export
    const summaryContainer = document.querySelector('.summary-container');
    
    if (!summaryContainer) {
        alert('Please complete the wizard first to generate a deployment plan.');
        return;
    }
    
    // Create a wrapper for PDF export
    const wrapper = document.createElement('div');
    wrapper.id = 'pdf-wrapper';
    
    // Add print-specific styles
    const styles = document.createElement('style');
    styles.textContent = `
        #pdf-wrapper {
            background: white;
            padding: 20px 30px;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #333;
            width: 190mm;
        }
        #pdf-wrapper .pdf-title {
            text-align: center;
            border-bottom: 3px solid #0078d4;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        #pdf-wrapper .pdf-title h1 {
            color: #0078d4;
            font-size: 22px;
            margin: 0;
        }
        #pdf-wrapper .summary-section {
            margin-bottom: 20px;
            border: none;
            box-shadow: none;
        }
        #pdf-wrapper .summary-section h4 {
            display: none;
        }
        #pdf-wrapper .plan-section {
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
            page-break-inside: avoid;
        }
        #pdf-wrapper .plan-section h5 {
            color: #0078d4;
            font-size: 13px;
            margin-bottom: 8px;
        }
        #pdf-wrapper .decision-box {
            background: #f8f8f8;
            padding: 12px;
            border-left: 3px solid #0078d4;
            border-radius: 4px;
        }
        #pdf-wrapper .decision-choice {
            font-weight: 600;
            font-size: 12px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }
        #pdf-wrapper .decision-rationale {
            font-size: 11px;
            line-height: 1.5;
        }
        #pdf-wrapper .decision-rationale p {
            margin: 6px 0;
        }
        #pdf-wrapper .decision-rationale ul {
            margin: 6px 0 6px 15px;
            padding: 0;
        }
        #pdf-wrapper .decision-rationale li {
            margin-bottom: 3px;
        }
        #pdf-wrapper .plan-metrics {
            display: flex;
            gap: 20px;
            background: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        #pdf-wrapper .metric-label {
            font-size: 9px;
            color: #666;
        }
        #pdf-wrapper .metric-value {
            font-size: 12px;
            font-weight: 600;
        }
        #pdf-wrapper .badge-recommended {
            background: #107c10;
            color: white;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 8px;
        }
        #pdf-wrapper .architecture-diagram {
            background: #fafafa;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
            page-break-before: always;
        }
        #pdf-wrapper .architecture-diagram svg {
            max-width: 100%;
            height: auto;
        }
        #pdf-wrapper .arch-title {
            color: #0078d4;
            font-size: 16px;
            margin: 20px 0 10px 0;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
        #pdf-wrapper .pdf-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #888;
        }
    `;
    wrapper.appendChild(styles);
    
    // Add title
    const title = document.createElement('div');
    title.className = 'pdf-title';
    title.innerHTML = '<h1>Windows 365 Deployment Plan</h1>';
    wrapper.appendChild(title);
    
    // Clone and add the executive summary
    const execSummary = document.getElementById('execSummary');
    if (execSummary) {
        const summaryClone = execSummary.cloneNode(true);
        wrapper.appendChild(summaryClone);
    }
    
    // Add architecture title
    const archTitle = document.createElement('h2');
    archTitle.className = 'arch-title';
    archTitle.textContent = 'Architecture Overview';
    wrapper.appendChild(archTitle);
    
    // Clone and add the diagram
    const diagram = document.getElementById('summaryDiagram');
    if (diagram) {
        const diagramClone = diagram.cloneNode(true);
        diagramClone.className = 'architecture-diagram';
        wrapper.appendChild(diagramClone);
    }
    
    // Add footer
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.textContent = 'Generated using the Windows 365 Deployment Guide';
    wrapper.appendChild(footer);
    
    // Append to body for rendering
    document.body.appendChild(wrapper);
    
    // Use html2pdf
    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'W365-Deployment-Plan.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    // Small delay to ensure rendering
    setTimeout(() => {
        html2pdf().from(wrapper).set(opt).save().then(() => {
            document.body.removeChild(wrapper);
        }).catch(err => {
            console.error('PDF error:', err);
            document.body.removeChild(wrapper);
            // Fallback to print
            window.print();
        });
    }, 500);
}

// Legacy export function (kept for compatibility)
function exportSummary() {
    exportToPDF();
}

// Legacy print function (kept for compatibility)
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
