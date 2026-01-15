/**
 * Popup Controller
 * Gerencia a interface do popup da extensão
 */

class PopupController {
    constructor() {
        this.toggleEnabled = document.getElementById('toggleEnabled');
        this.fontSize = document.getElementById('fontSize');
        this.status = document.getElementById('status');
        
        this.init();
    }

    async init() {
        // Carrega o estado atual
        await this.loadCurrentState();
        
        // Adiciona event listeners
        this.attachEventListeners();
    }

    async loadCurrentState() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Verifica se a URL permite content scripts
            if (tab.url && (tab.url.startsWith('chrome://') || 
                           tab.url.startsWith('about:') || 
                           tab.url.startsWith('edge://') ||
                           tab.url.startsWith('chrome-extension://'))) {
                this.updateStatus('Página não suportada', 'inactive');
                this.loadFromStorage();
                return;
            }
            
            chrome.tabs.sendMessage(tab.id, { action: 'getState' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('Content script não disponível, carregando do storage');
                    this.loadFromStorage();
                    this.updateStatus('Recarregue a página', 'inactive');
                    return;
                }
                
                if (response) {
                    this.toggleEnabled.checked = response.enabled;
                    this.fontSize.value = response.fontSize;
                    this.updateStatus(
                        response.enabled ? 'Extensão Ativa' : 'Extensão Desativada',
                        response.enabled ? 'active' : 'inactive'
                    );
                } else {
                    this.loadFromStorage();
                }
            });
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
            this.loadFromStorage();
            this.updateStatus('Configurações carregadas', 'inactive');
        }
    }

    async loadFromStorage() {
        try {
            const settings = await chrome.storage.sync.get(['enabled', 'fontSize']);
            this.toggleEnabled.checked = settings.enabled !== false;
            this.fontSize.value = settings.fontSize || 14;
        } catch (error) {
            console.error('Erro ao carregar do storage:', error);
        }
    }

    attachEventListeners() {
        // Toggle de ativação
        this.toggleEnabled.addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            await this.sendMessage('toggleEnabled', { enabled });
            this.updateStatus(
                enabled ? 'Extensão Ativa' : 'Extensão Desativada',
                enabled ? 'active' : 'inactive'
            );
        });

        // Mudança de fonte
        this.fontSize.addEventListener('input', async (e) => {
            const fontSize = parseInt(e.target.value, 10);
            if (fontSize >= 8 && fontSize <= 32) {
                await this.sendMessage('updateFontSize', { fontSize });
            }
        });

        // Validação do campo de fonte
        this.fontSize.addEventListener('blur', (e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value) || value < 8) {
                value = 8;
            } else if (value > 32) {
                value = 32;
            }
            e.target.value = value;
        });
    }

    async sendMessage(action, data) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Verifica se a URL permite content scripts
            if (tab.url && (tab.url.startsWith('chrome://') || 
                           tab.url.startsWith('about:') || 
                           tab.url.startsWith('edge://') ||
                           tab.url.startsWith('chrome-extension://'))) {
                // Salva no storage mesmo sem content script ativo
                await this.saveToStorage(data);
                return;
            }
            
            chrome.tabs.sendMessage(tab.id, { action, ...data }, async (response) => {
                if (chrome.runtime.lastError) {
                    console.log('Content script não respondeu, salvando no storage');
                    await this.saveToStorage(data);
                    return;
                }
                
                if (response && response.error) {
                    console.error('Erro na resposta:', response.error);
                }
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            await this.saveToStorage(data);
        }
    }

    async saveToStorage(data) {
        try {
            if (data.enabled !== undefined) {
                await chrome.storage.sync.set({ enabled: data.enabled });
            }
            if (data.fontSize !== undefined) {
                await chrome.storage.sync.set({ fontSize: data.fontSize });
            }
        } catch (error) {
            console.error('Erro ao salvar no storage:', error);
        }
    }

    updateStatus(message, className) {
        this.status.textContent = message;
        this.status.className = `status ${className}`;
    }
}

// Inicializa o controller quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
