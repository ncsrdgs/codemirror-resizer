/**
 * CodeMirror Resizer Extension
 * Adiciona funcionalidade de redimensionamento aos editores CodeMirror
 */

class CodeMirrorResizer {
    constructor() {
        this.isEnabled = true;
        this.fontSize = 14;
        this.observer = null;
        this.processedEditors = new WeakSet();
        
        this.init();
    }

    async init() {
        // Carrega configurações salvas
        await this.loadSettings();
        
        // Inicia a observação do DOM
        this.startObserver();
        
        // Processa editores existentes
        this.processExistingEditors();
        
        // Escuta mensagens do popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get(['enabled', 'fontSize']);
            this.isEnabled = settings.enabled !== false;
            this.fontSize = settings.fontSize || 14;
            this.applyFontSize();
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                enabled: this.isEnabled,
                fontSize: this.fontSize
            });
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getState':
                sendResponse({
                    enabled: this.isEnabled,
                    fontSize: this.fontSize
                });
                break;
                
            case 'toggleEnabled':
                this.isEnabled = request.enabled;
                this.saveSettings();
                this.toggleAllEditors();
                sendResponse({ success: true });
                break;
                
            case 'updateFontSize':
                this.fontSize = request.fontSize;
                this.saveSettings();
                this.applyFontSize();
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ error: 'Ação desconhecida' });
        }
    }

    startObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Aguarda o body estar disponível
        if (!document.body) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startObserver());
            } else {
                setTimeout(() => this.startObserver(), 100);
            }
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            this.processExistingEditors();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processExistingEditors() {
        if (!this.isEnabled) return;
        
        const codeMirrors = document.querySelectorAll('.CodeMirror');
        codeMirrors.forEach(cm => {
            if (!this.processedEditors.has(cm)) {
                this.addResizeHandle(cm);
                this.processedEditors.add(cm);
            }
        });
    }

    addResizeHandle(cm) {
        // Cria o handle de redimensionamento
        const resizeHandle = this.createResizeHandle();
        
        cm.style.position = 'relative';
        cm.appendChild(resizeHandle);
        
        // Adiciona funcionalidade de redimensionamento
        this.attachResizeHandlers(cm, resizeHandle);
    }

    createResizeHandle() {
        const handle = document.createElement('div');
        handle.className = 'codemirror-resize-handle';
        handle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: nwse-resize;
            background: linear-gradient(135deg, transparent 50%, #999 50%);
            z-index: 1000;
            opacity: 0.6;
            transition: opacity 0.2s;
        `;
        
        // Efeitos hover
        handle.addEventListener('mouseenter', () => {
            handle.style.opacity = '1';
        });
        
        handle.addEventListener('mouseleave', () => {
            handle.style.opacity = '0.6';
        });
        
        return handle;
    }

    attachResizeHandlers(cm, resizeHandle) {
        let isResizing = false;
        let startY, startHeight;
        
        const handleMouseDown = (e) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = cm.offsetHeight;
            e.preventDefault();
            e.stopPropagation();
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
        };
        
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaY = e.clientY - startY;
            const newHeight = Math.max(50, startHeight + deltaY);
            
            cm.style.height = `${newHeight}px`;
            
            if (cm.CodeMirror) {
                cm.CodeMirror.setSize(null, newHeight);
                cm.CodeMirror.refresh();
            }
        };
        
        const handleMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
            }
        };
        
        resizeHandle.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Cleanup quando o elemento for removido
        if (document.body) {
            const cleanupObserver = new MutationObserver((mutations) => {
                if (!document.body.contains(cm)) {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    cleanupObserver.disconnect();
                }
            });
            
            cleanupObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    toggleAllEditors() {
        const codeMirrors = document.querySelectorAll('.CodeMirror');
        
        codeMirrors.forEach(cm => {
            const handle = cm.querySelector('.codemirror-resize-handle');
            
            if (this.isEnabled) {
                if (!handle && !this.processedEditors.has(cm)) {
                    this.addResizeHandle(cm);
                    this.processedEditors.add(cm);
                } else if (handle) {
                    handle.style.display = 'block';
                }
            } else {
                if (handle) {
                    handle.style.display = 'none';
                }
            }
        });
    }

    applyFontSize() {
        // Remove estilo anterior se existir
        let styleElement = document.getElementById('codemirror-resizer-font-style');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Adiciona novo estilo
        styleElement = document.createElement('style');
        styleElement.id = 'codemirror-resizer-font-style';
        styleElement.textContent = `
            .CodeMirror {
                font-size: ${this.fontSize}px !important;
            }
            .CodeMirror * {
                font-size: ${this.fontSize}px !important;
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// Inicializa a extensão
const resizer = new CodeMirrorResizer();

console.log('✓ CodeMirror Resizer ativado!');