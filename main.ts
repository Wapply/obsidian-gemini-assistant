import { App, Notice, Plugin, Editor, MarkdownView, PluginSettingTab, Setting } from 'obsidian';

interface ObsidianGeminiAssistantSettings {
  apiKey: string;
  // ... otras opciones de configuración en el futuro
}

const DEFAULT_SETTINGS: ObsidianGeminiAssistantSettings = {
  apiKey: '', 
};

export default class ObsidianGeminiAssistantPlugin extends Plugin {
  settings: ObsidianGeminiAssistantSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'gemini-generate',
      name: 'Gemini: Generar texto',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const selectedText = editor.getSelection();
        if (!selectedText) {
          new Notice('Selecciona un texto primero.');
          return;
        }
        this.generateWithGemini(selectedText, editor);
      },
    });

    this.addSettingTab(new ObsidianGeminiAssistantSettingTab(this.app, this));
  }

  onunload() {}

  async generateWithGemini(text: string, editor: Editor) {
    const context = this.getContext(editor); 

    try {
      // Simula una respuesta de una API de Gemini (reemplazar con la lógica real)
      const simulatedResponse = {
        generated_text: `## Respuesta de Gemini (simulada)\n\nBasado en el texto: "${text}"\n\nY en el contexto: "${context}"`,
      };

      const generatedText = simulatedResponse.generated_text; 
      editor.replaceSelection(generatedText); 

    } catch (error) {
      new Notice(`Error al generar texto con Gemini: ${error.message}`);
    }
  }

  getContext(editor: Editor): string {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return ''; // Asegurarse de que estamos en una vista de Markdown

    const file = view.file;
    if (!file) return '';

    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return '';

    // Obtener el título
    let context = `Título de la nota: "${cache.frontmatter?.title || file.basename}"`; 

    // Agregar etiquetas, si existen
    if (cache.frontmatter?.tags) {
      context += `, Etiquetas: "${cache.frontmatter.tags.join(', ')}"`;
    }

    // Ejemplo: agregar el párrafo actual al contexto
    const lineNumber = editor.getCursor().line;
    const paragraph = editor.getLine(lineNumber);
    context += `, Párrafo actual: "${paragraph}"`;

    return context;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// Clase para la pestaña de configuración
class ObsidianGeminiAssistantSettingTab extends PluginSettingTab {
    plugin: ObsidianGeminiAssistantPlugin;
  
    constructor(app: App, plugin: ObsidianGeminiAssistantPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
  
    display(): void {
      const {containerEl} = this;
      containerEl.empty();
  
      containerEl.createEl('h2', {text: 'Configuración de Obsidian Gemini Assistant'});
  
      new Setting(containerEl)
        .setName('API Token de Gemini')
        .setDesc('Ingresa tu clave de API para acceder a Gemini.')
        .addText((text) => 
          text
            .setPlaceholder('Ingresa tu API Token aquí')
            .setValue(this.plugin.settings.apiKey)
            .onChange(async (value) => {
              this.plugin.settings.apiKey = value;
              await this.plugin.saveSettings();
            })
        );
    }
  }