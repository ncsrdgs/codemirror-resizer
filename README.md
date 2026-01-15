# CodeMirror Resizer

Uma extensão do Chrome que permite redimensionar editores CodeMirror com o mouse e personalizar o tamanho da fonte.

## ✨ Funcionalidades

- 🖱️ **Redimensionamento com Mouse**: Arraste o canto inferior direito dos editores CodeMirror para ajustar a altura
- 🎛️ **Controle de Fonte**: Ajuste o tamanho da fonte (8-32px) através do popup
- 🔄 **Toggle de Ativação**: Ative ou desative a extensão facilmente
- 💾 **Configurações Persistentes**: Suas preferências são salvas automaticamente
- 🎨 **Interface Moderna**: Popup com design elegante e intuitivo

## 📦 Instalação

### Instalação Manual (Modo Desenvolvedor)

1. Clone ou baixe este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto

## 🚀 Como Usar

1. **Redimensionar Editores**:
   - Navegue até uma página com editores CodeMirror
   - Passe o mouse no canto inferior direito do editor
   - Clique e arraste para redimensionar

2. **Ajustar Configurações**:
   - Clique no ícone da extensão na barra de ferramentas
   - Use o toggle para ativar/desativar
   - Ajuste o tamanho da fonte conforme necessário

## 🛠️ Tecnologias

- JavaScript (ES6+)
- Chrome Extension Manifest V3
- Chrome Storage API
- MutationObserver API

## 📁 Estrutura do Projeto

```
codemirror-resizer/
├── manifest.json      # Configuração da extensão
├── content.js         # Script injetado nas páginas
├── popup.html         # Interface do popup
├── popup.js           # Lógica do popup
├── logo.svg           # Ícone da extensão
└── README.md          # Este arquivo
```

## 🔧 Desenvolvimento

### Arquivos Principais

- **content.js**: Classe `CodeMirrorResizer` que gerencia a funcionalidade principal
- **popup.js**: Classe `PopupController` que controla a interface do usuário
- **manifest.json**: Configuração da extensão (permissões, scripts, ícones)

### Melhorias Futuras

- [ ] Suporte a temas customizados
- [ ] Atalhos de teclado
- [ ] Mais opções de personalização
- [ ] Suporte a outros editores de código

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📧 Contato

Se tiver dúvidas ou sugestões, abra uma issue no repositório.

---

Desenvolvido com ❤️ para melhorar a experiência com CodeMirror
